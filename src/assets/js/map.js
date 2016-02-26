function createMap(){

  //http://wiki.openstreetmap.org/wiki/Tile_servers
  var openTransportMapLayer = new ol.layer.Tile({
    source: new ol.source.OSM({
      url: 'http://{a-b}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png' //Tile server
    })
  });

  //Bounding box
  var extent = ol.proj.transformExtent([2.25, 52.5, 38.00, 70.75], 'EPSG:4326', 'EPSG:3857');
  var view = new ol.View({
    center: ol.proj.fromLonLat([62.160372, 15.380859]), //Mitt i sverige
    zoom: 4,
      //maxZoom: 6,
      //minZoom: 4,
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

    layers: [
    openTransportMapLayer,
    currPosVectorLayer
    ],
    view: view
    
  });

  /* -------------- Gelocation ------------------- */
  //create a vector source to add the icon(s) to.
  var geolocation = new ol.Geolocation({
    tracking: true
  });

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

    iconFeature.setStyle(markerIconStyle);

   //add icon to vector source
   currPosVectorSource.addFeature(iconFeature);       
});
  /*---------------------------------------------------*/

}


