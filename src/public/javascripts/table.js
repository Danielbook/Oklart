define([
  'table'
], function (
  table
) {

  /**
  * CONSTRUCTOR 
  */
  var Table = function(smhidata) {
    this._data = smhidata;
  };

  Table.prototype.precipitationType = function(type) {
    switch (type){
      case 0:{
        return "Soligt";
      }
      case 1:{
        return "Snö";
      }
      case 2:{
        return "Snö och regn";
      }
      case 3:{
        return "Regn";
      }
      case 4:{
        return "Duggregn";
      }
      case 5:{
        return "Underkyltregn";
      }
      case 6:{
        return "Underkyltduggregn";
      }
    }
  };

  Table.prototype.drawTable = function() {
    console.log(this._data);
    var closestCities = 4;
    for(var idx = 0; idx < closestCities; idx++) {
      $('#tableBody').append("<tr>" +
        "<td>"+this._data[idx].name + "</td>" +
        "<td class ='toggleable'>"+this._data[idx].timeseries[0].t+"°</td>" +
        "<td class ='toggleable'>"+this.precipitationType(this._data[idx].timeseries[0].pcat)+"</td>" +
        "<td class ='toggleable'>"+this._data[idx].timeseries[0].tcc+"</td>" +
        "<td class ='toggleable'>"+this._data[idx].timeseries[0].gust+" m/s</td>" +
        "</tr>");
    }
  };

  return Table;
});
