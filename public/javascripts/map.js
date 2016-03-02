define(['map'], function (map) {

  /**
  * CONSTRUCTOR 
  */
  var Map = function() {
    // this._data = data;
    // console.log(this._data);
  };

  Map.prototype.initMap = function(smhidata) {

var cartoDBLight = new ol.layer.Tile({
    source: new ol.source.OSM({
      url: 'http://{a-b}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png' //Tile server
    })
  });

  //Bounding box
  var extent = ol.proj.transformExtent([2.25, 52.5, 38.00, 70.75], 'EPSG:4326', 'EPSG:3857');
  var view = new ol.View({
    center: ol.proj.fromLonLat([15.380859, 62.160372]), //Mitt i sverige
    zoom: 4,
      maxZoom: 10,
      minZoom: 4,
      //extent: extent
    })


     /* -------- Marker layer -------- */
  var currPosVectorSource = new ol.source.Vector({});
  var currPosVectorLayer = new ol.layer.Vector({
    source: currPosVectorSource
  });

  var markerIconStyle = new ol.style.Style({
    image: new ol.style.Icon(({
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      opacity: 0.75,
      scale: 0.5,
      src: './assets/img/icon.png'
    }))
  });
  /*--------------------------------*/

  var map = new ol.Map({
    target: 'map', //Attach map to 'map' div
    controls: ol.control.defaults({
      attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
        collapsible: false
      })
    }).extend([
   //   new app.RotateNorthControl()
    ]),

    layers: [
    cartoDBLight,
    currPosVectorLayer
    ],
    view: view
    
  });



  /* -------------- Gelocation ------------------- */
  //create a vector source to add the icon(s) to.

  var geolocation = new ol.Geolocation({
    tracking: true
  });

  if(geolocation){
    console.log("Succes!");
  
  //create a vector source to add the icon(s) to.

  geolocation.once('change', function(evt) {
   //save position and set map center
    pos = geolocation.getPosition();
    map.getView().setCenter(ol.proj.fromLonLat(pos));

  
   //create icon at new map center
   var iconFeature = new ol.Feature({
     geometry: new ol.geom.Point(ol.proj.fromLonLat(pos)), 
     style: markerIconStyle
   });

   //iconFeature.setStyle(markerIconStyle);
   //currPosVectorSource.addFeature(iconFeature);    
      
 });

  }
  else {
    alert("Couldn't find location");
  }
  /*---------------------------------------------------*/


 document.getElementById("SearchBtn").onclick = function(){

    var pan = ol.animation.pan({
      duration: 1000,
      source: view.getCenter()
    });

     var AdresFalt = $("#CitySearch") ;
       $.getJSON('http://nominatim.openstreetmap.org/search?format=json&q=' + AdresFalt.val(), function(data) {
            var FoundExtent = data[0].boundingbox;
            var placemark_lat = data[0].lat;
            var placemark_lon = data[0].lon;
          
          map.beforeRender(pan);        
          map.getView().setCenter(ol.proj.transform([Number(placemark_lon), Number(placemark_lat)], 'EPSG:4326', 'EPSG:3857'));
        
       }); 
    }   


$("#CitySearch").keypress(function(e){
    if(e.which == 13){
    var pan = ol.animation.pan({
      duration: 1000,
      source: view.getCenter()
    });

     var AdresFalt = $("#CitySearch") ;
       $.getJSON('http://nominatim.openstreetmap.org/search?format=json&q=' + AdresFalt.val(), function(data) {
            var FoundExtent = data[0].boundingbox;
            var placemark_lat = data[0].lat;
            var placemark_lon = data[0].lon;
          
          map.beforeRender(pan);        
          map.getView().setCenter(ol.proj.transform([Number(placemark_lon), Number(placemark_lat)], 'EPSG:4326', 'EPSG:3857'));
        
       }); 
    }
  });

/* ------ Autocomplete ------ */
var input = document.getElementById('CitySearch');
var options = {};
    
new google.maps.places.Autocomplete(input, options);

/* ---------------------------*/

  }


  return Map;
});