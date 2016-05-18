define([
  'table'
], function (
  table
) {
  "use strict";

  /**
   * Constructor for Table
   * @constructor Table
   * @param smhidata - Data from SMHI
   */
  var Table = function(smhidata) {
    this._data = smhidata;
  };

  /**
   * Resolving precipation type
   * @memberof Table
   * @function precipitationType
   * @param type precipation category
   * @returns {string} - Precipaton type
   */
  Table.prototype.precipitationType = function(type) {
    switch (type) {
      case 0:{
        return "Ingen";
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
    return "";
  };

  /**
   * Function to show correct icon in the table
   * @memberof Table
   * @function weatherType
   * @returns {string} what kind of weather on the specified place
   * @param wdp {number} - Weather type from SMHI API
   */
  Table.prototype.weatherType = function(wdp) { //Snow and rain
    if(wdp.pcat == 0) { // No precipaton
      if(wdp.tcc > 1 && wdp.tcc <= 4) { // Sunny with a chance of clouds
        return "sun cloud";
      }
      else if(wdp.tcc <= 6 && wdp.tcc > 4) { // Cloudy
        return "cloudy";
      }
      else if(wdp.tcc <= 8 && wdp.tcc > 6) { // Heavy clouds
        return "heavy clouds";
      }
      else{ // Sunny
        return "sun";
      }
    }
    else if(wdp.pcat == 1) {
      if(wdp.pit > 5) { // Heavy snow
        return "heavy snow";
      }
      else{ // Snow
        return "snow";
      }
    }
    else if(wdp.pcat == 2) { // Snow and rain
      return "snow and rain";
    }
    else if(wdp.pcat >= 3) {
      if(wdp.pit > 5) { // Heavy rain
        return "heavy rain";
      }
      else { // Rain
        return "rain";
      }
    }
  };

  /**
   * Determines if the percipation is snow or rain
   * @memberof Table
   * @function snowOrRain
   * @param wdp data provided
   * @returns {int} returns percipation in mm/h
   */
  Table.prototype.snowOrRain = function(wdp){
    if(wdp.pcat == 2 || wdp.pcat == 3) {
      return wdp.pit;
    }
    else {
      return wdp.pis;
    }
  };

  /**
   * Changes the current location in the Table
   * @memberof Table
   * @function changeCurrentLocation
   * @param newLocation {id} - Cell
   */
  Table.prototype.changeCurrentLocation = function(newLocation){
    console.log("Changing location!");
    this._currentLocation = newLocation.context.innerText;
    
    var id = newLocation.context.id;
    updateLocation(id, 't', 0);

    $(".toggleable").removeClass( "activeCell" );
    $("#"+id+"t").addClass( "activeCell" );
    
    $("td").removeClass( "currentLocation" );
    newLocation.addClass("currentLocation");
  };

  /**
   * Function to draw the table
   * @memberof Table
   * @function drawTable
   */
  Table.prototype.drawTable = function(time, l) {
    console.log("Draw table with indicies: " + l);

    for(var idx = 0; idx < l.length; idx++) {
      $('#tableBody').append("<tr>" +
        "<td id="+l[idx]+" class='location'>"+this._data[l[idx]].name+"</td>" + // Ort
        "<td><img style='height:30px' src='images/icons/"+this.weatherType(this._data[l[idx]].timeseries[time])+".png'</td>" + // Väder
        "<td id="+l[idx]+"t onclick= updateLocation("+l[idx]+",'t',"+time+") class='toggleable'><span class='minTemp'>" + this._data[l[idx]].mintimeseries[time].t + "°</span> "+this._data[l[idx]].timeseries[time].t+"° <span class='maxTemp'>" + this._data[l[idx]].maxtimeseries[time].t + "°</span></td>" + // Temperatur
        "<td id="+l[idx]+"pit onclick= updateLocation("+l[idx]+",'pit',"+time+") class='toggleable'>"+this.snowOrRain(this._data[l[idx]].timeseries[time])+"-"+ this._data[l[idx]].maxtimeseries[time].pit +" mm</td>" + // Nederbörd
        "<td id="+l[idx]+"gust onclick= updateLocation("+l[idx]+",'gust',"+time+") class='toggleable'>"+this._data[l[idx]].timeseries[time].gust+" m/s " +
        "<span style='-ms-transform:rotate("+this._data[l[idx]].timeseries[time].wd+"deg); -webkit-transform:rotate("+this._data[l[idx]].timeseries[time].wd+"deg); transform:rotate("+this._data[l[idx]].timeseries[time].wd+"deg)' class='glyphicon glyphicon glyphicon-arrow-right' aria-hidden='true'></span></td>" + // Vindhastighet
        "</tr>");
      if(this._data[l[idx]].name === this._currentLocation){
        $(".location").addClass("currentLocation");
      }
    }
  };

  Table.prototype.drawTimeTable = function(time, idx) {
    var timestart = 24;
    var timespan = 24;

    for(var i = 0; i < timespan; i++) {
      $('#tableBody').append("<tr>" +
      "<td style='width:20%'>" + formatGetTime(this._data[idx].timeseries[i+13].validTime) + "</td>" +
      "<td>"+this.setDynamicIcon(this._data[idx].timeseries[i+13], this._data[idx].maxtimeseries[i+13])+"</td>" +
      "<td style='width:20%' class='toggleable t row"+i+"part' onclick=updateLocation("+idx+",'t',"+i+");_table.highlightColumn('t',"+i+"); ><span class='minTemp'>" + this._data[idx].mintimeseries[i+13].t + "°</span> "+this._data[idx].timeseries[i+13].t+"° <span class='maxTemp'>" + this._data[idx].maxtimeseries[i+13].t + "°</span></td>" +
      "<td style='width:20%' class='toggleable gust row"+i+"pargust' onclick=updateLocation("+idx+",'gust',"+i+");_table.highlightColumn('gust',"+i+"); >" + this._data[idx].timeseries[i+13].gust + " m/s</td>" +
      "<td style='width:20%' class='toggleable pit row"+i+"parpit' onclick=updateLocation("+idx+",'pit',"+i+");_table.highlightColumn('pit',"+i+"); >"+this.snowOrRain(this._data[idx].timeseries[i+13])+"-"+ this._data[idx].maxtimeseries[i+13].pit +" mm</td>" +
      "<tr>");
    }
  };

  Table.prototype.setDynamicIcon = function(timeSeriesObject, maxTimeSeriesObject) {
    //<img style='height:30px' src='images/icons/"+this.weatherType(this._data[idx].timeseries[i])+".png'
    var cloudCoverage = this.cloudCoverage(timeSeriesObject);
    var rainIntensity = this.rainIntensity(timeSeriesObject);
    var windIntensity = this.windIntensity(timeSeriesObject);

    var tableIcons = "<div class='row'>";

    if(maxTimeSeriesObject.pit > 0) {
      tableIcons += "<div class='row'><div class='col-xs-offset-5'><img id='rainDrop' src='images/dynamic_icons/rain/raindrop.png' style='height:20px;'/></div></div>";
    }

    tableIcons += "<div class='row'><img src='images/dynamic_icons/cloud/"+cloudCoverage+".png'/></div> " +
      "<div class='row'><img src='images/dynamic_icons/rain/"+rainIntensity+".png' style='margin-top:-70px;'/></div> " +
      "<div class='row'><img src='images/dynamic_icons/wind/"+windIntensity+".png' style='margin-top:-90px; margin-left:-10px;'/></div> " +
    "</div>";

    return tableIcons

  };

  /**
   * Function for cloud coverage, used in drawTimeTable
   * @memberof Table
   * @function cloudCoverage
   * @param timeSeriesObject
   * @returns {string} - src to correct image
   */
  Table.prototype.cloudCoverage = function(timeSeriesObject){
    var cloudCoverage = timeSeriesObject.tcc;
    if(cloudCoverage >= 8) { // total cloud coverage
      return "total_cloud";
    }
    else if(cloudCoverage >= 6) { // heavy cloud coverage
      return "heavy_cloud";
    }
    else if(cloudCoverage >= 4) { // medium cloud coverage
      return "medium_cloud";
    }
    else if(cloudCoverage >= 1) { // medium cloud coverage
      return "small_cloud";
    }
    return "no_cloud"; // Sunny
  };

  /**
   * Function for rain intensity, used in drawTimeTable
   * @memberof Table
   * @function rainIntensity
   * @param timeSeriesObject
   * @returns {string} - src to correct image
   */
  Table.prototype.rainIntensity = function(timeSeriesObject){
    var rainIntensity = timeSeriesObject.pit;
    if(rainIntensity > 5) {
      return "heavy_rain";
    }
    else if(rainIntensity > 0.5) {
      return "medium_rain";
    }
    else if(rainIntensity > 0) {
      return "small_rain";
    }
    return "no_rain";
  };

 /**
   * Function for wind intensity, used in drawTimeTable
   * @memberof Table
   * @function windIntensity
   * @param timeSeriesObject
   * @returns {string} - src to correct image
   */
  Table.prototype.windIntensity = function(timeSeriesObject){
    var windIntensity = timeSeriesObject.gust;
    console.log(windIntensity);
    if(windIntensity > 8) {
      return "large_wind";
    }
    else if(windIntensity > 3.4) {
      return "small_wind";
    }
    return "no_wind";
  };

  /**
   * Function to highlight columns in table
   * @memberof Table
   * @function highlightColumn
   * @param par
   * @param idx
   */
  Table.prototype.highlightColumn = function(par, idx){
    $(".toggleable").removeClass( "activeRow" );
    $("." + par).addClass( "activeRow" );
    $(".row"+ idx + "par" + par).removeClass('activeRow');

    $(".toggleable").removeClass( "activeCell" );
    $(".row"+ idx + "par" + par).addClass( "activeCell" );
  };

  Table.prototype.updateTable = function(time, l) {
    $('#tableBody').html("");
    this.drawTable(time, l);

    $(".toggleable").removeClass( "activeCell" );
    $("#"+l[0]+"t").addClass( "activeCell" );
    
    $(".location").removeClass( "currentLocation" );
    $("#"+l[0]).addClass( "currentLocation" );
  };

  Table.prototype.updateTimeTable = function(time, idx) {
    $('#tableBody').html("");
    this.drawTimeTable(time, idx);

  };

  return Table;
});
