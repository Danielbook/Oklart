define(['table'], function (table) {

  /**
  * CONSTRUCTOR 
  */
  var Table = function(smhidata) {
    // this._data = data;
    // console.log(this._data);
  };

  Table.prototype.initTable = function(arg) {
    this._data = google.charts.setOnLoadCallback(this.drawTable(arg));
  }

  Table.prototype.drawTable = function(smhidata) {
    console.log(smhidata);
    var fun = function(){
      var data = new google.visualization.DataTable();

      data.addColumn('string', 'Dag');
      data.addColumn('number', 'Temperatur');
      data.addColumn('number', 'Gust');

      for(var i = 0; i < 30; i++){
        data.addRows([ [smhidata[0].timeseries[i].validTime,  {v: smhidata[0].timeseries[i].t, f: smhidata[0].timeseries[i].t.toString()}, {v: smhidata[0].timeseries[i].gust, f: smhidata[0].timeseries[i].gust.toString()}] ]);
      }
      
      var table = new google.visualization.Table(document.getElementById('table_div'));

      table.draw(data, {width: '100%', height: '100%'});
      }
    return fun;
  }

  return Table;
});
