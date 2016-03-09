var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var locations = require('../locations.json');

//If data in DB is old, refresh the data
if(true){
	refreshDB(locations);
}else {
	readDB();
}



function refreshDB(locations){

	var db = MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
		if(err)
	        throw err;
	    myCollection = db.collection('data');
	    myCollection.remove({});
	    var counter = 0;

		for(var i = 0; i < locations.length; i++){

			console.log("Har skickat förfrågan om data");
			url = "http://opendata-download-metfcst.smhi.se/api/category/pmp1.5g/version/1/geopoint/lat/" + locations[i].lat + "/lon/" + locations[i].lon + "/data.json";
			addDataPoint(url);
			counter++;
		}
	})
};

function addDataPoint(url){
	//Get data from smhi-api
	http.get(url, function(res){
    var body = '';

	    res.on('data', function(chunk){
	        body += chunk;
	    });

	    var counter = 0;
	    res.on('end', function(){
	    	var smhiResponse = JSON.parse(body);

	    	//Add datapoint to db
		    myCollection.insert(smhiResponse, function(err, result) {
			    if(err)
			        throw err;
			})

			console.log("Har hämtat data");

		    readDB();
		})
	})

};

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