var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var locations = require('../locations.json');
var async = require("async");

//If data in DB is old, refresh the data
if(true){
	refreshDB(locations);
}else {
	readDB();
}


//Takes a list of locations and reads from SMHI for each loaction. The data for each point is inserted into mongodb.
function refreshDB(locations){
	var urls = [];

	for(var i = 0; i < locations.length; i++){
		urls[i] = "http://opendata-download-metfcst.smhi.se/api/category/pmp1.5g/version/1/geopoint/lat/" + locations[i].lat + "/lon/" + locations[i].lon + "/data.json";
	}

	var db = MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
		if(err)
	        throw err;
	    myCollection = db.collection('data');
	    myCollection.remove({});

		// 1st para in async.each() is the array of urls
		async.each(urls,
	  	  // 2nd param is the function that each item is passed to
		  function(url, callback){
	      // Call the http get async function and call callback when one datapoint has been inserted in db
		    http.get(url, function(res){
		    var body = '';

			    res.on('data', function(chunk){
			        body += chunk;
			    });

			    res.on('end', function(){
			    	var smhiResponse = JSON.parse(body);
			    	//Add datapoint to db
				    myCollection.insert(smhiResponse, function(err, result) {
					    if(err)
					        throw err;

						callback();
					})
				})
			})
		  },
		  // 3rd param is the function to call when everything's done
		  function(err){
		  	console.log("All data har hämtats");
		    readDB();
		  }
		);
	})
}

//Read DB and render index.ejs with data from collection data
function readDB(){
var db = MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
		    if(err)
		        throw err;
		    myCollection = db.collection('data');

		    //Read collection to array result
		    myCollection.find().toArray(function(err, result) {
			    if (err) {
			      throw err;
			    }

			    //Render index.ejs and send data from database as variable
			    router.get('/', function(req, res, next) {
				  res.render('index',{location: "Norrköping",time:"28/2 - 2016",dataobject:result});
				});
			});
		});
};

module.exports = router;