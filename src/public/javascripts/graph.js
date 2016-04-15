define(['graph'], function (graph) { 

  var _data,
      _options,
      _lineChart,
      _tableData;

  /**
   *
   * @param smhidata  data from SMHI
   * @constructor
   */
  var Graph = function() {
    // console.log(this._data);
  };

  /**
   * Initialize a graph and create the DataTable
   */
  Graph.prototype.initGraph = function(smhidata) {

    var TimeArr = [];
    var TempArr = [];
    var MinTempArr = [];
    var MaxTempArr = [];

  for(var i = 0; i < 24; i++){
    var currhour = smhidata[0].timeseries[i].validTime;
    currhour = currhour.substring(11,16);
    currhour = currhour.toString();
    TimeArr.push(smhidata[0].timeseries[i])
    TempArr.push(smhidata[0].timeseries[i].t);
    MinTempArr.push(smhidata[0].timeseries[i].t -1);
    MaxTempArr.push(smhidata[0].timeseries[i].t +1);
  }
    var Temps = [MinTempArr,MaxTempArr];
    var seriesArr = [];
    console.log("TempsB: ", Temps);

    var newArray = [];
    for(var i = 0; i < Temps.length; i++){
      newArray.push([]);
    };

    for(var i = 0; i < Temps.length; i++){
      for(var j = 0; j < Temps.length; j++){
        newArray[j].push(Temps[i][j]);
      };
    };

    console.log("TempsEfter: " , Temps);

      //push values to series
    seriesArr.push(
        {
          name: 'Temperatur',
          data: TempArr,
          zIndex: 1,
          marker: {
            fillColor: 'white',
            lineWidth: 2,
            lineColor: Highcharts.getOptions().colors[0]
          }
        }, {
          name: 'MinMax',
          data: newArray,
          type: 'arearange',
          lineWidth: 0,
          linkedTo: ':previous',
          color: Highcharts.getOptions().colors[0],
          fillOpacity: 0.3,
          zIndex: 0
        }
    );
      console.log(seriesArr);

      //options for Highgraph
    var options = {
      chart: {
            renderTo: 'graph_div',
          defaultSeriesType: 'line'
      },
      title: {
        text: 'Temperatur'
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
        valueSuffix: '°C'
      },

      legend: {
      },
      series: seriesArr
    };

      //draw graph
    var chart = new Highcharts.Chart(options);

  };

  /**
   * Draws graph
   */
  Graph.prototype.drawGraph = function() {
    //google.charts.setOnLoadCallback( function() {
   //   _lineChart.draw(_tableData, _options);
   // });
  };

  /**
   * Updates the hAxis in graph
   * @param timeIndex - Time from slider
   */
  Graph.prototype.updateTime = function(timeIndex) {
    //_options.hAxis.viewWindow.min = timeIndex[0];
    //_options.hAxis.viewWindow.max = timeIndex[1];
    this.drawGraph();
  };

  return Graph;
});