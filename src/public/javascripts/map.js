define([
  'map'
], function (
  map
){
  "use strict";

  /**
   * Constructor for the map
   * @constructor Map
   * @param smhidata Data from smhi
   */
  var Map = function(smhidata) {          //minx, miny,  maxx,  maxy
    this._extent = ol.proj.transformExtent([7.25, 54.50, 25.00, 70.75], 'EPSG:4326', 'EPSG:3857');

    this._data = smhidata;
    this._map = new ol.Map({
      target: 'map',
      controls: ol.control.defaults({
        attributionOptions: ({
          collapsible: false
        })
      })
    });

    this._view = new ol.View({
      center: ol.proj.fromLonLat([16.1924, 58.5877]), // Norrköping
      zoom: 4,
      maxZoom: 10,
      minZoom: 4,
      extent: this._extent
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
   * @memberof Map
   * @method initMap
   * @param user
   */
  Map.prototype.initMap = function(user) {
    this.mapLayers();
    this.setupMapControls();
    this.goToMyLocation();
    this.updateLayers(this);
    this.handleMouse(this);
  };

  /**
   * Updates the maps time
   * @memberof Map
   * @method updateTime
   * @param time
   */
  Map.prototype.updateTime = function(time){
    this._time = time;
    this.updateLayers(this);
  };

  /**
   * Setup the map layers
   * @memberof Map
   * @method mapLayers
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

  /**
   * Function to check for weather type
   * @memberof Map
   * @method weatherType
   * @param wdp - string, Weather data point
   * @returns {string} - weather type, ties to the correct image
   */
  Map.prototype.weatherType = function(wdp) { //Snow and rain
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
   * @memberof Map
   * @method setupMapControls
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
   * @param that
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
              updateTable(0, idx);
              updateLocation(idx,'t',0);
              dataObject=that._data[idx];
            }
        }

        $(element).popover({
          placement: 'bottom',
          html: true
        });

        //Set content in popover
        $(element).data('bs.popover').options.content = function(){
          return "<b>"  + dataObject.name + "</b><br>" + 
          "Nederbörd: " + dataObject.mintimeseries[that._time].pit + " – " + dataObject.maxtimeseries[that._time].pit +" mm<br>" + 
          "Temperatur: "+ dataObject.mintimeseries[that._time].t   + " – " + dataObject.maxtimeseries[that._time].t   +" °C<br>" +
          "Vind: "      + dataObject.mintimeseries[that._time].ws  + " – " + dataObject.maxtimeseries[that._time].ws  +" m/s<br>";
        };

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
  };

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
            })
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

  /**
   * Setups the layer controls on the map
   * @memberof Map
   * @method LayerControl
   * @param that - this
   * @param opt_options
   */
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

    var handleButton = function(button, layer){
      //remove all layers
      that._map.removeLayer(that._OWMtempLayer);
      that._map.removeLayer(that._OWMsnowLayer);
      that._map.removeLayer(that._cloudVecLayer);
      that._map.removeLayer(that._OWMrainLayer);
      //add layer
      that._map.addLayer(layer);

      //disable all buttons
      temperatureBtn.disabled = false;
      temperatureBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
      rainBtn.disabled = false;
      rainBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
      cloudBtn.disabled = false;
      cloudBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
      snowBtn.disabled = false;
      snowBtn.style.backgroundColor = 'rgba(0,60,136,.5)';

      //enable button
      button.disabled = true;
      button.style.backgroundColor = 'gray';

    }

    //Function to handle temperature button
    var handletemperatureBtn = function() {
      handleButton(temperatureBtn, that._OWMtempLayer);
    };

    //Function to handle rain button
    var handleRainBtn = function() {
      handleButton(rainBtn, that._OWMrainLayer);
    };

    var handleCloudBtn = function() {
      handleButton(cloudBtn, that._cloudVecLayer);
    };

    var handleSnowBtn = function() {
      handleButton(snowBtn, that._OWMsnowLayer);
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
   * Set current location to the map and adds a marker on the users location
   * @memberof Map
   * @method goToMyLocation
   * @param gpsLocation {ol.Geolocation} - users location
   */
  Map.prototype.goToMyLocation = function() {
    var that = this;
    if(user.gpsLocation) {
      user.gpsLocation.once('change', function() {
        // Save position and set map center
        that._map.getView().setCenter(ol.proj.fromLonLat(user.gpsLocation.getPosition()));

        var iconFeatures=[];

        // create Feature... with coordinates
        var iconFeature = new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.transform(user.gpsLocation.getPosition(), 'EPSG:4326',
            'EPSG:3857'))
        });

        iconFeatures.push(iconFeature);

        var vectorSource = new ol.source.Vector({
          features: iconFeatures     //add an array of features
        });

        //create style for your feature...
        var iconStyle = new ol.style.Style({
          image: new ol.style.Icon( ({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: 'images/gps.png',
            scale: 0.15
          }))
        });

        var vectorLayer = new ol.layer.Vector({
          source: vectorSource,
          style: iconStyle
        });

        that._map.addLayer(vectorLayer);
      });
    }
    else {
      alert("Couldn't find location");
    }
  };

  /**
   * Get current location from geolocation
   * @memberof Map
   * @method getCurrentLocation
   * @return {ol.Geolocation} - Users location
   */
  Map.prototype.getCurrentLocation = function() {
    return new ol.Geolocation({
      tracking: true
    });
  };


  /**
   * Updates the map to chosen location.
   * @memberof Map
   * @method updateMap
   * @param data - Data sent from navbar
   */
  Map.prototype.updateMap = function(data) {
    var loc = this.gpsLocation;
    var pan = ol.animation.pan({
      duration: 1000,
      source: this._view.getCenter()
    });

    if(data) {
      //var FoundExtent = data[0].boundingbox;
      //var placemark_lat = data[0].lat;
      //var placemark_lon = data[0].lon;

      var placemark_lat = data.lat;
      var placemark_lon = data.lon;


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