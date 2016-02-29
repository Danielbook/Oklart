define(['table'], function (table) {

  /**
  * CONSTRUCTOR 
  */
  var Table = function() {
    // this._data = data;
    // console.log(this._data);
  };

  Table.prototype.initTable = function() {
    var arg;
    this._data = google.charts.setOnLoadCallback(this.drawTable(arg));
  }

  Table.prototype.drawTable = function(smhidata) {
    var fun = function(){
      var data = new google.visualization.DataTable();

      data.addColumn('string', 'Dag');
      data.addColumn('number', 'Temperatur');
      data.addColumn('number', 'Gust');

      for(var i = 0; i < 10; i++){
        data.addRows([ ['Morgan',  {v: i, f: 'i'}, {v: i*2, f: 'i*2'}] ]);
      }
      
      var table = new google.visualization.Table(document.getElementById('table_div'));

      table.draw(data, {width: '100%', height: '100%'});
      }
    return fun;
  }

  return Table;
});
