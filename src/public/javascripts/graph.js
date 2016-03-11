define(['graph'], function (graph) { 

  var _data, _options;
  
  var Graph = function(smhidata) {
    // console.log(this._data);
    _data = smhidata;
    _options = {
      hAxis: {
        minValue: 4,
        maxValue: 10
      },
      animation: {
        startup: true,
        duration: 1000,
        easing: 'out',
      },
      vAxis: {
        viewWindowMode: 'maximized'
      },
      legend: { 
        position: 'in',
      },
      colors: ['#a52714'],
      curveType: 'none',
      focusTarget: 'category',
      crosshair: {
        color: '#000',
        trigger: 'hover',
      },
      chartArea:{width:"80%",height:"80%"}
    };
  };
  
  Graph.prototype.initGraph = function(data) {
    this._graph = google.charts.setOnLoadCallback(this.drawGraph());
  }
  
  Graph.prototype.drawGraph = function() {
    var fun = function() {
      var data = new google.visualization.DataTable();
      data.addColumn('number', 'Time');
      data.addColumn('number', 'Temp');

      for(var i = 0 ; i < 30 ; i++){
        var currHour = _data.data[0].timeseries[i].validTime;
        currHour = currHour.substring(11,16);
        currHour = currHour.toString();
        data.addRows([[i, _data.data[0].timeseries[i].t]]);
      }

      var lineChart = new google.visualization.LineChart(document.getElementById('graph_div'));
      lineChart.draw(data, _options);
        // Every time the table fires the "select" event, it should call your
        // selectHandler() function.
        google.visualization.events.addListener(lineChart, 'select', selectHandler);
        
        function selectHandler(e) {
          var selection = lineChart.getSelection();
          var message = '';
          for (var i = 0; i < selection.length; i++) {
            var item = selection[i];
            if (item.row != null && item.column != null) {
              var str = data.getFormattedValue(item.row, item.column);
              message += '{row:' + item.row + ',column:' + item.column + '} = ' + str + '\n';
            } else if (item.row != null) {
              var str = data.getFormattedValue(item.row, 0);
              message += '{row:' + item.row + ', column:none}; value (col 0) = ' + str + '\n';
            } else if (item.column != null) {
              var str = data.getFormattedValue(0, item.column);
              message += '{row:none, column:' + item.column + '}; value (row 0) = ' + str + '\n';
            }
          }
          if (message == '') {
            message = 'nothing';
          }
          alert('You selected ' + message);
        }

      };
    return fun; 
    }

  Graph.prototype.updateTime = function(timeIndex) {
    _options.hAxis.minValue = timeIndex[0];
    _options.hAxis.maxValue = timeIndex[1];
    console.log(_options.hAxis.minValue , ", ",_options.hAxis.maxValue );
  }

  return Graph;
});