define(['table'], function (table) {

  /**
  * CONSTRUCTOR 
  */
  var Table = function(smhidata) {
  };

  Table.prototype.precipitationType = function(pcat) {
    switch (pcat){
      case 0:{
        return "Ingen nederbörd";
      }
      case 1:{
        return "Snö";
      }
      case 2:{
        return "Snö och Regn";
      }
      case 3:{
        return "Regn";
      }
      case 4:{
        return "Duggregn";
      }
      case 5:{
        return "Underkylt regn";
      }
      case 6:{
        return "Underkylt duggregn";
      }
      default:{
        return "";
      }
    }
  };

  Table.prototype.dateAndTime = function(validTime) {
    return validTime.substring(0,10) + " " + validTime.substring(11,16);
  };

  Table.prototype.testFunction = function () {
    console.log("test");
  };


  Table.prototype.initTable = function(arg) {
    this._data = google.charts.setOnLoadCallback(this.drawTable(arg));
  };

  Table.prototype.drawTable = function(smhidata) {
    var fun = function(){
      var data = new google.visualization.DataTable();

      data.addColumn('string', 'Tid');
      data.addColumn('number', 'Väder');
      data.addColumn('number', 'Vindstyrka');
      data.addColumn('number', 'Nederbörd');

      console.log(smhidata[0].timeseries[0]);

      for(var i = 0; i < 30; i++) {

        data.addRows([
          [
            smhidata[0].timeseries[i].validTime.substring(0,10) + " " + smhidata[0].timeseries[i].validTime.substring(11,16),
          {
            v: smhidata[0].timeseries[i].t,
            f: smhidata[0].timeseries[i].t.toString() + "°"
          },
          {
            v: smhidata[0].timeseries[i].gust,
            f: smhidata[0].timeseries[i].gust.toString() + "m/s"
          },
          {
            v: smhidata[0].timeseries[i].pcat,
            f: this.precipitationType(smhidata[0].timeseries[i].pcat)
          }
          ]
        ]);
      }

      var table = new google.visualization.Table(document.getElementById('table_div'));

      table.draw(data, {width: '100%', height: '100%'});
      };
    return fun;
  };

  return Table;
});
