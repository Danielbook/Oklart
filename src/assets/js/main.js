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


	getData("./assets/data/data.json").then(function(returndata){ 
    console.log(returndata);
    Table.initTable(returndata);

    //console.log(returndata);
    //Table.sayHelloJens;
    // google.chars.setOnLoadCallback(Table.drawTable());
    // google.charts.setOnLoadCallback(drawGraph);
    // createMap();
  });
});