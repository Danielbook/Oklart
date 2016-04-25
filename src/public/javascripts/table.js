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
    //var locationindex = 2;
    //var minTempArr = [];
    //var maxTempArr = [];
    //var maxPercArr = [];
    //for(var i = 0; i < 24; i++){
    //  var data = this._data[locationindex].timeseries[i];
    //  var min = this._data[locationindex].mintimeseries[i];
    //  var max = this._data[locationindex].maxtimeseries[i];
    //
    //  minTempArr.push(min['t']);
    //  maxTempArr.push(max['t']);
    //  maxPercArr.push(max['pit']);
    //}

    var closestCities = 5;
    for(var idx = 0; idx < closestCities; idx++) {
      $('#tableBody').append("<tr>" +
        "<td class='location'>"+this._data[idx].name+"</td>" + // Ort
        "<td><img style='height:30px' src='images/icons/"+this.weatherType(this._data[idx].timeseries[0])+".png'</td>" + // Väder
        "<td class='toggleable'><span class='minTemp'>" + this._data[idx].mintimeseries[0].t + "°</span> "+this._data[idx].timeseries[0].t+"° <span class='maxTemp'>" + this._data[idx].maxtimeseries[0].t + "°</span></td>" + // Temperatur
        "<td class='toggleable'>"+this.snowOrRain(this._data[idx].timeseries[0])+"-"+ this._data[idx].maxtimeseries[0].pit +" mm</td>" + // Nederbörd
        "<td class='toggleable'>"+this._data[idx].timeseries[0].gust+" m/s " +
        "<span style='-ms-transform:rotate("+this._data[idx].timeseries[0].wd+"deg); -webkit-transform:rotate("+this._data[idx].timeseries[0].wd+"deg); transform:rotate("+this._data[idx].timeseries[0].wd+"deg)' class='glyphicon glyphicon glyphicon-arrow-right' aria-hidden='true'></span></td>" + // Vindhastighet
        "</tr>");
      if(this._data[idx].name === this._currentLocation){
        $(".location").addClass("currentLocation");
      }
    }
  };
  return Table;
});
