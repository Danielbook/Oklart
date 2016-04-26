define([
  'graph'
], function (
  graph
) {
  "use strict";

  /**
   * Constructor for Graph
   * @constructor Graph
   * @param smhidata {data} - Data from SMHI
   */
  var Graph = function(smhidata) {
    this._data = smhidata;
    this._Cpar = "";
    this._Suff = "";
  };

  /**
   * Initialize a graph and create the DataTable
   * @memberof Graph
   * @function initGraph
   * @param locationindex {int} - Location index
   * @param par {string} - Weather parameter from SMHI API
   */
  Graph.prototype.initGraph = function(locationindex, par) {
    this.checkParameter(par);

    var TimeArr = [];
    var TempArr = [];
    var MinTempArr = [];
    var MaxTempArr = [];
    //var locationindex  = 100;
    //var par = 'gust';

  for(var i = 0; i < 24; i++){
    var data = this._data[locationindex].timeseries[i];
    var min = this._data[locationindex].mintimeseries[i];
    var max = this._data[locationindex].maxtimeseries[i];

    var currhour = this._data[locationindex].timeseries[i].validTime;
    currhour = currhour.substring(11,16);
    currhour = currhour.toString();
    TimeArr.push(this._data[locationindex].timeseries[i].validTime.slice(11,16));
    TempArr.push(data[par]);
    MinTempArr.push(min[par]);
    MaxTempArr.push(max[par]);
  }

    // The MIN/MAX needs to be in a Matrix
    var Temps = [MinTempArr,MaxTempArr];
    var seriesArr = [];

    // Transpose if matrix due to how HS reads data
    var MinMaxArr = this.transpose(Temps);

    // Push values to series
    seriesArr.push({
        name: this._Cpar,
        data: TempArr,
        zIndex: 1,
        marker: {
          enabled: false,
          fillColor: 'white',
          lineWidth: 1,
          lineColor: Highcharts.getOptions().colors[0]
        }
      }, {
        name: 'Min/Max',
        data: MinMaxArr,
        type: 'arearange',
        lineWidth: 0,
        linkedTo: ':previous',
        color: Highcharts.getOptions().colors[0],
        fillOpacity: 0.3,
        zIndex: 0
      }
    );

    // Options for Highgraph
    var options = {
      chart: {
        renderTo: 'graph_div',
        defaultSeriesType: 'line'
      },
      colors: ['#4798DC'],
      title: {
        text: this._Cpar
      },
      xAxis: {
        //type: 'datetime'
        categories: TimeArr
      },
      yAxis: {
        title: {
          text: null
        }
      },
      tooltip: {
        crosshairs: true,
        shared: true,
        valueSuffix: this._Suff
      },
      legend: {
      },
      series: seriesArr
    };

    // Draw graph
    var chart = new Highcharts.Chart(options);
  };

  /**
   * Checks which parameter the user have selected to be displayed in graph
   * @memberof Graph
   * @function checkParameter
   * @param par {string} - parameter from SMHI API
   */
  Graph.prototype.checkParameter = function(par){
    //console.log(par);

    if(par == 't'){
      this._Cpar = 'Temperatur';
      this._Suff = '°C';
    }
    else if(par == 'gust'){
      this._Cpar = 'Byvind';
      this._Suff = 'm/s';
    }
    else if(par == 'ws'){
      this._Cpar = 'Vindhastighet';
      this._Suff = 'm/s';
    }
    else if(par == 'r'){
      this._Cpar = 'Luftfuktighet';
      this._Suff = '%';
    }
    else if(par == 'tcc'){
      this._Cpar = 'Molnmängd';
      this._Suff = 'Molnmängd';
    }
    else if(par == 'msl'){
      this._Cpar = 'Lufttryck';
      this._Suff = 'hPa';
    }
    else if(par == 'pis'){
      this._Cpar = 'Nederbördsintensitet, snö';
      this._Suff = 'mm/h';
    }
    else if(par == 'pit'){
      this._Cpar = 'Nederbördsintensitet';
      this._Suff = 'mm/h';
    }
    else if(par == 'tstm'){
      this._Cpar = 'Sannolikhet för åska';
      this._Suff = '%';
    }
    else if(par == 'vis'){
      this._Cpar = 'Sikt';
      this._Suff = 'km';
    }
  };

  /**
   * Transposes the matrix
   * @memberof Graph
   * @function transpose
   * @param a {Array} - Matrix in array form
   * @returns {Array} - Transposed matrix
   */
  Graph.prototype.transpose = function(a) {
    // Calculate the width and height of the Array
    var w = a.length ? a.length : 0,
        h = a[0] instanceof Array ? a[0].length : 0;

    // In case it is a zero matrix, no transpose routine needed.
    if(h === 0 || w === 0) { return []; }


    // Transposed data is stored in this array.
    var t = [];

    // Loop through every item in the outer array (height)
    for(var i = 0; i < h; i++) {

      // Insert a new row (array)
      t[i] = [];

      // Loop through every item per item in outer array (width)
      for(var j = 0; j < w; j++) {

        // Save transposed data.
        t[i][j] = a[j][i];
      }
    }

    return t;
  };

  return Graph;
});