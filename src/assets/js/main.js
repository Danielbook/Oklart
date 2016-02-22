/**
* ------------------------------------------
* main.js
* Initialize loading file
* ------------------------------------------ 
*/

requirejs.config({
  baseUrl: './assets/js/',
});

require([
  'tabell',
  'graph',
  'karta',
], function (
  Tabell,
  Graph,
  Karta
) {
  /**
   * 
   */
	google.charts.load('current', {'packages':['table','corechart', 'line']}); // INIT GOOGLE
	function getData(dataurl){return $.getJSON(dataurl).then(function(data){return data;});}

	getData("data/data.json").then(function(returndata){ 
	console.log(returndata);
	});
  	
  });