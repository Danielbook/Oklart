define({
  initTable: function(arg){
    
    google.charts.setOnLoadCallback(this.drawTable(arg));
  },
  drawTable: function (smhidata){

    var fun = function() {
      var data = new google.visualization.DataTable();

      data.addColumn('string', 'Dag');
      data.addColumn('number', 'Temperatur');
      data.addColumn('number', 'Gust');

      for(var i = 0; i < 10; i++){
        data.addRows([ ['Morgan',  {v: i, f: 'i'}, {v: i*2, f: 'i*2'}] ]);
      }
      
      
      var table = new google.visualization.Table(document.getElementById('table_div'));

      table.draw(data, {width: '100%', height: '100%'});
    };

    return fun;
  }
});


/*
function{ 

  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Name');
  data.addColumn('number', 'Salary');
  data.addColumn('boolean', 'Full Time Employee');
  data.addRows([
    ['Mike',  {v: 10000, f: '$10,000'}, true],
    ['Jim',   {v:8000,   f: '$8,000'},  false],
    ['Alice', {v: 12500, f: '$12,500'}, true],
    ['Bob',   {v: 7000,  f: '$7,000'},  true]
    ]);

  var table = new google.visualization.Table(document.getElementById('table_div'));

  table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});

  console.log("Table has been drawn, with data: " + smhidata );
}*/
