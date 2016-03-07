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

      /*----------------------------------------*/
      // Source
      var vectorSource = new ol.source.Vector({
        projection: 'EPSG:4326'
      });

      for(i=0; i<smhidata.data.length; i++){
        var point = new ol.geom.Point(
          ol.proj.transform([smhidata.data[i].lon, smhidata.data[i].lat], 'EPSG:4326', 'EPSG:3857')
          );
        var pointFeature = new ol.Feature(point);
        vectorSource.addFeatures([pointFeature]);
      }
    // Vector layer
    var vectorLayer = new ol.layer.Vector({
      source: vectorSource
    });



      /* ------------------------------------- */

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
        var cloudBtn = document.createElement('button');
        var rainBtn = document.createElement('button');

        cloudBtn.innerHTML = 'C';
        rainBtn.innerHTML = 'R';


        /* Event listeners */
        var this_ = this;

        var handleCloudBtn = function() {
          this_.getMap().addLayer(vectorLayer);
          cloudBtn.style.backgroundColor = 'gray';
          rainBtn.style.backgroundColor = 'rgba(0,60,136,.5)';
        };

        var handleRainBtn = function() {
          this_.getMap().removeLayer(vectorLayer);
          rainBtn.style.backgroundColor = 'gray';
          cloudBtn.style.backgroundColor = 'rgba(0,60,136,.5)';


        };

        cloudBtn.addEventListener('click', handleCloudBtn, false);
        cloudBtn.addEventListener('touchstart', handleCloudBtn, false);
        rainBtn.addEventListener('click', handleRainBtn, false);
        rainBtn.addEventListener('touchstart', handleRainBtn, false);


        /* Button div */
        var element = document.createElement('div');
        element.className = 'map-controls ol-unselectable ol-control';
        element.appendChild(cloudBtn);
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