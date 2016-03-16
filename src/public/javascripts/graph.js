define(['graph'], function (graph) { 

  var _data, _options, _lineChart, _tableData;
  
  var Graph = function(smhidata) {
    // console.log(this._data);
    _data = smhidata;
    _options = {
      hAxis: {
        viewWindow: {
        }
      },
      animation: {
        startup:true,
        duration: 1000,
        easing: 'inAndOut'
      },
      vAxis: {
        viewWindowMode: 'maximized'
      },
      legend: { 
        position: 'in'
      },

      colors: ['#a52714'],
      curveType: 'none',
      focusTarget: 'category',
      crosshair: {
        color: '#000',
        trigger: 'hover'
      },
      chartArea:{width:"80%",height:"80%"}
    };
  };
  
  Graph.prototype.initGraph = function() {
    google.charts.setOnLoadCallback( function(){
      _tableData = new google.visualization.DataTable();
      _tableData.addColumn('number', 'Time');
      _tableData.addColumn('number', 'Temp');

      for(var i = 0 ; i < 30 ; i++){
        var currHour = _data.data[0].timeseries[i].validTime;
        currHour = currHour.substring(11,16);
        currHour = currHour.toString();
        _tableData.addRows([[i, _data.data[0].timeseries[i].t]]);
      }

      _lineChart = new google.visualization.LineChart(document.getElementById('graph_div'));
    });
  };

  Graph.prototype.drawGraph = function() {
    google.charts.setOnLoadCallback( function() {
      _lineChart.draw(_tableData, _options);
    });
  };


  Graph.prototype.updateTime = function(timeIndex) {
    _options.hAxis.viewWindow.min = timeIndex[0];
    _options.hAxis.viewWindow.max = timeIndex[1];
    this.drawGraph();
  };

  return Graph;
});