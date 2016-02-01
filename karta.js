

var osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM()
});

var osmLayer2 = new ol.layer.Tile({
  source: new ol.source.MapQuest({layer: 'osm'})
});

var Stamen = new ol.layer.Tile({
            source: new ol.source.Stamen({
              layer: 'watercolor'
            })
          });

//http://wiki.openstreetmap.org/wiki/Tile_servers
var openTransportMapLayer = new ol.layer.Tile({
  source: new ol.source.OSM({
    url: 'http://{a-b}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png'
  })
});

var map = new ol.Map({
        target: 'map', //Attach map to 'map' div
       
        layers: [
          openTransportMapLayer
        ],

        view: new ol.View({
          center: ol.proj.fromLonLat([16.192420999999968, 58.587745]),
          zoom: 4,
          maxZoom: 6,
          minZoom: 4
      })
});
