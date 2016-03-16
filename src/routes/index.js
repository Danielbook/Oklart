var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var locations = require('../locations.json');

//Get data from cloud-db and render page with data when it has been loaded
var db = MongoClient.connect('mongodb://adam:123@ds015919.mlab.com:15919/weatherdata', function(err, db) {
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


module.exports = router;