/**
* ------------------------------------------
* main.js
* Initialize application
* ------------------------------------------ 
*/
requirejs.config({
  baseUrl: './javascripts/',
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
    var returndata = {};
    Table.initTable(returndata);
    Graph.initGraph(returndata);
    Map.createMap(returndata);


    /*
    function getData(dataurl){
      return $.getJSON(dataurl).then(function(data){
        return data;
      })
    ;}
	  getData("./assets/data/data.json").then(function(returndata){ 
      //When data has been loaded this runs
      console.log(returndata);
    });
    */    
});