define(['graph'], function (graph) {

  transpose = function(a) {

    // Calculate the width and height of the Array
    var w = a.length ? a.length : 0,
        h = a[0] instanceof Array ? a[0].length : 0;

    // In case it is a zero matrix, no transpose routine needed.
    if(h === 0 || w === 0) { return []; }

    /**
     * @var {Number} i Counter
     * @var {Number} j Counter
     * @var {Array} t Transposed data is stored in this array.
     */
    var t = [];

    // Loop through every item in the outer array (height)
    for(i=0; i<h; i++) {

      // Insert a new row (array)
      t[i] = [];

      // Loop through every item per item in outer array (width)
      for(j=0; j<w; j++) {

        // Save transposed data.
        t[i][j] = a[j][i];
      }
    }

    return t;
  };
  /**
   *
   * @param smhidata  data from SMHI
   * @constructor
   */
  var Graph = function() {
    this.chart;
    this.options;
  };

  /**
   * Check what parameter is chosen and create arrays and matrix to be displayed in graph
   */
  Graph.prototype.initGraph = function(smhidata, locationindex, par, timeindex ) {

    var Cpar; //Chosen Parameter
    var Suff; //Chosen parameter suffix
    var Graphtype = '';
    console.log(par);
    if(par == 't'){
      Cpar = 'Temperatur';
      Suff = '°C';
    }
    else if(par == 'gust'){
      Cpar = 'Byvind';
      Suff = 'm/s';
    }
    else if(par == 'pit'){
      Cpar = 'Nederbörd';
      Suff = 'mm/h';
      Graphtype = 'column';
    }
    else if(par == 'ws'){
      Cpar = 'Vindhastighet';
      Suff = 'm/s';
    }
    else if(par == 'r'){
      Cpar = 'Luftfuktighet';
      Suff = '%';
    }
    else if(par == 'tcc'){
      Cpar = 'Molnmängd';
      Suff = 'Molnmängd';
    }
    else if(par == 'msl'){
      Cpar = 'Lufttryck';
      Suff = 'hPa';
    }
    else if(par == 'pis'){
      Cpar = 'Nederbörd, snö';
      Suff = 'mm/h';
    }
    else if(par == 'tstm'){
      Cpar = 'Sannolikhet för åska';
      Suff = '%';
    }
    else if(par == 'vis'){
      Cpar = 'Sikt';
      Suff = 'km';
    }
    var TimeArr = [];
    var TempArr = [];
    var MinTempArr = [];
    var MaxTempArr = [];
    //var locationindex  = 100;
    //var par = 'gust';

    //i up to how many hours we want to display. ~48 is max then it looks bad.
    for(var i = 0; i < 24; i++){
      var data = smhidata[locationindex].timeseries[i];
      var min = smhidata[locationindex].mintimeseries[i];
      var max = smhidata[locationindex].maxtimeseries[i];

      var currhour = smhidata[locationindex].timeseries[i].validTime;
      currhour = currhour.substring(11,16);
      currhour = currhour.toString();
      TimeArr.push(smhidata[locationindex].timeseries[i].validTime.slice(11,16));
      TempArr.push(data[par]);
      MinTempArr.push(min[par]);
      MaxTempArr.push(max[par]);
    }

    //The MIN/MAX needs to be in a Matrix
    var Temps = [MinTempArr,MaxTempArr];
    var seriesArr = [];

    //transpose if matrix due to how HS reads data
    MinMaxArr = transpose(Temps);

    var that = this;
    //push values to series
    seriesArr.push(
        {
          name: Cpar,
          data: TempArr,
          zIndex: 1,
          marker: {
            enabled: false,
            fillColor: 'white',
            lineWidth: 1,
            lineColor: Highcharts.getOptions().colors[0],

          },
          pointWidth: 20,
          pointPadding: 0.4,
          pointPlacement: -0.2,
          point: {
              events: {
                click: function (e) {
                  var index = e.point.index;
                  that.updateTime(index);
                }
              }
            }
        }
    );
    if(par == 'pit')
    {
      seriesArr.push(
          {
            name: 'Max',
            data: MaxTempArr,
            type: 'column',
            lineWidth: 10,
            linkedTo: ':previous',
            color: Highcharts.getOptions().colors[0],
            zIndex: 0,
            pointPadding: 0.3,
            pointPlacement: -0.2,
            pointWidth: 20,
            point: {
              events: {
                click: function (e) {
                  var index = e.point.index;
                  that.updateTime(index);
                }
              }
            }
          }
      );
    }
    else
    {
      seriesArr.push(
          {
            name: 'Min - Max',

            data: MinMaxArr,
            type: 'arearange',
            lineWidth: 0,
            linkedTo: ':previous',
            color: Highcharts.getOptions().colors[0],
            fillOpacity: 0.3,
            zIndex: 0,
            point: {
              events: {
                click: function (e) {
                  var index = e.point.index;
                  that.updateTime(index);
                }
              }
            }
          }
      );
    }
    //options for Highgraph

    this.options = {
      chart: {
        type: Graphtype,
        renderTo: 'graph_div',
        events: {
          click: function (e) {
            var index = Math.floor(e.xAxis[0].value + 0.5);
            that.updateTime(index);
          }
        }
      },

      colors: ['#4798DC'],
      title: {
        text: Cpar + ' i ' + smhidata[locationindex].name
      },

      xAxis: {
        categories: TimeArr,
        plotLines: [{
          color: 'red', // Color value
          dashStyle: 'solid', // Style of the plot line. Default to solid
          value: timeindex-0.2,
          width: 2 // Width of the line
        }]
      },

      yAxis: {
        title: {
          text: null
        }
      },

      tooltip: {
        crosshairs: true,
        shared: true,
        valueSuffix: Suff
      },

      legend: {
        enabled: true
      },
      series: seriesArr,
      credits: {
        enabled: false
      },
      plotOptions: {
        series: {
          animation:false
        },
        line: {
          animation:false
        },
        column: {
          animation:false,
          grouping: false,
          shadow: false,
          borderWidth: 0
        }
      },
      navigation: {
        buttonOptions: {
          enabled: false
        }
      },



    };

    //draw graph
    this.chart = new Highcharts.Chart(this.options);
  };

  /**
   * Updates the hAxis in graph
   * @param timeIndex - Time from slider
   */
  Graph.prototype.updateTime = function(timeIndex) {
    updateTime(timeIndex);

    console.log(this.options);

    this.options.xAxis.plotLines[0].value = timeIndex-0.2;
    
    this.chart = new Highcharts.Chart(this.options);

  };

  return Graph;
});