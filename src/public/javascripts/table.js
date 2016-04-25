"use strict";

define([
  'table',
  'graph',
  'map'
], function (
  table,
  graph,
  map
){

  /**
   * CONSTRUCTOR
   */
  var Table = function(smhidata) {
    this._data = smhidata;
  };


  /**
   * Resolving precipation type
   * @param type precipation category
   * @returns {string} category
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
   *
   * @param weatherDataPoint Data point to check weather
   * @returns {string} what kind of weather on the specified place
   */
  Table.prototype.weatherType = function(wdp) { //Snow and rain
    if(wdp.pcat == 0) { // No precipatopm
      if(wdp.tcc < 1) { // Sunny
        return "sun";
      }
      else if(wdp.tcc > 1 && wdp.tcc < 4) { // Sunny with a chance of clouds
        return "sun cloud";
      }
      else if(wdp.tcc <= 6 && wdp.tcc > 4) { // Cloudy
        return "cloudy";
      }
      else if(wdp.tcc <= 8 && wdp.tcc > 6) { // Heavy clouds
        return "heavy clouds";
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
    else if(wdp.pcat == 3) {
      if(wdp.pit > 5) { // Heavy rain
        return "heavy rain";
      }
      else { // Rain
        return "rain";
      }
    }
    return "midsummer";
  };

  /**
   * Determines if the percipation is snow or rain
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

  Table.prototype.changeCurrentLocation = function(newLocation){
    console.log(newLocation);
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

  Table.prototype.updateTable = function(time, l) {
    $('#tableBody').html("");
    this.drawTable(time, l);
  };

  return Table;
});
