import React, {
  useMemo,
  useRef,
} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';

import {WebView} from 'react-native-webview';

const {height} = Dimensions.get('window');

const GREEN = '#16883E';

const DEFAULT_CLOUD_THRESHOLD = 60;

export default function SatelliteMap({
  coordinates,
  indexData,
  indexLoading,
  selectedDate,
  selectedSatellite,
  cloudCover,
  selectedIndex,
}) {
  const webViewRef = useRef(null);

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

    const indexJSON =
      JSON.stringify(selectedIndex);

    return `
      <!DOCTYPE html>

      <html>
        <head>

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
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
            ${indexJSON}
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
              });

            L.tileLayer(
              'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
              {
                maxZoom: 20,
                attribution:
                  '&copy; Google',
              }
            ).addTo(map);

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

            map.fitBounds(
              polygon.getBounds(),
              {
                padding: [30, 30],
                maxZoom: 17,
              }
            );

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

            window.ReactNativeWebView &&
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  type: 'MAP_READY',
                })
              );

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

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{html}}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        automaticallyAdjustContentInsets={false}
        style={styles.webView}
      />

      {indexLoading && (
        <View style={styles.loader}>
          <View style={styles.loaderCircle}>
            <ActivityIndicator
              size="small"
              color={GREEN}
            />
          </View>

          <Text style={styles.loaderText}>
            Processing satellite imagery
          </Text>

          <Text style={styles.loaderSubtext}>
            This may take a few seconds
          </Text>
        </View>
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

  loader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor:
      'rgba(255,255,255,0.76)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderCircle: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  loaderText: {
    marginTop: 10,
    color: '#142018',
    fontSize: 12,
    fontWeight: '800',
  },

  loaderSubtext: {
    marginTop: 3,
    color: '#728078',
    fontSize: 9,
    fontWeight: '500',
  },
});