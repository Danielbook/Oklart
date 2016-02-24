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
  'map',
  ], function (
    Table,
    Graph,
    Map
    ) {
  /**
   * 
   */
  google.charts.load('current', {'packages':['table','corechart', 'line']}); // INIT GOOGLE
  function getData(dataurl){return $.getJSON(dataurl).then(function(data){return data;});}
  getData("./assets/data/data.json").then(function(returndata){ 
  google.charts.setOnLoadCallback(drawTable);
  google.charts.setOnLoadCallback(drawGraph);
  createMap();
  });
});