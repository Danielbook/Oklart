/**
* ------------------------------------------
* main.js
* Initialize application
* ------------------------------------------ 
*/
requirejs.config({ baseUrl: './javascripts/' });
requirejs(['table', 'graph', 'map'], function (Table, Graph, Map) {
  var _table = new Table();
  var _graph = new Graph();
  var _map = new Map();

  returnData = {};
  _table.initTable(returnData);
  _graph.initGraph(returnData);
  _map.initMap(returnData);

});



