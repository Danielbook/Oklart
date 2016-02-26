function drawGraph() {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'Time');
  data.addColumn('number', 'Max');
  data.addColumn('number', 'Temp');

  data.addRows([
    [0, 11, 10],    
    [1, 10, 5],   
    [2, 23, 15],  
    [3, 17, 9],   
    [4, 18, 10],  
    [5, 9, 5],
    [6, 11, 3],   
    [7, 27, 19],  
    [8, 33, 25],  
    [9, 40, 32],  
    [10, 32, 24], 
    [11, 35, 27],
    [12, 30, 22], 
    [13, 40, 32], 
    [14, 42, 34], 
    [15, 47, 39], 
    [16, 44, 36], 
    [17, 48, 40],
    [18, 52, 44], 
    [19, 54, 46], 
    [20, 42, 34], 
    [21, 55, 47], 
    [22, 56, 48], 
    [23, 57, 49],
    [24, 60, 52] 
    ]);

  var options = {
    hAxis: {
      format:'',
      gridlines: { count: data.Jf.length} //Draw gridlines for each row in data
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
    height:400
  };
  var lineChart = new google.visualization.LineChart(document.getElementById('graph_div'));
  lineChart.draw(data, options);
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
  }