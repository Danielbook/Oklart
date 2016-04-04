var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var async = require("async");
var request = require("request")


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
	

	    console.log("Writing data to DB...");
	    myCollection = db.collection('data');
	    myCollection.remove({});
	    urls.forEach(function(url){
	    	request({
			    url: url,
			    json: true
			}, function (error, response, body) {
			    if (!error && response.statusCode === 200) {

			    	var smhiResponse = {};
					smhiResponse = body;
					var index = urls.indexOf(url);
					

					//console.log(urls.indexOf(url));
					smhiResponse.zoomlevel = locations[index].zoomlevel;
					smhiResponse.name = locations[index].name;

			    	smhiResponse.timeseries[0].temp_t = smhiResponse.timeseries[0].t - smhiResponse.timeseries[1].t
			    	for(var j = 1; j < smhiResponse.timeseries.length - 1 ; j++){
			    		smhiResponse.timeseries[j].temp_t = smhiResponse.timeseries[j].t - (smhiResponse.timeseries[j-1].t + smhiResponse.timeseries[j+1].t)/2 ;
				    }
				    smhiResponse.timeseries[smhiResponse.timeseries.length-1].temp_t = smhiResponse.timeseries[smhiResponse.timeseries.length-1].t - smhiResponse.timeseries[1].t

				    myCollection.insert(smhiResponse, function(err, result) {
					    if(err)
					        throw err;	
					})
			    }
			})
	    })

	});
		// // 1st para in async.each() is the array of urls
		// async.each(urls,
	 //  	  // 2nd param is the function that each item is passed to
		//   function(url, callback){
	 //      // Call the http get async function and call callback when one datapoint has been inserted in db
		//     http.get(url, function(res){
		//     var body = '';
		//     var location = locations[urls.indexOf(url)].name;

		// 	    res.on('data', function(chunk){
		// 	        body += chunk;
		// 	    });

		// 	    res.on('end', function(){
		// 	    	var smhiResponse = JSON.parse(body);
		// 	    	smhiResponse.name = location;
			    	
		// 	    	for(var i = 0; i < smhiResponse.timeseries.length ; i++){
		// 	    		smhiResponse.timeseries[i].ourSpat = 0.7;
		// 	    		smhiResponse.timeseries[i].ourTemp = 0.6;
		// 	    	}
			    	
		// 	    	//Add datapoint to db
		// 		    myCollection.insert(smhiResponse, function(err, result) {
		// 			    if(err)
		// 			        throw err;

		// 				callback();
		// 			})
		// 		})
		// 	})
		//   },
		//   // 3rd param is the function to call when everything's done
		//   function(err){
		//   	console.log("Data has been inserted in db");
		//   }
		// );
	// })
}

module.exports = insertData;