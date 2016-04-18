"use strict";

define([
  'map'
], function (
  map
){
  /**
   * Constructor for the map
   * @param smhidata
   * @constructor
   */
  var Map = function(smhidata) {
    this._data = smhidata;
    this._map = new ol.Map({target: 'map'});
    this._view = new ol.View({
      center: ol.proj.fromLonLat([16.1924, 58.5877]), // Norrköping
      zoom: 4
      //maxZoom: 10,
      //minZoom: 4,
      //extent: extent
    });
    this._myPosLatLon = "";
    this._geolocation = "";
    this._cartoDBLight = "";
    this._temperatureSource = "";
    this._rainSource = "";

    this._OWMtempLayer = "";
    this._OWMrainLayer = "";
    this._OWMcloudLayer = "";

    this._temperatureVecLayer= "";
    this._RainVecLayer = "";

    this._markerSource = "";
    this._markerVecLayer = "";

    this._userLocation = this.getCurrentLocation();
  };

  /**
   * Inits the map
   */
  Map.prototype.initMap = function() {
    this.temperatureLayer();
    this.heatMap();
    this.mapLayers();
    this.setupMapControls();
    this.goToMyLocation();
    this.addMarker(this);
    this.updateLayers(this);
  };

  /**
   * Setup the temperature layer
   */
  Map.prototype.temperatureLayer = function() {
    // Source for the vector layer
    this._temperatureSource = new ol.source.Vector({
      projection: 'EPSG:4326'
    });

    this._rainSource = new ol.source.Vector({
      projection: 'EPSG:4326'
    });

    for(var idx = 0; idx < this._data.length; idx++) {
      var point = new ol.geom.Point(
        ol.proj.transform([this._data[idx].lon, this._data[idx].lat], 'EPSG:4326', 'EPSG:3857')
      );
      var pointFeatureTemp = new ol.Feature(point);
      var pointFeatureRain = new ol.Feature(point);

      // Style for each temperature point
      pointFeatureTemp.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: String(this._data[idx].timeseries[0].t), // .t = temperature

          scale: 1.3,
          fill: new ol.style.Fill({
            color: '#000'
          })
        })
      }));

      this._temperatureSource.addFeatures([pointFeatureTemp]); //Fill the this._temperatureSource with point features

      //Style for each rain point
      pointFeatureRain.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: String(this._data[idx].timeseries[0].pit), // .t = temperature
          scale: 1.3,
          fill: new ol.style.Fill({
            color: '#000'
          })
        })
      }));
      this._rainSource.addFeatures([pointFeatureRain]); //Fill the this._temperatureSource with point features
    }
  };

  /**
   * Setup the heatmap
   */
  Map.prototype.heatMap = function() { //http://jsfiddle.net/GFarkas/61dafv93/
    var HMtempData = new ol.source.Vector();
    //Max- and min-temp for the heatmap to scale correctly
    var minScale = 0.1;
    var maxScale = 1.0;
    var minTemp = -10;
    var maxTemp = 15;

    for(var idx = 0; idx < this._data.length; idx++){
      var coord = ol.proj.transform([this._data[idx].lon, this._data[idx].lat], 'EPSG:4326', 'EPSG:3857');
      var temper = this._data[idx].timeseries[0].t;
      var lonLat = new ol.geom.Point(coord);
      //scale [minTemp, maxTemp] to range [minScale, maxScale]
      var weight = (maxScale-minScale)*(temper - minTemp)/(maxTemp - minTemp) + minScale; // http://goo.gl/vGO5rr
      var pointFeature = new ol.Feature({
        geometry: lonLat,
        weight: weight
      });

      HMtempData.addFeature(pointFeature);
    }

    // create the layer
    var heatMapLayer = new ol.layer.Heatmap({
      source: HMtempData,
      gradient: ['#00AAE5', '#397BA0', '#724D5B', '#982E2D', '#BF1000'],
      radius: 20,
      blur: 80,
      opacity: .8
    });
  };

  /**
   * Setup the map layers
   */
  Map.prototype.mapLayers = function() {
    var extent = ol.proj.transformExtent([2.25, 52.5, 38.00, 70.75], 'EPSG:4326', 'EPSG:3857');

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
    this._temperatureVecLayer = new ol.layer.Vector({
      source: this._temperatureSource
    });

    // Rain layer
    this._RainVecLayer = new ol.layer.Vector({
      source: this._rainSource
    });

    /* EJ FÅTT DETTA ATT FUNGERA ÄN
     var layer_cloud = new ol.layer.Tile({
     source: new ol.source.OSM({
     // url: 'http://${s}.tile.openweathermap.org/map/clouds/${z}/${x}/${y}.png'
     url: 'http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png'

     })
     });
     +*/

    // Bounding box

  };

  /**
   * Setup controls for map
   */
  Map.prototype.setupMapControls = function() {
    ol.inherits(this.LayerControl, ol.control.Control);

    this._map.addLayer(this._cartoDBLight);
    this._map.getControls().extend([
      new this.LayerControl(this)
    ]);
    this._map.setView(this._view);

    var that = this;

    this._map.getView().on('change:resolution', function(){
      Map.prototype.updateLayers(that);
    });
  };

  Map.prototype.updateLayers = function(that) {
    var currZoom = that._map.getView().getZoom();
    console.log("Currzoom lvl = " + currZoom);

    //Clear the source for the temp layer
    that._temperatureSource.clear();

    for(var idx=0; idx < that._data.length; idx++){
      var dataZoom = that._data[idx].zoomlevel; // get curr zoom level on map

      //add icon only if datazoom<=currzoom
      if(dataZoom <= currZoom){

        var point = new ol.geom.Point(
          ol.proj.transform([that._data[idx].lon, that._data[idx].lat], 'EPSG:4326', 'EPSG:3857')
        );
        var pointFeatureTemp = new ol.Feature(point);

        var weatherIcon = './images/icons/cloudy.png';

        // Style for each temperature point
        pointFeatureTemp.setStyle(new ol.style.Style({
          text: new ol.style.Text({
            text: String(that._data[idx].name), // .t = temperature
            scale: 1.3,
            fill: new ol.style.Fill({
              color: '#000'
            })
          }),
          image: new ol.style.Icon({
            anchor: [0.5, -0.4],
            scale: 0.08,
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: weatherIcon
          })
        }));

        //Finally add style to icon
        that._temperatureSource.addFeatures([pointFeatureTemp]); //Fill the this._temperatureSource with point features
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

    // temperatureBtn.innerHTML = 'T';
    // rainBtn.innerHTML = 'R';
    // cloudBtn.innerHTML = 'C';
    // snowBtn.innerHTML = 'S';

    var handleGoToMyLocationBtn = function() {
      that.updateMap();
    };

    //Function to handle temperature button
    var handletemperatureBtn = function() {
      that._map.addLayer(that._temperatureVecLayer);
      that._map.removeLayer(that._OWMsnowLayer);
      that._map.removeLayer(that._OWMcloudLayer);
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
      that._map.removeLayer(that._temperatureVecLayer);
      that._map.removeLayer(that._OWMsnowLayer);
      that._map.removeLayer(that._OWMcloudLayer);
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
      that._map.removeLayer(that._temperatureVecLayer);
      that._map.removeLayer(that._OWMsnowLayer);
      that._map.addLayer(that._OWMcloudLayer);
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
      that._map.removeLayer(that._temperatureVecLayer);
      that._map.addLayer(that._OWMsnowLayer);
      that._map.removeLayer(that._OWMcloudLayer);
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
  Map.prototype.goToMyLocation = function() {
    var loc = this._userLocation, map = this._map;
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
    var loc = this._userLocation;
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