define(['graph'], function (graph) { 
  /**
  * CONSTRUCTOR 
  */
  var Graph = function() {
    // this._data = data;
    // console.log(this._data);
  };

  Graph.prototype.initGraph = function(arg) {
    this._data = google.charts.setOnLoadCallback(this.drawGraph(arg));
  }

  Graph.prototype.drawGraph = function(smhidata) {
    var fun = function() {
      var dashboard = new google.visualization.Dashboard( document.getElementById('dashboard_div'));

      var data = new google.visualization.DataTable();
      data.addColumn('number', 'Time');
      data.addColumn('number', 'Temp');

      for(var i = 1 ; i < 25 ; i++){
        data.addRows([[i, smhidata.data[0].timeseries[i].t]]);
      }

      var rangeSlider = new google.visualization.ControlWrapper({
            'controlType': 'NumberRangeFilter',
            'containerId': 'rangeSlider_div',
            'options': {
            'filterColumnLabel': 'Time',
            'width': '100%',
            'ui': { 'labelStacking': 'horizontal', 'format': { 'pattern':'####','fractionDigits':'0','groupingSymbol':'','showRangeValues':true }}
        }
      });

      var lineChart = new google.visualization.ChartWrapper({
          'chartType': 'LineChart',
          'containerId': 'chart_div',
          'options': {
              'height': 400,
              'fontSize':11,
              'hAxis': {
                  format: '',
                  gridlines: { count: data.Jf.lenght}
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
                  position: 'top',
                  alignment: 'center'
              },
              colors: ['#a52714', '#097138'],
              curveType: 'none',
              focusTarget: 'category',
              crosshair: {
                  color: '#000',
                  trigger: 'hover',
              },
          }
      });

      dashboard.bind(rangeSlider, lineChart);

      var dataViewNew = new google.visualization.DataView(data);
      dataViewNew.setColumns([{calc: function(data, row) {
          return data.getFormattedValue(row, 0); }, type:'string'}, 0,1]);

      dashboard.draw(dataViewNew);

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

  return Graph;
});