var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var async = require("async");

//Takes a list of locations and reads from SMHI for each loaction. The data for each point is inserted into mongodb.
var insertData = function (locations){
	var urls = [];

	for(var i = 0; i < locations.length; i++){
		urls[i] = "http://opendata-download-metfcst.smhi.se/api/category/pmp1.5g/version/1/geopoint/lat/" + locations[i].lat + "/lon/" + locations[i].lon + "/data.json";
	}

	var db = MongoClient.connect('mongodb://adam:123@ds015919.mlab.com:15919/weatherdata', function(err, db) {
		if(err){
	        throw err;
		}

	    console.log("hej");
	    myCollection = db.collection('data');
	    myCollection.remove({});

		// 1st para in async.each() is the array of urls
		async.each(urls,
	  	  // 2nd param is the function that each item is passed to
		  function(url, callback){
	      // Call the http get async function and call callback when one datapoint has been inserted in db
		    http.get(url, function(res){
		    var body = '';
		    var location = locations[urls.indexOf(url)].name;

			    res.on('data', function(chunk){
			        body += chunk;
			    });

			    res.on('end', function(){
			    	var smhiResponse = JSON.parse(body);
			    	smhiResponse.name = location;
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
		  	console.log("Data has been inserted in db");
		  }
		);
	})
}

module.exports = insertData;