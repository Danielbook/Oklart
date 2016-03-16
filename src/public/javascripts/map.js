define(['map'], function (map) {

  /**
  * CONSTRUCTOR 
  */
  var map;
  var view;

  var Map = function() {
    // this._data = data;
    // console.log(this._data);
  };

  Map.prototype.initMap = function(smhidata) {

    /* ----------- Temperature layer -------------- */

      // Source for the vector layer
      var temperatureSource = new ol.source.Vector({
        projection: 'EPSG:4326'
      });

      var RainSource = new ol.source.Vector({
        projection: 'EPSG:4326'
      });

      for(i=0; i<smhidata.data.length; i++){
        var point = new ol.geom.Point(
          ol.proj.transform([smhidata.data[i].lon, smhidata.data[i].lat], 'EPSG:4326', 'EPSG:3857')
          );
        var pointFeatureTemp = new ol.Feature(point);
        var pointFeatureRain = new ol.Feature(point);

        // Style for each temperature point
        pointFeatureTemp.setStyle(new ol.style.Style({
          text: new ol.style.Text({
          text: String(smhidata.data[i].timeseries[0].t), // .t = temperature
          scale: 1.3,
          fill: new ol.style.Fill({
            color: '#000'
          })
        })
        }));

        temperatureSource.addFeatures([pointFeatureTemp]); //Fill the temperatureSource with point features

        //Style for each rain point
        pointFeatureRain.setStyle(new ol.style.Style({
          text: new ol.style.Text({
          text: String(smhidata.data[i].timeseries[0].pit), // .t = temperature
          scale: 1.3,
          fill: new ol.style.Fill({
            color: '#000'
          })
        })
        }));

        RainSource.addFeatures([pointFeatureRain]); //Fill the temperatureSource with point features

      }



      /* -------- Temperature heatmap -------------- */
  //http://jsfiddle.net/GFarkas/61dafv93/

  HMtempData = new ol.source.Vector();
    //Max- and min-temp for the heatmap to scale correctly
    var minScale = 0.1;
    var maxScale = 1.0;
    var minTemp = -10; 
    var maxTemp = 15;


    for(i=0; i<smhidata.data.length; i++){
      var coord = ol.proj.transform([smhidata.data[i].lon, smhidata.data[i].lat], 'EPSG:4326', 'EPSG:3857');
      var temper = smhidata.data[i].timeseries[0].t;
      var lonLat = new ol.geom.Point(coord);
      //scale [minTemp, maxTemp] to range [minScale, maxScale]
      var weight = (maxScale-minScale)*(temper - minTemp)/(maxTemp - minTemp) + minScale; // http://goo.gl/vGO5rr
      var pointFeature = new ol.Feature({
        geometry: lonLat,
        weight: weight,
      });

      HMtempData.addFeature(pointFeature);
    }


    // create the layer
    heatMapLayer = new ol.layer.Heatmap({
      source: HMtempData,
      gradient: ['#00AAE5', '#397BA0', '#724D5B', '#982E2D', '#BF1000'],
      radius: 20,
      blur: 80,
      opacity: .8
    });

    /* --------------------------------------------- */

    /* Layers */

    //Base map layer
    var cartoDBLight = new ol.layer.Tile({
      source: new ol.source.OSM({
      url: 'http://{a-b}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png' //Tile server
    })
    });

    var cloudLayer = new ol.layer.Tile({
      source: new ol.source.OSM({
      url: 'http://{a-b}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png' //Tile server
    })
    });

    // Temperature layer
    var temperatureVecLayer = new ol.layer.Vector({
      source: temperatureSource
    });


    // Rain layer
    var RainVecLayer = new ol.layer.Vector({
      source: RainSource
    });


    /* EJ FÅTT DETTA ATT FUNGERA ÄN
    var layer_cloud = new ol.layer.Tile({
      source: new ol.source.OSM({
         // url: 'http://${s}.tile.openweathermap.org/map/clouds/${z}/${x}/${y}.png'
         url: 'http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png'
        
      })
    });
    +*/


  //Bounding box
  var extent = ol.proj.transformExtent([2.25, 52.5, 38.00, 70.75], 'EPSG:4326', 'EPSG:3857');
  view = new ol.View({
    center: ol.proj.fromLonLat([15.380859, 62.160372]), //Mitt i sverige
    zoom: 4,
    //maxZoom: 10,
    //minZoom: 4,
    //extent: extent
  })

  /* -------- Controls -------- */

     /**
       * Define a namespace for the application.
       */
       window.app = {};
       var app = window.app;

      /**
       * @constructor
       * @extends {ol.control.Control}
       * @param {Object=} opt_options Control options.
       */
       app.LayerControl = function(opt_options) {

        var options = opt_options || {};

        /* Buttons */
        var temperatureButton = document.createElement('button');
        var rainBtn = document.createElement('button');
        var cloudBtn = document.createElement('button');
        var snowBtn = document.createElement('button');

        temperatureButton.className = 'btn btn-info glyphicon glyphicon-glass';
        rainBtn.className = 'btn btn-info glyphicon glyphicon-glass';
        cloudBtn.className = 'btn btn-info glyphicon glyphicon-glass';
        snowBtn.className = 'btn btn-info glyphicon glyphicon-glass';



        // temperatureButton.innerHTML = 'T';
        // rainBtn.innerHTML = 'R';
        // cloudBtn.innerHTML = 'C';
        // snowBtn.innerHTML = 'S';

        /* Event listeners */
        var this_ = this;

        //Function to handle temperature button
        var handleTemperatureButton = function() {
          this_.getMap().addLayer(temperatureVecLayer);
          this_.getMap().addLayer(heatMapLayer);
          this_.getMap().removeLayer(RainVecLayer);

          temperatureButton.disabled = true;
          temperatureButton.style.backgroundColor = 'gray';
          rainBtn.disabled = false;
          rainBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
          cloudBtn.disabled = false;
          cloudBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
          snowBtn.disabled = false;
          snowBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
        };

        //Function to handle rain button
        var handleRainBtn = function() {
          this_.getMap().addLayer(RainVecLayer);
          this_.getMap().removeLayer(temperatureVecLayer);
          this_.getMap().removeLayer(heatMapLayer);

          rainBtn.disabled = true;
          rainBtn.style.backgroundColor = 'gray';
          temperatureButton.style.backgroundColor = 'rgba(0,60,136,.5)';
          temperatureButton.disabled = false;
          cloudBtn.disabled = false;
          cloudBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
          snowBtn.disabled = false;
          snowBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
        };

        var handleCloudBtn = function() {
          this_.getMap().removeLayer(temperatureVecLayer);
          this_.getMap().removeLayer(heatMapLayer);
          this_.getMap().removeLayer(RainVecLayer);

          cloudBtn.disabled = true;
          cloudBtn.style.backgroundColor = 'gray';
          rainBtn.disabled = false;
          rainBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
          temperatureButton.disabled = false;
          temperatureButton.style.backgroundColor = 'rgba(0,60,136,.5)';
          snowBtn.disabled = false;
          snowBtn.style.backgroundColor = 'rgba(0,60,136,.5)';

        };

        var handleSnowBtn = function() {
          this_.getMap().removeLayer(temperatureVecLayer);
          this_.getMap().removeLayer(heatMapLayer);
          this_.getMap().removeLayer(RainVecLayer);

          snowBtn.disabled = true;
          snowBtn.style.backgroundColor = 'gray';
          cloudBtn.disabled = false;
          cloudBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
          rainBtn.disabled = false;
          rainBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
          temperatureButton.disabled = false;
          temperatureButton.style.backgroundColor = 'rgba(0,60,136,.5)';

        };

        temperatureButton.addEventListener('click', handleTemperatureButton, false);
        temperatureButton.addEventListener('touchstart', handleTemperatureButton, false);
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
        buttonContainer.appendChild(temperatureButton);
        buttonContainer.appendChild(rainBtn);
        buttonContainer.appendChild(cloudBtn);
        buttonContainer.appendChild(snowBtn);


        ol.control.Control.call(this, {
          element: buttonDiv,
          target: options.target
        });

      };
      ol.inherits(app.LayerControl, ol.control.Control);

      /*--------------------------------*/


      map = new ol.Map({
    target: 'map', //Attach map to 'map' div
    controls: ol.control.defaults({
     attributionOptions: /** @type {olx.control.AttributionOptions} */  ({
       collapsible: false
     })
   }).extend([
   new app.LayerControl()
   ]),

   layers: [
   cartoDBLight,
   //cloudLayer
   ],
   view: view

 });


      /* -------------- Gelocation ------------------- */

      var geolocation = new ol.Geolocation({
        tracking: true
      });

      if(geolocation){


        geolocation.once('change', function(evt) {
   //save position and set map center
   pos = geolocation.getPosition();
   map.getView().setCenter(ol.proj.fromLonLat(pos));

 });

      }
      else {
        alert("Couldn't find location");
      }
    }

    Map.prototype.updateMap = function(data) {

      var pan = ol.animation.pan({
        duration: 1000,
        source: view.getCenter()
      });

      var FoundExtent = data[0].boundingbox;
      var placemark_lat = data[0].lat;
      var placemark_lon = data[0].lon;

      map.beforeRender(pan);        
      map.getView().setCenter(ol.proj.transform([Number(placemark_lon), Number(placemark_lat)], 'EPSG:4326', 'EPSG:3857'));
    }

    return Map;
  });