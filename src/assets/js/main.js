/**
* ------------------------------------------
* main.js
* Initialize application
* ------------------------------------------ 
*/
requirejs.config({
  baseUrl: './assets/js/',
});
require([
  'table',
  'graph',
  'map'
  ], function (
    Table,
    Graph,
    Map
    ) {
  /**
   * 
   */
   //console.log(Table.drawTable());
	
	
  function getData(dataurl){
    return $.getJSON(dataurl).then(function(data){
        return data;
      })
    ;}

  google.charts.load('current', {packages: ['corechart', 'table', 'line']});
	getData("./assets/data/data.json").then(function(returndata){ 
    console.log(returndata);
    Table.initTable(returndata);
    google.charts.setOnLoadCallback(drawGraph);
    createMap();
    //console.log(returndata);
    // google.chars.setOnLoadCallback(Table.drawTable());
    // google.charts.setOnLoadCallback(drawGraph);
    // createMap();
  });
});