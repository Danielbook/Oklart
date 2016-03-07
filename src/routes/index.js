var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');
var async = require('async');
var MongoClient = require('mongodb').MongoClient;

var localSmhidata = require('../data.json');
var urls = getUrlsGrid();

var locations = require('../locations.json');
getSmhiData(locations[0]);
getSmhiData(locations[1]);



router.get('/', function(req, res, next) {
  res.render('index',{location: "Norrköping",time:"28/2 - 2016",dataobject:localSmhidata});
});

function getUrlsGrid(){
	var ALATS=54, ALATN=70.75, ALONW=2.25, ALONE=27.00;
	var sampleLenght = 4.0;
	var urls = {};
	var index = 0;
	for(var lon = ALONW; lon < ALONE; lon = lon + sampleLenght){
		for(var lat = ALATS; lat < ALATN; lat = lat + sampleLenght){
			urls[index] = "http://opendata-download-metfcst.smhi.se/api/category/pmp1.5g/version/1/geopoint/lat/" + lat + "/lon/" + lon + "/data.json";
			index++;
		}
	}
	return urls;
};


//Get data from api at location l
function getSmhiData(l){

	url = "http://opendata-download-metfcst.smhi.se/api/category/pmp1.5g/version/1/geopoint/lat/" + l.lat + "/lon/" + l.lon + "/data.json";
	console.log(url);
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
				});

			    //Read collection to array result
			    myCollection.find().toArray(function(err, result) {
				    if (err) {
				      throw err;
				    }

				    console.log(readline.isFullWidthCodePoint(code););
				});
			});

		});
	//Handle error if data couldn't be read from smhi-api	
	}).on('error', function(e){
	      console.log("Got an error when reading from SMHI ", e);
	});
};

module.exports = router;