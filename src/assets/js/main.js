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
  function getData(dataurl){
    return $.getJSON(dataurl).then(function(data){
        return data;
      })
    ;}


	getData("./assets/data/data.json").then(function(returndata){ 
    console.log(returndata);
    Table.initTable(returndata);
    Graph.initGraph(returndata);
    createMap();
  });
});