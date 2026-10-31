import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';

import {WebView} from 'react-native-webview';

import SatelliteScanLoader from './SatelliteScanLoader';

const {height} = Dimensions.get('window');

const DEFAULT_CLOUD_THRESHOLD = 60;

export default function SatelliteMap({
  coordinates,
  indexData,
  indexLoading,
  selectedDate,
  selectedSatellite,
  cloudCover,
  selectedIndex,
  onInteractionChange,
}) {
  const webViewRef = useRef(null);

  const [mapReady, setMapReady] =
    useState(false);

  const html = useMemo(() => {
    const safeCoordinates =
      Array.isArray(coordinates)
        ? coordinates
            .map(point => ({
              lat: Number(point?.lat),
              lng: Number(point?.lng),
            }))
            .filter(
              point =>
                Number.isFinite(point.lat) &&
                Number.isFinite(point.lng),
            )
        : [];

    if (safeCoordinates.length < 3) {
      return `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;background:#F8FAFC;">
            <div style="
              height:100vh;
              display:flex;
              align-items:center;
              justify-content:center;
              font-family:Arial;
              color:#6B7280;
              font-size:13px;
            ">
              Farm boundary unavailable
            </div>

            <script>
              window.ReactNativeWebView &&
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({type: 'MAP_READY'})
                );
            </script>
          </body>
        </html>
      `;
    }

    const polygonCoordinates =
      safeCoordinates.map(point => [
        point.lat,
        point.lng,
      ]);

    const first = polygonCoordinates[0];

    const last =
      polygonCoordinates[
        polygonCoordinates.length - 1
      ];

    if (
      first[0] !== last[0] ||
      first[1] !== last[1]
    ) {
      polygonCoordinates.push([...first]);
    }

    const imageBase64 =
      typeof indexData?.image_base64 === 'string' &&
      indexData.image_base64.length <= 2500000
        ? indexData.image_base64
        : null;

    let imageBounds = null;

    if (
      Array.isArray(indexData?.bounds) &&
      indexData.bounds.length === 4
    ) {
      const west = Number(indexData.bounds[0]);
      const south = Number(indexData.bounds[1]);
      const east = Number(indexData.bounds[2]);
      const north = Number(indexData.bounds[3]);

      if (
        Number.isFinite(west) &&
        Number.isFinite(south) &&
        Number.isFinite(east) &&
        Number.isFinite(north)
      ) {
        imageBounds = [
          [south, west],
          [north, east],
        ];
      }
    }

    if (!imageBounds) {
      const lats = safeCoordinates.map(
        point => point.lat,
      );

      const lngs = safeCoordinates.map(
        point => point.lng,
      );

      const south = Math.min(...lats);
      const north = Math.max(...lats);
      const west = Math.min(...lngs);
      const east = Math.max(...lngs);

      imageBounds = [
        [south, west],
        [north, east],
      ];
    }

    const polygonJSON =
      JSON.stringify(polygonCoordinates);

    const imageBoundsJSON =
      JSON.stringify(imageBounds);

    const imageJSON = imageBase64
      ? JSON.stringify(
          `data:image/png;base64,${imageBase64}`,
        )
      : 'null';

    const cloudJSON =
      cloudCover === null ||
      cloudCover === undefined
        ? 'null'
        : JSON.stringify(cloudCover);

    const satelliteJSON =
      JSON.stringify(selectedSatellite);

    const indexLabel = String(
      selectedIndex || 'Satellite',
    ).replace(/[^A-Za-z0-9 ]/g, ' ');

    return `
      <!DOCTYPE html>

      <html>
        <head>

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />

          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css"
          />

          <script
            src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"
          ></script>

          <style>

            html,
            body,
            #map {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
              background: #F8FAFC;
              touch-action: none;
              -webkit-tap-highlight-color: transparent;
            }

            .leaflet-control-attribution {
              font-size: 8px !important;
              opacity: 0.65;
            }

            .map-pill {
              position: absolute;
              top: 14px;
              left: 14px;
              z-index: 9999;

              background: rgba(255,255,255,0.96);

              border-radius: 12px;

              padding: 8px 11px;

              box-shadow:
                0 4px 15px rgba(0,0,0,0.14);

              font-family: Arial, sans-serif;

              font-size: 11px;

              font-weight: 700;

              color: #172019;
            }

            .map-tools {
              position: absolute;
              right: 12px;
              bottom: 14px;
              z-index: 9999;

              display: flex;
              flex-direction: column;

              background: rgba(255,255,255,0.97);

              border-radius: 12px;

              overflow: hidden;

              box-shadow:
                0 4px 15px rgba(0,0,0,0.16);
            }

            .map-tools button {
              width: 38px;
              height: 38px;

              border: 0;
              background: transparent;

              display: flex;
              align-items: center;
              justify-content: center;

              color: #0D6B30;

              font-family: Arial, sans-serif;
              font-size: 20px;
              font-weight: 700;

              padding: 0;
            }

            .map-tools button:active {
              background: #EAF7EF;
            }

            .map-tools .divider {
              height: 1px;
              margin: 0 7px;
              background: #E7ECE9;
            }

            .pinch-hint {
              position: absolute;
              left: 50%;
              top: 50%;
              z-index: 9999;

              transform: translate(-50%, -50%);

              background: rgba(7,67,30,0.82);

              color: #FFFFFF;

              border-radius: 20px;

              padding: 8px 14px;

              font-family: Arial, sans-serif;
              font-size: 11px;
              font-weight: 700;

              white-space: nowrap;

              pointer-events: none;

              opacity: 0;

              transition: opacity 0.5s ease;
            }

            .pinch-hint.show {
              opacity: 1;
            }

            .cloud-warning {
              position: absolute;

              left: 50%;
              bottom: 16px;

              transform: translateX(-50%);

              z-index: 9999;

              background: rgba(255,255,255,0.96);

              border-radius: 10px;

              padding: 8px 12px;

              box-shadow:
                0 3px 12px rgba(0,0,0,0.14);

              font-family: Arial, sans-serif;

              color: #7C5A00;

              font-size: 11px;

              font-weight: 700;

              white-space: nowrap;
            }

            .empty {
              position: absolute;

              inset: 0;

              z-index: 9998;

              display: flex;

              align-items: center;

              justify-content: center;

              pointer-events: none;

              font-family: Arial, sans-serif;

              color: #6B7280;

              font-size: 13px;
            }

          </style>
        </head>

        <body>

          <div id="map"></div>

          <div
            id="mapPill"
            class="map-pill">
            ${indexLabel}
          </div>

          <div class="map-tools">
            <button id="zoomIn" aria-label="Zoom in">+</button>
            <div class="divider"></div>
            <button id="zoomOut" aria-label="Zoom out">&minus;</button>
            <div class="divider"></div>
            <button id="recenter" aria-label="Fit farm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D6B30" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                <circle cx="12" cy="12" r="7"/>
              </svg>
            </button>
          </div>

          <div id="pinchHint" class="pinch-hint">
            Pinch to zoom &middot; drag to move
          </div>

          <div
            id="cloudWarning"
            class="cloud-warning"
            style="display:none;">
            High cloud cover may affect image quality
          </div>

          <div
            id="empty"
            class="empty"
            style="display:none;">
            No satellite image available
          </div>

          <script>

            const farmCoordinates =
              ${polygonJSON};

            const imageBounds =
              ${imageBoundsJSON};

            const imageData =
              ${imageJSON};

            const cloudCover =
              ${cloudJSON};

            const satellite =
              ${satelliteJSON};

            const map =
              L.map('map', {
                zoomControl: false,
                attributionControl: true,
                dragging: true,
                touchZoom: true,
                doubleClickZoom: true,
                scrollWheelZoom: false,
                boxZoom: false,
                tap: false,
                zoomSnap: 0.25,
                bounceAtZoomLimits: false,
                minZoom: 4,
                maxZoom: 20,
              });

            let readySent = false;

            const sendReady = () => {
              if (readySent) {
                return;
              }

              readySent = true;

              window.ReactNativeWebView &&
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({
                    type: 'MAP_READY',
                  })
                );
            };

            const tiles = L.tileLayer(
              'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
              {
                maxZoom: 20,
                attribution:
                  '&copy; Google',
              }
            );

            tiles.once('load', sendReady);

            tiles.addTo(map);

            // Never leave the loader up if tiles stall.
            setTimeout(sendReady, 6000);

            const polygon =
              L.polygon(
                farmCoordinates,
                {
                  color: '#16883E',
                  weight: 3,
                  opacity: 0.95,
                  fill: false,
                }
              ).addTo(map);

            const fitFarm = animate => {
              map.fitBounds(
                polygon.getBounds(),
                {
                  padding: [30, 30],
                  maxZoom: 17,
                  animate,
                }
              );
            };

            fitFarm(false);

            const tap = (id, handler) => {
              const el = document.getElementById(id);

              L.DomEvent.disableClickPropagation(el);

              el.addEventListener('click', e => {
                e.preventDefault();
                handler();
              });
            };

            tap('zoomIn', () => map.zoomIn(1));
            tap('zoomOut', () => map.zoomOut(1));
            tap('recenter', () => fitFarm(true));

            if (imageData) {
              L.imageOverlay(
                imageData,
                imageBounds,
                {
                  opacity: 0.84,
                  interactive: false,
                }
              ).addTo(map);
            }

            if (
              satellite === 's2' &&
              cloudCover !== null &&
              cloudCover > ${DEFAULT_CLOUD_THRESHOLD}
            ) {
              document.getElementById(
                'cloudWarning'
              ).style.display = 'block';
            }

            if (!imageData) {
              document.getElementById(
                'empty'
              ).style.display = 'flex';
            }

            const hint =
              document.getElementById('pinchHint');

            setTimeout(() => hint.classList.add('show'), 700);

            const hideHint = () =>
              hint.classList.remove('show');

            setTimeout(hideHint, 3200);

            map.on('zoomstart movestart', hideHint);

          </script>

        </body>
      </html>
    `;
  }, [
    coordinates,
    indexData,
    cloudCover,
    selectedSatellite,
    selectedIndex,
  ]);

  useEffect(() => {
    setMapReady(false);
  }, [html]);

  const handleMessage = useCallback(
    event => {
      try {
        const message = JSON.parse(
          event.nativeEvent.data,
        );

        if (message?.type === 'MAP_READY') {
          setMapReady(true);
        }
      } catch {
        // Ignore non-JSON messages.
      }
    },
    [],
  );

  // Hand gestures to the map while a finger is on it so the parent
  // ScrollView does not steal pinch / pan.
  const setInteracting = active => {
    onInteractionChange &&
      onInteractionChange(active);
  };

  return (
    <View
      style={styles.container}
      onTouchStart={() =>
        setInteracting(true)
      }
      onTouchEnd={() =>
        setInteracting(false)
      }
      onTouchCancel={() =>
        setInteracting(false)
      }>
      <WebView
        ref={webViewRef}
        source={{html}}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        nestedScrollEnabled
        setBuiltInZoomControls={false}
        automaticallyAdjustContentInsets={false}
        onMessage={handleMessage}
        style={styles.webView}
      />

      {(indexLoading || !mapReady) && (
        <SatelliteScanLoader
          title={
            indexLoading
              ? 'Scanning your field'
              : 'Loading map'
          }
          mapOnly={!indexLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: Math.max(410, height * 0.47),
    backgroundColor: '#EEF2F0',
    position: 'relative',
  },

  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
