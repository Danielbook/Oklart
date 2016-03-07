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

        // Style for each point
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
    // Vector layer
    var temperatureVecLayer = new ol.layer.Vector({
      source: temperatureSource
    });

  
    // Vector layer
    var RainVecLayer = new ol.layer.Vector({
      source: RainSource
    });



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
var cartoDBLight = new ol.layer.Tile({
  source: new ol.source.OSM({
      url: 'http://{a-b}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png' //Tile server
    })
});

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

        temperatureButton.innerHTML = 'T';
        rainBtn.innerHTML = 'R';


        /* Event listeners */
        var this_ = this;

        var handleTemperatureButton = function() {
          this_.getMap().addLayer(temperatureVecLayer);
          this_.getMap().removeLayer(RainVecLayer);
          this_.getMap().addLayer(heatMapLayer);

          temperatureButton.disabled = true;
          rainBtn.disabled = false;
          temperatureButton.style.backgroundColor = 'gray';
          rainBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
        };

        var handleRainBtn = function() {
          this_.getMap().addLayer(RainVecLayer);
          this_.getMap().removeLayer(temperatureVecLayer);
          this_.getMap().removeLayer(heatMapLayer);

          temperatureButton.disabled = false;
          rainBtn.disabled = true;
          rainBtn.style.backgroundColor = 'gray';
          temperatureButton.style.backgroundColor = 'rgba(0,60,136,.5)';
        };

        temperatureButton.addEventListener('click', handleTemperatureButton, false);
        temperatureButton.addEventListener('touchstart', handleTemperatureButton, false);
        rainBtn.addEventListener('click', handleRainBtn, false);
        rainBtn.addEventListener('touchstart', handleRainBtn, false);


        /* Button div */
        var element = document.createElement('div');
        element.className = 'map-controls ol-unselectable ol-control';
        element.appendChild(temperatureButton);
        element.appendChild(rainBtn);


        ol.control.Control.call(this, {
          element: element,
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