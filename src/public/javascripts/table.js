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
    this._currentLocation = "";
    this._chosenWeather = "";
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

  Table.prototype.updateLocation = function(currentLocation) {
    this._currentLocation = currentLocation
  };

  Table.prototype.updateChosenWeather = function(chosenWeather) {
    this._chosenWeather = chosenWeather;
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
    console.log(newLocation.context.innerText);
    this._currentLocation = newLocation.context.innerText;

    for(var idx = 0; idx < this._data.length; idx++)
      $("td").removeClass( "currentLocation" )

    newLocation.addClass("currentLocation");

  };

  /**
   * Function to draw the table
   */
  Table.prototype.drawTable = function() {
    var closestCities = 5;

    for(var idx = 0; idx < closestCities; idx++) {
      $('#tableBody').append("<tr>" +
        "<td class='location'>"+this._data[idx].name+"</td>" + // Ort
        "<td><img style='height:30px' src='images/icons/"+this.weatherType(this._data[idx].timeseries[0])+".png'</td>" + // Väder
        "<td onclick= update("+idx+",'t',0) class='toggleable'>"+this._data[idx].timeseries[0].t+"°</td>" + // Temperatur
        "<td onclick= update("+idx+",'pit',0) class='toggleable'>"+this.snowOrRain(this._data[idx].timeseries[0])+" mm</td>" + // Nederbörd
        "<td onclick= update("+idx+",'gust',0) class='toggleable'>"+this._data[idx].timeseries[0].gust+" m/s " +
        "<span style='-ms-transform:rotate("+this._data[idx].timeseries[0].wd+"deg); -webkit-transform:rotate("+this._data[idx].timeseries[0].wd+"deg); transform:rotate("+this._data[idx].timeseries[0].wd+"deg)' class='glyphicon glyphicon glyphicon-arrow-right' aria-hidden='true'></span></td>" + // Vindhastighet
        "</tr>");
      if(this._data[idx].name === this._currentLocation){
        $(".location").addClass("currentLocation");
      }
    }
  };


  return Table;
});
