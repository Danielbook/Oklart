"use strict";

define([
  'map',
  'table',
  'graph'
  ], function (
    map,
    table,
    graph
    ){

  /**
   * Constructor for the map
   * @param smhidata
   * @constructor
   */

  var Map = function(smhidata) {          //minx, miny,  maxx,  maxy
    this._extent = ol.proj.transformExtent([7.25, 54.50, 25.00, 70.75], 'EPSG:4326', 'EPSG:3857');

    this._data = smhidata;
    this._map = new ol.Map({
      target: 'map',
      controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
          collapsible: false
        })
      }),
    });

    this._view = new ol.View({
      center: ol.proj.fromLonLat([16.1924, 58.5877]), // Norrköping
      zoom: 4,
      maxZoom: 10,
      minZoom: 4,
      extent: this._extent,
    });
    this._myPosLatLon = "";
    this._geolocation = "";
    this._cartoDBLight = "";
    this._cloudSource = new ol.source.Vector({ projection: 'EPSG:4326' });

    this._rainSource = new ol.source.Vector({ projection: 'EPSG:4326' });

    this._OWMtempLayer = "";
    this._OWMrainLayer = "";
    this._OWMcloudLayer = "";

    this._cloudVecLayer= "";
    this._RainVecLayer = "";

    this._markerSource = "";
    this._markerVecLayer = "";
    this._time = 0;

    user.gpsLocation = this.getCurrentLocation();
    this.gpsLocation = user.gpsLocation;
    //console.log(user.gpsLocation);
  };

  /**
   * Inits the map
   */
   Map.prototype.initMap = function(user) {
    this.mapLayers();
    this.setupMapControls();
    this.goToMyLocation(user.gpsLocation);
    this.addMarker(this);
    this.updateLayers(this);
    this.handleMouse(this);
  };

  Map.prototype.updateTime = function(time){
    this._time = time;
    this.updateLayers(this);
  }

  /**
   * Setup the map layers
   */
   Map.prototype.mapLayers = function() {

    //Base map layer
    this._cartoDBLight = new ol.layer.Tile({
      source: new ol.source.OSM({
        url: 'http://{a-b}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png' //Tile server
      })
    });

    // OpenWeathermap tile layers
    this._OWMtempLayer = new ol.layer.Tile({
      source: new ol.source.OSM({
        url: 'http://{s}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png',
        crossOrigin: null
      }),
      sphericalMercator: true,
      opacity: 0.5
      //extent: extent,
    });

    this._OWMrainLayer = new ol.layer.Tile({
      source: new ol.source.OSM({
        url: 'http://{s}.tile.openweathermap.org/map/rain/{z}/{x}/{y}.png',
        crossOrigin: null
      }),
      sphericalMercator: true,
      opacity: 0.5
      //extent: extent,
    });

    this._OWMcloudLayer = new ol.layer.Tile({
      source: new ol.source.OSM({
        url: 'http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png',
        crossOrigin: null
      }),
      sphericalMercator: true,
      opacity: 0.5
      //extent: extent,
    });

    this._OWMsnowLayer = new ol.layer.Tile({
      source: new ol.source.OSM({
        url: 'http://{s}.tile.openweathermap.org/map/snow/{z}/{x}/{y}.png',
        crossOrigin: null
      }),
      sphericalMercator: true,
      opacity: 0.5
      //extent: extent,
    });

    // Temperature layer
    this._cloudVecLayer = new ol.layer.Vector({
      source: this._cloudSource
    });

    // Rain layer
    this._RainVecLayer = new ol.layer.Vector({
      source: this._rainSource
    });
  };

  Map.prototype.weatherType = function(wdp) { //Snow and rain
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
  };

  /**
   * Setup controls for map
   */
   Map.prototype.setupMapControls = function() {
    ol.inherits(this.LayerControl, ol.control.Control);

    this._map.addLayer(this._cartoDBLight);
    this._map.getControls().extend([
      new ol.control.FullScreen()
      ]);
    this._map.getControls().extend([
      new this.LayerControl(this)
      ]);
    
    this._map.setView(this._view);

    var that = this;

    this._map.getView().on('change:resolution', function(){
      Map.prototype.updateLayers(that);
    });

  };


  /**
   * Shows popup at clicked city
   * @param  {that, Map object}
   */
  Map.prototype.handleMouse = function(that) {

    var element = document.getElementById('popup');
    var popup = new ol.Overlay({
      element: element,
      positioning: 'bottom-center',
      stopEvent: false
    });
    that._map.addOverlay(popup);

    // display popup on click
    that._map.on('click', function(evt) {

      var feature = that._map.forEachFeatureAtPixel(evt.pixel,
        function(feature) {
          return feature;
        });


      //if hit on icon
      if (feature) {
        popup.setPosition(evt.coordinate);

        var dataObject;
        for(var idx=0; idx < that._data.length; idx++){
            if( String(that._data[idx].name) == String(feature.getStyle().getText().getText())){
              updateLocation(idx,'t',0);
              dataObject=that._data[idx];
            }
        }
        
        $(element).popover({
          placement: 'bottom',
          html: true,
        });

        //Set content in popover
        $(element).data('bs.popover').options.content = function(){
          return "<b>"  + dataObject.name + "</b><br>" + 
          "Nederbörd: " + dataObject.mintimeseries[that._time].pit + "-" + dataObject.maxtimeseries[that._time].pit +" mm<br>" + 
          "Temperatur: "+ dataObject.mintimeseries[that._time].t   + "-" + dataObject.maxtimeseries[that._time].t   +" °C<br>" +
          "Vind: "      + dataObject.mintimeseries[that._time].ws  + "-" + dataObject.maxtimeseries[that._time].ws  +" m/s<br>";

        }

        $(element).popover('show');
      } 
      else {
        $(element).popover('destroy');
      } 

    });
     


    // change mouse cursor when over marker
    that._map.on('pointermove', function(e) {
      if (e.dragging) {
        $(element).popover('destroy');
        return;
      }
      var pixel = that._map.getEventPixel(e.originalEvent);
      var hit = that._map.hasFeatureAtPixel(pixel);
      //that._map.getTarget().style.cursor = hit ? 'pointer' : '';
      document.getElementById(that._map.getTarget()).style.cursor = hit ? 'pointer' : '';
    });
  }

  Map.prototype.updateLayers = function(that) {
    var currZoom = that._map.getView().getZoom();
    console.log("Currzoom lvl = " + currZoom);


    //Clear the source for the temp layer
        that._cloudSource.clear();


    for(var idx=0; idx < that._data.length; idx++){
      var dataZoom = that._data[idx].zoomlevel; // get curr zoom level on map

      //add icon only if datazoom<=currzoom
      if(dataZoom <= currZoom){

        var point = new ol.geom.Point(
          ol.proj.transform([that._data[idx].lon, that._data[idx].lat], 'EPSG:4326', 'EPSG:3857')
          );
        var pointFeatureTemp = new ol.Feature(point);

        var weatherIcon = "./images/icons/" + that.weatherType(that._data[idx].timeseries[that._time]) + ".png";

        // Style for each temperature point
        pointFeatureTemp.setStyle(new ol.style.Style({
          text: new ol.style.Text({
            text: String(that._data[idx].name), // .t = temperature
            scale: 1.3,
            fill: new ol.style.Fill({
              color: '#000'
            }),
          }),
          image: new ol.style.Icon({
            anchor: [0.5, -0.22],
            scale: 0.08,
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: weatherIcon
          }),
          data: that._data[idx]
        }));
        //Finally add style to icon
        that._cloudSource.addFeatures([pointFeatureTemp]); //Fill the this._cloudSource with point features
      }
    }
    };



Map.prototype.LayerControl = function(that, opt_options) {
  var options = opt_options || {};

    // Buttons
    var goToMyLocationBtn = document.createElement('button');
    var temperatureBtn = document.createElement('button');
    var rainBtn = document.createElement('button');
    var cloudBtn = document.createElement('button');
    var snowBtn = document.createElement('button');

    // http://ionicons.com/
    goToMyLocationBtn.className = 'icon ion-pinpoint';
    temperatureBtn.className = 'icon ion-thermometer';
    rainBtn.className = 'icon ion-umbrella';
    cloudBtn.className = 'icon ion-cloud';
    snowBtn.className = 'icon ion-ios-snowy';

    var handleGoToMyLocationBtn = function() {
      that.updateMap();
    };

    //Function to handle temperature button
    var handletemperatureBtn = function() {

      that._map.addLayer(that._OWMtempLayer);
      that._map.removeLayer(that._OWMsnowLayer);
      that._map.removeLayer(that._cloudVecLayer);
      that._map.removeLayer(that._OWMrainLayer);


      temperatureBtn.disabled = true;
      temperatureBtn.style.backgroundColor = 'gray';
      rainBtn.disabled = false;
      rainBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
      cloudBtn.disabled = false;
      cloudBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
      snowBtn.disabled = false;
      snowBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
      
    };

    //Function to handle rain button
    var handleRainBtn = function() {
      that._map.removeLayer(that._OWMtempLayer);
      that._map.removeLayer(that._OWMsnowLayer);
      that._map.removeLayer(that._cloudVecLayer);
      that._map.addLayer(that._OWMrainLayer);

      rainBtn.disabled = true;
      rainBtn.style.backgroundColor = 'gray';
      temperatureBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
      temperatureBtn.disabled = false;
      cloudBtn.disabled = false;
      cloudBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
      snowBtn.disabled = false;
      snowBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
    };

    var handleCloudBtn = function() {
      that._map.removeLayer(that._OWMtempLayer);
      that._map.removeLayer(that._OWMsnowLayer);
      that._map.addLayer(that._cloudVecLayer);
      that._map.removeLayer(that._OWMrainLayer);

      cloudBtn.disabled = true;
      cloudBtn.style.backgroundColor = 'gray';
      rainBtn.disabled = false;
      rainBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
      temperatureBtn.disabled = false;
      temperatureBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
      snowBtn.disabled = false;
      snowBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
    };

    var handleSnowBtn = function() {
      that._map.removeLayer(that._OWMtempLayer);
      that._map.addLayer(that._OWMsnowLayer);
      that._map.removeLayer(that._cloudVecLayer);
      that._map.removeLayer(that._OWMrainLayer);

      snowBtn.disabled = true;
      snowBtn.style.backgroundColor = 'gray';
      cloudBtn.disabled = false;
      cloudBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
      rainBtn.disabled = false;
      rainBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
      temperatureBtn.disabled = false;
      temperatureBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
    };

    goToMyLocationBtn.addEventListener('click', handleGoToMyLocationBtn, false);
    goToMyLocationBtn.addEventListener('click', handleGoToMyLocationBtn, false);
    temperatureBtn.addEventListener('click', handletemperatureBtn, false);
    temperatureBtn.addEventListener('touchstart', handletemperatureBtn, false);
    rainBtn.addEventListener('click', handleRainBtn, false);
    rainBtn.addEventListener('touchstart', handleRainBtn, false);
    cloudBtn.addEventListener('click', handleCloudBtn, false);
    cloudBtn.addEventListener('touchstart', handleCloudBtn, false);
    snowBtn.addEventListener('click', handleSnowBtn, false);
    snowBtn.addEventListener('touchstart', handleSnowBtn, false);

    /* Button div */
    var buttonDiv = document.createElement('div'); //Background div
    buttonDiv.className = 'map-buttonDiv';

    var buttonContainer = document.createElement('div'); //div containing buttons
    buttonDiv.appendChild(buttonContainer);
    buttonContainer.className = 'map-controls';
    buttonContainer.appendChild(goToMyLocationBtn);
    buttonContainer.appendChild(temperatureBtn);
    buttonContainer.appendChild(rainBtn);
    buttonContainer.appendChild(cloudBtn);
    buttonContainer.appendChild(snowBtn);

    ol.control.Control.call(this, {
      element: buttonDiv,
      target: options.target
    });

    handleCloudBtn(); //Set active layer to cloud layer on page load
  };

  /**
   * Adds a marker on the users location
   */
   Map.prototype.addMarker = function(that){
    that._markerSource = new ol.source.Vector({
      projection: 'EPSG:4326'
    });

    var markerFeature = new ol.Feature({
      geometry: new ol.geom.Point([16.1924, 58.5877]),
      name: 'Current position'
    });

    var markerStyle = new ol.style.Style({
      image: new ol.style.Icon({
        anchor:       [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src:          './images/marker.png'
      })
    });

    markerFeature.setStyle(markerStyle);

    that._markerSource.addFeatures(markerFeature);

    that._markerVecLayer = new ol.layer.Vector({
      source: that._markerSource
    });

    that._map.addLayer(that._markerVecLayer);
  };

  /**
   * Set current location to the map
   */
   Map.prototype.goToMyLocation = function(gpsLocation) {
    var loc = gpsLocation, map = this._map;
    if(loc) {
      loc.once('change', function() {
        // Save position and set map center
        map.getView().setCenter(ol.proj.fromLonLat(loc.getPosition()));
      });
    }
    else {
      alert("Couldn't find location");
    }
  };

  /**
   * Get current location from geolocation
   */
   Map.prototype.getCurrentLocation = function() {
    return new ol.Geolocation({
      tracking: true
    });
  };

  /**
   * Updates the map to current location
   * @param data
   */
   Map.prototype.updateMap = function(data) {
    var loc = this.gpsLocation;
    var pan = ol.animation.pan({
      duration: 1000,
      source: this._view.getCenter()
    });

    if(data) {
      //var FoundExtent = data[0].boundingbox;
      var placemark_lat = data[0].lat;
      var placemark_lon = data[0].lon;

      this._map.beforeRender(pan);
      this._map.getView().setCenter(ol.proj.transform([Number(placemark_lon), Number(placemark_lat)], 'EPSG:4326', 'EPSG:3857'));
    }

    else { // Use my location
      this._map.beforeRender(pan);
      this._map.getView().setCenter(ol.proj.fromLonLat(loc.getPosition()));
    }
  };

  return Map;
});