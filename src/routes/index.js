var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');

var localSmhidata = require('../data.json');
var urls = getUrls();
//console.log(urls);
//var apiSmhidata = getSmhiData(urls);
//console.log(apiSmhidata);

router.get('/', function(req, res, next) {
  res.render('index',{location: "Norrköping",time:"15 Mars",dataobject:localSmhidata});
});

function getUrls(){
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

function getSmhiData(urls){
	var dataArray = { data: [] };
	var index = 0; 
	async.forEachSeries(urls, function(url, callback) {
	  request(url, function (error, response, body) {

	    async.forEachSeries(body.docs, function(doc, callback) {
	      console.log(doc);
	      index++;
	      callback();
	    }, function(err) {
	      console.log("ERROR 100");

	      callback();
	    });
	  })
	}, function(err) {
	  console.log("ERROR 200");
	});
};

module.exports = router;