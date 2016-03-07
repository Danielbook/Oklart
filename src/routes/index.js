var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;

var localSmhidata = require('../data.json');


//clearDB();

var locations = require('../locations.json');

for(var i = 0; i < locations.length; i++){
	if(i == locations.length - 1)
		writeDB(locations[i], true);
	else
		writeDB(locations[i], false);
}


function clearDB(){
var db = MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
		if(err)
		    throw err;
		myCollection = db.collection('data');
		myCollection.remove({});
	});
};
//Get data from api at location l and store in database
function writeDB(l, isLast){

	//Create url that fetches data for location l
	url = "http://opendata-download-metfcst.smhi.se/api/category/pmp1.5g/version/1/geopoint/lat/" + l.lat + "/lon/" + l.lon + "/data.json";

	//Get data from smhi-api
	http.get(url, function(res){
    var body = '';

    	//Add chunk of data to body
	    res.on('data', function(chunk){
	        body += chunk;
	    });

	    //When data has been read from smhi-api this runs
	    res.on('end', function(){
	        var smhiResponse = JSON.parse(body);

			var myCollection;
			//Connect to db
			var db = MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
			    if(err)
			        throw err;
			    myCollection = db.collection('data');

			    //Add datapoint to db
			    myCollection.insert(smhiResponse, function(err, result) {
				    if(err)
				        throw err;

				//If this is the last insert we render the page
				if(isLast)
					render();

				});
			});
		});


	//Handle error if data couldn't be read from smhi-api	
	}).on('error', function(e){
	      console.log("Got an error when reading from SMHI ", e);
	});
};

function render(){
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