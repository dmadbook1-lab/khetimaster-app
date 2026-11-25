/*
 * Leaflet map engine for the farm-mapping WebViews (satellite imagery with
 * labels, zoom up to 21). Screens draw through a tiny `KM` adapter.
 *
 * Adapter API (inside the WebView):
 *   KM.init({center:[lat,lng], zoom, onReady, onClick(lat,lng), onDragStart})
 *   KM.setView([lat,lng], zoom, animate) · KM.panTo([lat,lng]) · KM.getZoom()
 *   KM.zoomIn() · KM.zoomOut() · KM.toggleLayer()
 *   KM.marker([lat,lng], {html, size, z})            -> {setLatLng, remove}
 *   KM.circle([lat,lng], radius, style)              -> {setLatLng, setRadius, remove}
 *   KM.polygon(latlngs, style) · KM.polyline(latlngs, style) -> {remove}
 *   style: {color, weight, opacity, fillColor, fillOpacity, dashed}
 */

export const mapEngineHead = () => `
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html,body,#map{margin:0;padding:0;width:100%;height:100%;overflow:hidden;}
  .leaflet-control-container{display:none;}
</style>`;

export const mapEngineScript = () => `
var KM = (function(){
  var opts = null, ready = false, satellite = true;
  var lmap = null, lSat = null, lStreet = null;

  function fire(name){
    var fn = opts && opts[name];
    if (fn) { fn.apply(null, Array.prototype.slice.call(arguments, 1)); }
  }

  function lStyle(s, poly){
    var o = {color:s.color, weight:s.weight||3, opacity:s.opacity==null?1:s.opacity, interactive:false};
    if (s.dashed) { o.dashArray = '7 6'; }
    if (poly) { o.fillColor = s.fillColor||s.color; o.fillOpacity = s.fillOpacity==null?0.2:s.fillOpacity; }
    return o;
  }

  function init(o){
    opts = o;
    lmap = L.map('map',{zoomControl:false,attributionControl:false,maxZoom:21,minZoom:3,zoomSnap:0.5,zoomDelta:0.5})
      .setView(o.center, o.zoom);
    lSat = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',{maxZoom:21,subdomains:['0','1','2','3']});
    lStreet = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{maxZoom:21,subdomains:['0','1','2','3']});
    lSat.addTo(lmap);
    lmap.on('click', function(e){ fire('onClick', e.latlng.lat, e.latlng.lng); });
    lmap.on('dragstart', function(){ fire('onDragStart'); });
    ready = true;
    fire('onReady');
  }

  return {
    init: init,
    isReady: function(){ return ready; },
    setView: function(c, z, animate){
      lmap.setView(c, z == null ? lmap.getZoom() : Math.min(z, 21), {animate: !!animate});
    },
    panTo: function(c){ lmap.panTo(c, {animate:true}); },
    getZoom: function(){ return lmap ? lmap.getZoom() : 0; },
    zoomIn: function(){ lmap.zoomIn(); },
    zoomOut: function(){ lmap.zoomOut(); },
    toggleLayer: function(){
      satellite = !satellite;
      lmap.removeLayer(satellite ? lStreet : lSat);
      (satellite ? lSat : lStreet).addTo(lmap);
    },
    marker: function(pos, o){
      var size = o.size || 20;
      var lm = L.marker(pos, {interactive:false, zIndexOffset:o.z||0,
        icon:L.divIcon({className:'', html:o.html, iconSize:[size,size], iconAnchor:[size/2,size/2]})}).addTo(lmap);
      return {
        setLatLng: function(p){ lm.setLatLng(p); },
        remove: function(){ lmap.removeLayer(lm); }
      };
    },
    circle: function(pos, radius, s){
      var lc = L.circle(pos, Object.assign({radius:radius}, lStyle(s, true))).addTo(lmap);
      return {
        setLatLng: function(p){ lc.setLatLng(p); },
        setRadius: function(r){ lc.setRadius(r); },
        remove: function(){ lmap.removeLayer(lc); }
      };
    },
    polygon: function(latlngs, s){
      var lp = L.polygon(latlngs, lStyle(s, true)).addTo(lmap);
      return { remove: function(){ lmap.removeLayer(lp); } };
    },
    polyline: function(latlngs, s){
      var ll = L.polyline(latlngs, lStyle(s, false)).addTo(lmap);
      return { remove: function(){ lmap.removeLayer(ll); } };
    }
  };
})();
`;
