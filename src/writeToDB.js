var express = require('express');
var router = express.Router();
var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var async = require("async");

function createurls (l, k){

	var locations = new Array();

	for(var i = 0; i < l.length; i++){

		var location = {
			name : "",
			url : "",
			sampleurls : [],
			data : {},
			zoomlevel : -1
		}

		var idx = 0;
		location.name = l[i].name;
		location.zoomlevel = l[i].zoomlevel;
		for(var dlat = -k ; dlat <= k ;dlat=dlat+k ){
			for(var dlon = -k; dlon <= k; dlon=dlon+k){
				var lat = l[i].lat + dlat;
				lat = lat.toFixed(3);
				var lon = l[i].lon + dlon;
				lon = lon.toFixed(3);

				if(dlat == 0 && dlon == 0)//http://opendata-download-metfcst.smhi.se/api/category/pmp2g/version/2/geotype/point/lon/16.158/lat/58.5812/data.json
					location.url =  "http://opendata-download-metfcst.smhi.se/api/category/pmp2g/version/2/geotype/point/lon/" + lon + "/lat/" + lat + "/data.json";
				else{
					location.sampleurls[idx] = "http://opendata-download-metfcst.smhi.se/api/category/pmp2g/version/2/geotype/point/lon/" + lon + "/lat/" + lat + "/data.json";;
					idx++;
				}
			}
		}

		locations.push(location);
	}


	return locations;
}

function pushtoDB(data){

	var db = MongoClient.connect('mongodb://adam:123@ds015919.mlab.com:15919/weatherdata', function(err, db) {
	if(err){
        throw err;
	}

    myCollection = db.collection('data');
    myCollection.remove({});

 	myCollection.insert(data, function(err, result) {
	    if(err){
			throw err;
			console.log("Something went wrong when inserting data to db");
		}
	        
		console.log("Data has been inserted")
	})

	})

}

function calcMinMax(data, k){

	var sampleurlslist = [];
	for(var i = 0; i < data.length; i++){
		sampleurlslist[i] = [];
		var idx = 0;
		for(var dlat = -k ; dlat <= k ;dlat=dlat+k ){
			for(var dlon = -k; dlon <= k; dlon=dlon+k){
				var lat = data[i].geometry.coordinates[0][0] + dlat;
				lat = lat.toFixed(3);
				var lon = data[i].geometry.coordinates[0][1] + dlon;
				lon = lon.toFixed(3);
				sampleurlslist[i][idx] = "http://opendata-download-metfcst.smhi.se/api/category/pmp2g/version/2/geotype/point/lon/" + lon + "/lat/" + lat + "/data.json";
				idx++;
			}
		}
	}

	async.each(sampleurlslist,

		function(sampleurls, out_callback){
			var idx = sampleurlslist.indexOf(sampleurls);
			data[idx].mintimeseries = JSON.parse(JSON.stringify(data[idx].timeSeries));
			data[idx].maxtimeseries = JSON.parse(JSON.stringify(data[idx].timeSeries));

			async.each(sampleurls,
				function(sampleurl,  callback){
					var id = sampleurls.indexOf(sampleurl);

					http.get(sampleurl, function(res){
				    var body = '';

					    res.on('data', function(chunk){
					        body += chunk;
					    });

					    res.on('end', function(){
					    	console.log(sampleurl);
					    	console.log(body);

							// var smhidata = JSON.parse(body);

    						// for(var j = 0; j < data[idx].timeseries.length ; j++){
    						// 	//console.log(data[idx].timeseries[j].t);
							//
							// 	var min = data[idx].mintimeseries[j];
							// 	var max = data[idx].maxtimeseries[j];
							//
							// 	var res = smhidata.timeseries[j];
							// 	for (var property in res) {
							// 	    if (res.hasOwnProperty(property)) {
							//
							// 	        if(min[property] > res[property]){
							// 	        	min[property] = res[property];
							// 	        }
							//
							// 	        if(max[property] < res[property]){
							// 	        	max[property] = res[property];
							// 	        }
							// 	    }
							// 	}
							//
							// 	// data[idx].mintimeseries[j] = JSON.parse(JSON.stringify(min));
							// 	// data[idx].maxtimeseries[j] = JSON.parse(JSON.stringify(max));
							// }

							callback();
						})
					})
				},
				function(err){
					if(err){
						console.log("Something went wrong 1");
						throw err;
					}
					out_callback();
				}
			)
		},
		function(err){
			if(err){
				console.log("Something went wrong 2");
				throw err;
			}
			//pushtoDB(data);
			console.log("I go here once");
		}
	);
}

var insertData = function (locations){
	var urls = [];
	var sampleurls = [];
	var data = new Array();

	for(var i = 0; i < locations.length; i++){
		urls[i] = "http://opendata-download-metfcst.smhi.se/api/category/pmp2g/version/2/geotype/point/lon/" + locations[i].lon + "/lat/" + locations[i].lat + "/data.json";
		sampleurls[i] = new Array();
	}

    // 1st para in async.each() is the array of urls
	async.each(urls,
  	  // 2nd param is the function that each item is passed to
	  function(url, callback){
      // Call the http get async function and call callback when one datapoint has been inserted in db
		http.get(url, function(res){
	    var body = '';
	    var location = locations[urls.indexOf(url)];

		    res.on('data', function(chunk){
		        body += chunk;
		    });

		    res.on('end', function(){
		    	var smhiResponse = JSON.parse(body);
		    	smhiResponse.name = location.name;
		    	smhiResponse.zoomlevel = location.zoomlevel;

		    	data.push(smhiResponse);

				callback();
				})
			})
	  },
	  // 3rd param is the function to call when everything's done
	  function(err){
	  	calcMinMax(data, 0.7);
	  }
	);
}

module.exports = insertData;
