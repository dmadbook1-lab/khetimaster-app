import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {WebView} from 'react-native-webview';

import LinearGradient from 'react-native-linear-gradient';

import {
  ArrowLeft,
  Check,
  RotateCcw,
  LocateFixed,
  Layers,
  Plus,
  Minus,
  MapPin,
  X,
  Ruler,
  Maximize2,
  Trash2,
  Save,
} from 'lucide-react-native';

import {useLocation} from '../../context/LocationContext';

const {width, height} = Dimensions.get('window');

const GREEN = '#159447';
const DARK_GREEN = '#075A53';
const DARK = '#111827';
const YELLOW = '#FCC21B';

const isSmall = width < 360;
const isShort = height < 700;

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size - 3,
    Math.min(
      size * scale,
      size + 2,
    ),
  );
};

const MIN_POINTS = 3;

export default function MapYourFarmScreen({
  navigation,
}) {
  const webRef = useRef(null);

  const drawerAnim = useRef(
    new Animated.Value(height),
  ).current;

  const {
    location,
    loading: locationLoading,
    error: locationError,
    refreshLocation,
  } = useLocation();

  const [points, setPoints] = useState([]);

  const [area, setArea] = useState(0);

  const [perimeter, setPerimeter] = useState(0);

  const [showTip, setShowTip] = useState(true);

  const [drawerVisible, setDrawerVisible] =
    useState(false);

  const [mapReady, setMapReady] =
    useState(false);

  const [drawing, setDrawing] =
    useState(true);

  const html = useMemo(
    () => createLeafletHtml(),
    [],
  );

  /*
   * ------------------------------------------------
   * LOCATION -> MAP
   * ------------------------------------------------
   */

  useEffect(() => {
    if (
      !mapReady ||
      !Number.isFinite(
        Number(location?.latitude),
      ) ||
      !Number.isFinite(
        Number(location?.longitude),
      )
    ) {
      return;
    }

    sendLocationToMap(
      Number(location.latitude),
      Number(location.longitude),
      Number(location.accuracy || 30),
      true,
    );
  }, [
    mapReady,
    location?.latitude,
    location?.longitude,
    location?.accuracy,
  ]);

  /*
   * ------------------------------------------------
   * SEND COMMAND TO WEBVIEW
   * ------------------------------------------------
   */

  const sendToMap = useCallback(action => {
    if (!webRef.current) {
      return;
    }

    webRef.current.postMessage(
      JSON.stringify({
        action,
      }),
    );
  }, []);

  /*
   * ------------------------------------------------
   * LOCATION COMMAND
   * ------------------------------------------------
   */

  const sendLocationToMap = useCallback(
    (
      latitude,
      longitude,
      accuracy,
      center = true,
    ) => {
      if (!webRef.current) {
        return;
      }

      const lat = Number(latitude);
      const lng = Number(longitude);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        return;
      }

      webRef.current.postMessage(
        JSON.stringify({
          action: 'setUserLocation',

          latitude: lat,

          longitude: lng,

          accuracy:
            Number.isFinite(
              Number(accuracy),
            )
              ? Number(accuracy)
              : 30,

          center,
        }),
      );
    },
    [],
  );

  /*
   * ------------------------------------------------
   * CURRENT LOCATION
   * ------------------------------------------------
   */

  const handleLocate = useCallback(
    async () => {
      if (
        Number.isFinite(
          Number(location?.latitude),
        ) &&
        Number.isFinite(
          Number(location?.longitude),
        )
      ) {
        sendLocationToMap(
          location.latitude,
          location.longitude,
          location.accuracy,
          true,
        );

        return;
      }

      try {
        const refreshed =
          await refreshLocation();

        if (
          refreshed &&
          Number.isFinite(
            Number(refreshed.latitude),
          ) &&
          Number.isFinite(
            Number(refreshed.longitude),
          )
        ) {
          sendLocationToMap(
            refreshed.latitude,
            refreshed.longitude,
            refreshed.accuracy,
            true,
          );
        }
      } catch (error) {
        console.log(
          '[FarmMap] Location error:',
          error,
        );
      }
    },
    [
      location,
      refreshLocation,
      sendLocationToMap,
    ],
  );

  /*
   * ------------------------------------------------
   * WEBVIEW MESSAGE
   * ------------------------------------------------
   */

  const onMessage = useCallback(
    event => {
      try {
        const data = JSON.parse(
          event.nativeEvent.data,
        );

        /*
         * MAP READY
         */

        if (
          data.type ===
          'MAP_READY'
        ) {
          setMapReady(true);

          if (
            Number.isFinite(
              Number(location?.latitude),
            ) &&
            Number.isFinite(
              Number(location?.longitude),
            )
          ) {
            setTimeout(() => {
              sendLocationToMap(
                location.latitude,
                location.longitude,
                location.accuracy,
                true,
              );
            }, 100);
          }

          return;
        }

        /*
         * DRAWING STARTED
         */

        if (
          data.type ===
          'DRAWING_STARTED'
        ) {
          setDrawing(true);

          return;
        }

        /*
         * DRAWING STOPPED
         */

        if (
          data.type ===
          'DRAWING_STOPPED'
        ) {
          setDrawing(false);

          return;
        }

        /*
         * COORDINATES
         */

        if (
          data.type ===
          'coordinates'
        ) {
          const rawPoints =
            Array.isArray(data.data)
              ? data.data
              : [];

          const normalized =
            rawPoints
              .map(point => {
                if (
                  !Array.isArray(point) ||
                  point.length < 2
                ) {
                  return null;
                }

                const lat =
                  Number(point[0]);

                const lng =
                  Number(point[1]);

                if (
                  !Number.isFinite(lat) ||
                  !Number.isFinite(lng)
                ) {
                  return null;
                }

                return [lat, lng];
              })
              .filter(Boolean);

          setPoints(normalized);

          return;
        }

        /*
         * BOUNDARY UPDATE
         *
         * Current KhetiMaster map sends
         * [lng, lat].
         */

        if (
          data.type ===
          'boundary_update'
        ) {
          const rawPoints =
            Array.isArray(data.points)
              ? data.points
              : [];

          const normalized =
            rawPoints
              .map(point => {
                if (
                  !Array.isArray(point) ||
                  point.length < 2
                ) {
                  return null;
                }

                const lng =
                  Number(point[0]);

                const lat =
                  Number(point[1]);

                if (
                  !Number.isFinite(lat) ||
                  !Number.isFinite(lng)
                ) {
                  return null;
                }

                /*
                 * Store internally as:
                 *
                 * [lat, lng]
                 */

                return [lat, lng];
              })
              .filter(Boolean);

          setPoints(normalized);

          setArea(
            Number(
              data.areaHectares || 0,
            ),
          );

          setPerimeter(
            Number(
              data.perimeterMeters || 0,
            ),
          );

          return;
        }
      } catch (error) {
        console.log(
          '[FarmMap] WebView message error:',
          error,
        );
      }
    },
    [
      location,
      sendLocationToMap,
    ],
  );

  /*
   * ------------------------------------------------
   * DRAWING
   * ------------------------------------------------
   */

  const startDrawing = () => {
    setPoints([]);

    setArea(0);

    setPerimeter(0);

    setDrawing(true);

    sendToMap(
      'startDrawing',
    );
  };

  const undoPoint = () => {
    sendToMap('undo');
  };

  const clearBoundary = () => {
    setPoints([]);

    setArea(0);

    setPerimeter(0);

    sendToMap(
      'clearAllCoordinates',
    );
  };

  /*
   * ------------------------------------------------
   * DRAWING STATUS
   * ------------------------------------------------
   */

  const canContinue =
    points.length >= MIN_POINTS;

  const acres =
    Number(area || 0) *
    2.47105;

  /*
   * ------------------------------------------------
   * DRAWER
   * ------------------------------------------------
   */

  const openDrawer = () => {
    if (!canContinue) {
      return;
    }

    setDrawerVisible(true);

    Animated.spring(
      drawerAnim,
      {
        toValue: 0,

        friction: 8,

        tension: 70,

        useNativeDriver: true,
      },
    ).start();
  };

  const closeDrawer = () => {
    Animated.timing(
      drawerAnim,
      {
        toValue: height,

        duration: 260,

        useNativeDriver: true,
      },
    ).start(() => {
      setDrawerVisible(false);
    });
  };

  /*
   * ------------------------------------------------
   * BACKEND FORMAT
   *
   * Leaflet:
   * [lng, lat]
   *
   * Backend:
   * {lat, lng}
   * ------------------------------------------------
   */

  const convertPointsForBackend =
    () => {
      return points.map(
        point => ({
          lat: Number(point[0]),

          lng: Number(point[1]),
        }),
      );
    };

  /*
   * ------------------------------------------------
   * CONTINUE TO FARM DETAILS
   * ------------------------------------------------
   */

  const continueToDetails = () => {
    if (!canContinue) {
      return;
    }

    const backendPoints =
      convertPointsForBackend();

    closeDrawer();

    setTimeout(() => {
      navigation.navigate(
        'FarmDetails',
        {
          farmBoundary:
            backendPoints,

          areaHectares:
            Number(
              area.toFixed(4),
            ),

          areaAcres:
            Number(
              acres.toFixed(4),
            ),

          perimeterMeters:
            Number(
              perimeter.toFixed(2),
            ),

          location: location
            ? {
                latitude:
                  Number(
                    location.latitude,
                  ),

                longitude:
                  Number(
                    location.longitude,
                  ),

                accuracy:
                  Number(
                    location.accuracy ||
                      0,
                  ),

                city:
                  location.city ||
                  null,

                district:
                  location.district ||
                  null,

                state:
                  location.state ||
                  null,
              }
            : null,
        },
      );
    }, 280);
  };

  /*
   * ------------------------------------------------
   * RENDER
   * ------------------------------------------------
   */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#E8F0EF"
      />

      {/* HEADER */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={
            styles.backButton
          }
          onPress={() =>
            navigation.goBack()
          }
        >
          <ArrowLeft
            size={23}
            color={DARK_GREEN}
            strokeWidth={2.5}
          />
        </TouchableOpacity>

        <View
          style={
            styles.headerCenter
          }
        >
          <Text
            style={
              styles.headerTitle
            }
          >
            Map Your Farm
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Mark the boundary of your field
          </Text>
        </View>

        <View
          style={
            styles.pointsBadge
          }
        >
          <MapPin
            size={14}
            color={YELLOW}
            fill={YELLOW}
          />

          <Text
            style={
              styles.pointsText
            }
          >
            {points.length}
          </Text>
        </View>
      </View>

      {/* MAP */}

      <View
        style={
          styles.mapContainer
        }
      >
        <WebView
          ref={webRef}
          source={{
            html,
          }}
          style={
            styles.webview
          }
          javaScriptEnabled
          domStorageEnabled
          geolocationEnabled
          originWhitelist={[
            '*',
          ]}
          onMessage={
            onMessage
          }
          onLoadEnd={() => {
            setTimeout(() => {
              setMapReady(true);
            }, 300);
          }}
          allowsInlineMediaPlayback
          setSupportMultipleWindows={
            false
          }
          mixedContentMode="always"
          scrollEnabled={false}
          bounces={false}
          showsVerticalScrollIndicator={
            false
          }
          showsHorizontalScrollIndicator={
            false
        }
        />

        {/* LOCATION LOADING */}

        {locationLoading &&
          !location && (
            <View
              style={
                styles.locationLoading
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  DARK_GREEN
                }
              />

              <Text
                style={
                  styles.locationLoadingText
                }
              >
                Finding your location...
              </Text>
            </View>
          )}

        {/* LOCATION ERROR */}

        {!locationLoading &&
          locationError &&
          !location && (
            <TouchableOpacity
              activeOpacity={
                0.85
              }
              style={
                styles.locationError
              }
              onPress={
                handleLocate
              }
            >
              <View
                style={
                  styles.locationErrorIcon
                }
              >
                <LocateFixed
                  size={18}
                  color="#DC2626"
                />
              </View>

              <View
                style={
                  styles.locationErrorContent
                }
              >
                <Text
                  style={
                    styles.locationErrorTitle
                  }
                >
                  Location unavailable
                </Text>

                <Text
                  style={
                    styles.locationErrorText
                  }
                >
                  Tap to try again
                </Text>
              </View>

              <RotateCcw
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>
          )}

        {/* TIP */}

        {showTip && (
          <View
            style={
              styles.tipCard
            }
          >
            <View
              style={
                styles.tipIcon
              }
            >
              <MapPin
                size={19}
                color={
                  YELLOW
                }
                fill={
                  YELLOW
                }
              />
            </View>

            <View
              style={
                styles.tipContent
              }
            >
              <Text
                style={
                  styles.tipTitle
                }
              >
                Mark your field boundary
              </Text>

              <Text
                style={
                  styles.tipText
                }
              >
                Tap each corner of your farm
                on the map.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                setShowTip(false)
              }
              style={
                styles.tipClose
              }
            >
              <X
                size={18}
                color="#94A3B8"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* MAP CONTROLS */}

        <View
          style={
            styles.mapControls
          }
        >
          <MapControl
            Icon={
              LocateFixed
            }
            onPress={
              handleLocate
            }
          />

          <MapControl
            Icon={Layers}
            onPress={() =>
              sendToMap(
                'toggleLayer',
              )
            }
          />

          <View
            style={
              styles.controlDivider
            }
          />

          <MapControl
            Icon={Plus}
            onPress={() =>
              sendToMap(
                'zoomIn',
              )
            }
          />

          <MapControl
            Icon={Minus}
            onPress={() =>
              sendToMap(
                'zoomOut',
              )
            }
          />
        </View>

        {/* LOCATION PILL */}

        {location && (
          <View
            style={
              styles.locationPill
            }
          >
            <View
              style={
                styles.locationDot
              }
            />

            <Text
              style={
                styles.locationPillText
              }
              numberOfLines={1}
            >
              {location.city ||
                location.district ||
                location.state ||
                'Current location'}
            </Text>
          </View>
        )}

        {/* LIVE AREA */}

        {points.length >= 3 && (
          <View
            style={
              styles.liveAreaPill
            }
          >
            <View
              style={
                styles.liveIcon
              }
            >
              <Maximize2
                size={15}
                color={
                  DARK_GREEN
                }
              />
            </View>

            <View>
              <Text
                style={
                  styles.liveLabel
                }
              >
                FIELD AREA
              </Text>

              <Text
                style={
                  styles.liveValue
                }
              >
                {acres.toFixed(2)} acres
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* BOTTOM DRAWING BAR */}

      {!drawerVisible && (
        <View
          style={
            styles.bottomBar
          }
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={
              styles.undoButton
            }
            onPress={
              undoPoint
            }
            disabled={
              points.length === 0
            }
          >
            <RotateCcw
              size={20}
              color={
                points.length
                  ? DARK_GREEN
                  : '#CBD5E1'
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={
              !canContinue
            }
            style={
              styles.continueWrapper
            }
            onPress={
              openDrawer
            }
          >
            <LinearGradient
              colors={
                canContinue
                  ? [
                      '#075A53',
                      '#159447',
                    ]
                  : [
                      '#B8C1C9',
                      '#D3D8DD',
                    ]
              }
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 0,
              }}
              style={
                styles.continueButton
              }
            >
              <Ruler
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.continueText
                }
              >
                {canContinue
                  ? 'Review Boundary'
                  : `Mark ${
                      MIN_POINTS -
                      points.length
                    } more point${
                      MIN_POINTS -
                        points.length ===
                      1
                        ? ''
                        : 's'
                    }`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={
              styles.clearButton
            }
            onPress={
              clearBoundary
            }
            disabled={
              points.length === 0
            }
          >
            <Trash2
              size={19}
              color={
                points.length
                  ? '#DC2626'
                  : '#CBD5E1'
              }
            />
          </TouchableOpacity>
        </View>
      )}

      {/* REVIEW DRAWER */}

      {drawerVisible && (
        <View
          style={
            styles.drawerOverlay
          }
        >
          <TouchableOpacity
            activeOpacity={1}
            style={
              styles.drawerBackdrop
            }
            onPress={
              closeDrawer
            }
          />

          <Animated.View
            style={[
              styles.summarySheet,
              {
                transform: [
                  {
                    translateY:
                      drawerAnim,
                  },
                ],
              },
            ]}
          >
            <View
              style={
                styles.sheetHandle
              }
            />

            <View
              style={
                styles.sheetHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sheetEyebrow
                  }
                >
                  FIELD BOUNDARY
                </Text>

                <Text
                  style={
                    styles.sheetTitle
                  }
                >
                  Looks good
                </Text>
              </View>

              <View
                style={
                  styles.successCircle
                }
              >
                <Check
                  size={20}
                  color="#FFFFFF"
                  strokeWidth={3}
                />
              </View>
            </View>

            {/* STATS */}

            <View
              style={
                styles.statsRow
              }
            >
              <StatCard
                icon="area"
                label="AREA"
                value={
                  acres.toFixed(2)
                }
                unit="Acres"
              />

              <StatCard
                icon="points"
                label="POINTS"
                value={String(
                  points.length,
                )}
                unit="Boundary"
              />

              <StatCard
                icon="distance"
                label="PERIMETER"
                value={String(
                  Math.round(
                    perimeter,
                  ),
                )}
                unit="Meters"
              />
            </View>

            {/* STATUS */}

            <View
              style={
                styles.boundaryStatus
              }
            >
              <View
                style={
                  styles.statusIcon
                }
              >
                <Check
                  size={15}
                  color={
                    DARK_GREEN
                  }
                  strokeWidth={3}
                />
              </View>

              <View
                style={
                  styles.statusTextWrap
                }
              >
                <Text
                  style={
                    styles.statusTitle
                  }
                >
                  Boundary completed
                </Text>

                <Text
                  style={
                    styles.statusSubtitle
                  }
                >
                  You can still edit the last
                  point before continuing.
                </Text>
              </View>
            </View>

            {/* UNDO */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.editButton
              }
              onPress={() => {
                closeDrawer();

                setTimeout(() => {
                  undoPoint();
                }, 280);
              }}
            >
              <RotateCcw
                size={19}
                color={DARK_GREEN}
              />

              <Text
                style={
                  styles.editText
                }
              >
                Undo last point
              </Text>
            </TouchableOpacity>

            {/* CONTINUE */}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={
                continueToDetails
              }
            >
              <LinearGradient
                colors={[
                  '#075A53',
                  '#159447',
                ]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 0,
                }}
                style={
                  styles.nextButton
                }
              >
                <Text
                  style={
                    styles.nextButtonText
                  }
                >
                  Continue to farm details
                </Text>

                <Check
                  size={21}
                  color="#FFFFFF"
                  strokeWidth={3}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

/*
 * ==================================================
 * MAP CONTROL
 * ==================================================
 */

function MapControl({
  Icon,
  onPress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={
        styles.mapControl
      }
      onPress={onPress}
    >
      <Icon
        size={20}
        color={DARK_GREEN}
        strokeWidth={2.4}
      />
    </TouchableOpacity>
  );
}

/*
 * ==================================================
 * STAT CARD
 * ==================================================
 */

function StatCard({
  label,
  value,
  unit,
  icon,
}) {
  return (
    <View
      style={
        styles.statCard
      }
    >
      <View
        style={
          styles.statIcon
        }
      >
        {icon === 'area' ? (
          <Maximize2
            size={15}
            color={
              DARK_GREEN
            }
          />
        ) : icon === 'points' ? (
          <MapPin
            size={15}
            color={
              DARK_GREEN
            }
          />
        ) : (
          <Ruler
            size={15}
            color={
              DARK_GREEN
            }
          />
        )}
      </View>

      <Text
        style={
          styles.statLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.statValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.statUnit
        }
      >
        {unit}
      </Text>
    </View>
  );
}

/*
 * ==================================================
 * LEAFLET HTML
 *
 * This is deliberately kept close to the CropGen
 * MapScreen implementation.
 * ==================================================
 */

function createLeafletHtml() {
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
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<style>

html,
body,
#map {
  height:100%;
  width:100%;
  margin:0;
  padding:0;
}

body {
  overflow:hidden;
}

.leaflet-control-container {
  display:none;
}

/*
 * CropGen-style yellow point.
 */

.point-marker {

  width:20px;

  height:20px;

  background:#FCC21B;

  border:3px solid #FFFFFF;

  border-radius:50%;

  box-sizing:border-box;

  box-shadow:
    0 2px 8px rgba(0,0,0,.30);

}

/*
 * User location.
 */

.user-location-marker {

  width:18px;

  height:18px;

  border-radius:50%;

  background:#2563EB;

  border:3px solid #FFFFFF;

  box-sizing:border-box;

  box-shadow:
    0 2px 8px rgba(37,99,235,.45);

}

</style>

</head>

<body>

<div id="map"></div>

<script
  src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">
</script>

<script
  src="https://unpkg.com/@turf/turf@6/turf.min.js">
</script>

<script>

let map = null;

let currentLayer = 'satellite';

let isDrawing = true;

let points = [];

let markers = [];

let polygon = null;

let polyline = null;

let userMarker = null;

let userCircle = null;

/*
 * CropGen uses Google satellite imagery.
 */

const satellite =
  L.tileLayer(
    'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    {
      maxZoom:21,

      subdomains:[
        '0',
        '1',
        '2',
        '3'
      ]
    }
  );

/*
 * Street fallback.
 */

const street =
  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom:21
    }
  );

/*
 * ------------------------------------------
 * SEND TO REACT NATIVE
 * ------------------------------------------
 */

function send(data) {

  if (
    window.ReactNativeWebView
  ) {

    window.ReactNativeWebView.postMessage(
      JSON.stringify(data)
    );

  }

}

/*
 * ------------------------------------------
 * INIT MAP
 * ------------------------------------------
 */

function initMap() {

  map =
    L.map(
      'map',
      {
        zoomControl:false,

        attributionControl:false,

        preferCanvas:true,

        minZoom:3,

        maxZoom:21,

        zoomSnap:0.5,

        zoomDelta:0.5
      }
    ).setView(
      [28.6139,77.209],
      16
    );

  satellite.addTo(
    map
  );

  /*
   * Tap map.
   */

  map.on(
    'click',
    function(e) {

      if (!isDrawing) {
        return;
      }

      addCoordinate(
        e.latlng.lat,
        e.latlng.lng
      );

    }
  );

  setTimeout(
    function() {

      send({
        type:'MAP_READY'
      });

    },
    300
  );
}

/*
 * ------------------------------------------
 * START DRAWING
 * ------------------------------------------
 */

function startDrawing() {

  isDrawing = true;

  points = [];

  /*
   * Remove old point markers.
   */

  markers.forEach(
    marker => {

      try {
        map.removeLayer(
          marker
        );
      } catch(error) {}

    }
  );

  markers = [];

  /*
   * Remove old polygon.
   */

  if (polygon) {

    map.removeLayer(
      polygon
    );

    polygon = null;

  }

  /*
   * Remove old line.
   */

  if (polyline) {

    map.removeLayer(
      polyline
    );

    polyline = null;

  }

  send({
    type:'DRAWING_STARTED'
  });

  calculate();
}

/*
 * ------------------------------------------
 * ADD COORDINATE
 *
 * Internal format:
 *
 * [lng, lat]
 * ------------------------------------------
 */

function addCoordinate(
  lat,
  lng
) {

  if (!isDrawing) {
    return;
  }

  points.push([
    lng,
    lat
  ]);

  const marker =
    L.marker(
      [lat,lng],
      {
        icon:
          L.divIcon(
            {
              className:'',

              html:
                '<div class="point-marker"></div>',

              iconSize:[
                20,
                20
              ],

              iconAnchor:[
                10,
                10
              ]
            }
          )
      }
    ).addTo(map);

  markers.push(
    marker
  );

  drawShape();
}

/*
 * ------------------------------------------
 * DRAW SHAPE
 * ------------------------------------------
 */

function drawShape() {

  if (polygon) {

    map.removeLayer(
      polygon
    );

    polygon = null;

  }

  if (polyline) {

    map.removeLayer(
      polyline
    );

    polyline = null;

  }

  const latLngs =
    points.map(
      p => [
        p[1],
        p[0]
      ]
    );

  /*
   * Less than 3:
   * show connecting line.
   */

  if (
    points.length >= 2 &&
    points.length < 3
  ) {

    polyline =
      L.polyline(
        latLngs,
        {
          color:'#FFFFFF',

          weight:3,

          dashArray:'6,6'
        }
      ).addTo(map);

  }

  /*
   * Polygon.
   */

  if (
    points.length >= 3
  ) {

    polygon =
      L.polygon(
        latLngs,
        {
          color:'#FCC21B',

          weight:3,

          dashArray:'7,6',

          fillColor:'#FCC21B',

          fillOpacity:0.28
        }
      ).addTo(map);

  }

  calculate();
}

/*
 * ------------------------------------------
 * CALCULATE AREA / PERIMETER
 * ------------------------------------------
 */

function calculate() {

  let areaHectares = 0;

  let perimeterMeters = 0;

  if (
    points.length >= 3
  ) {

    const closed = [
      ...points,
      points[0]
    ];

    try {

      const polygonFeature =
        turf.polygon([
          closed
        ]);

      areaHectares =
        turf.area(
          polygonFeature
        ) / 10000;

      const lineFeature =
        turf.lineString(
          closed
        );

      perimeterMeters =
        turf.length(
          lineFeature,
          {
            units:'kilometers'
          }
        ) * 1000;

    } catch(error) {

      console.log(
        'Turf calculation error',
        error
      );

    }

  }

  send({
    type:'boundary_update',

    points,

    areaHectares,

    perimeterMeters
  });
}

/*
 * ------------------------------------------
 * UNDO
 * ------------------------------------------
 */

function undo() {

  if (
    !points.length
  ) {
    return;
  }

  points.pop();

  const lastMarker =
    markers.pop();

  if (lastMarker) {

    try {

      map.removeLayer(
        lastMarker
      );

    } catch(error) {}

  }

  drawShape();
}

/*
 * ------------------------------------------
 * CLEAR
 * ------------------------------------------
 */

function clearAllCoordinates() {

  points = [];

  markers.forEach(
    marker => {

      try {

        map.removeLayer(
          marker
        );

      } catch(error) {}

    }
  );

  markers = [];

  if (polygon) {

    map.removeLayer(
      polygon
    );

    polygon = null;

  }

  if (polyline) {

    map.removeLayer(
      polyline
    );

    polyline = null;

  }

  calculate();
}

/*
 * ------------------------------------------
 * LOCATION
 * ------------------------------------------
 */

function setUserLocation(
  latitude,
  longitude,
  accuracy,
  center
) {

  latitude =
    Number(latitude);

  longitude =
    Number(longitude);

  accuracy =
    Number(accuracy);

  if (
    !Number.isFinite(
      latitude
    ) ||
    !Number.isFinite(
      longitude
    )
  ) {
    return;
  }

  /*
   * Remove previous marker.
   */

  if (userMarker) {

    try {

      map.removeLayer(
        userMarker
      );

    } catch(error) {}

  }

  /*
   * Remove previous circle.
   */

  if (userCircle) {

    try {

      map.removeLayer(
        userCircle
      );

    } catch(error) {}

  }

  /*
   * Accuracy circle.
   */

  userCircle =
    L.circle(
      [
        latitude,
        longitude
      ],
      {
        radius:
          Number.isFinite(
            accuracy
          )
            ? Math.max(
                accuracy,
                10
              )
            : 25,

        color:'#2563EB',

        weight:1,

        fillColor:'#2563EB',

        fillOpacity:0.10
      }
    ).addTo(map);

  /*
   * Blue user marker.
   */

  userMarker =
    L.marker(
      [
        latitude,
        longitude
      ],
      {
        icon:
          L.divIcon(
            {
              className:'',

              html:
                '<div class="user-location-marker"></div>',

              iconSize:[
                18,
                18
              ],

              iconAnchor:[
                9,
                9
              ]
            }
          ),

        zIndexOffset:1000
      }
    ).addTo(map);

  /*
   * Center map.
   */

  if (
    center !== false
  ) {

    map.setView(
      [
        latitude,
        longitude
      ],
      18,
      {
        animate:true
      }
    );

  }
}

/*
 * ------------------------------------------
 * LAYER
 * ------------------------------------------
 */

function toggleLayer() {

  if (
    currentLayer ===
    'satellite'
  ) {

    map.removeLayer(
      satellite
    );

    street.addTo(
      map
    );

    currentLayer =
      'street';

  } else {

    map.removeLayer(
      street
    );

    satellite.addTo(
      map
    );

    currentLayer =
      'satellite';

  }

}

/*
 * ------------------------------------------
 * ZOOM
 * ------------------------------------------
 */

function zoomInMap() {

  if (map) {
    map.zoomIn();
  }

}

function zoomOutMap() {

  if (map) {
    map.zoomOut();
  }

}

/*
 * ------------------------------------------
 * MESSAGE HANDLER
 * ------------------------------------------
 */

function handleMessage(
  event
) {

  try {

    const data =
      JSON.parse(
        event.data
      );

    if (
      data.action ===
      'startDrawing'
    ) {

      startDrawing();

    }

    if (
      data.action ===
      'undo'
    ) {

      undo();

    }

    if (
      data.action ===
      'clearAllCoordinates'
    ) {

      clearAllCoordinates();

    }

    if (
      data.action ===
      'zoomIn'
    ) {

      zoomInMap();

    }

    if (
      data.action ===
      'zoomOut'
    ) {

      zoomOutMap();

    }

    if (
      data.action ===
      'toggleLayer'
    ) {

      toggleLayer();

    }

    if (
      data.action ===
      'setUserLocation'
    ) {

      setUserLocation(
        data.latitude,
        data.longitude,
        data.accuracy,
        data.center
      );

    }

  } catch(error) {

    console.log(
      '[Leaflet]',
      error
    );

  }

}

document.addEventListener(
  'message',
  handleMessage
);

window.addEventListener(
  'message',
  handleMessage
);

initMap();

</script>

</body>

</html>
`;
}

/*
 * ==================================================
 * STYLES
 * ==================================================
 */

const styles =
  StyleSheet.create({

    safeArea: {
      flex:1,

      backgroundColor:
        '#FFFFFF',
    },

    /*
     * HEADER
     */

    header: {
      height:
        isSmall
          ? 68
          : 74,

      paddingHorizontal:
        isSmall
          ? 12
          : 18,

      backgroundColor:
        '#E8F0EF',

      flexDirection:'row',

      alignItems:'center',

      justifyContent:
        'space-between',

      zIndex:5,
    },

    backButton: {
      width:
        isSmall
          ? 44
          : 50,

      height:
        isSmall
          ? 44
          : 50,

      borderRadius:25,

      backgroundColor:
        '#FFFFFF',

      alignItems:'center',

      justifyContent:'center',

      elevation:4,

      shadowColor:'#000',

      shadowOpacity:.06,

      shadowRadius:8,

      shadowOffset:{
        width:0,
        height:3,
      },
    },

    headerCenter: {
      flex:1,

      marginHorizontal:12,

      alignItems:'center',
    },

    headerTitle: {
      fontSize:
        rf(19),

      color:
        DARK_GREEN,

      fontWeight:'900',
    },

    headerSubtitle: {
      marginTop:2,

      fontSize:
        rf(10.5),

      color:'#66817D',

      fontWeight:'600',
    },

    pointsBadge: {
      minWidth:
        isSmall
          ? 46
          : 52,

      height:
        isSmall
          ? 34
          : 38,

      paddingHorizontal:10,

      borderRadius:20,

      backgroundColor:
        DARK_GREEN,

      alignItems:'center',

      justifyContent:'center',

      flexDirection:'row',

      gap:5,
    },

    pointsText: {
      fontSize:
        rf(13),

      color:'#FFFFFF',

      fontWeight:'900',
    },

    /*
     * MAP
     */

    mapContainer: {
      flex:1,

      position:'relative',

      overflow:'hidden',
    },

    webview: {
      flex:1,

      backgroundColor:
        '#DCEFD8',
    },

    /*
     * LOCATION
     */

    locationLoading: {
      position:'absolute',

      top:92,

      alignSelf:'center',

      paddingHorizontal:15,

      height:42,

      borderRadius:22,

      backgroundColor:
        '#FFFFFF',

      flexDirection:'row',

      alignItems:'center',

      gap:9,

      elevation:5,
    },

    locationLoadingText: {
      fontSize:
        rf(12),

      color:'#475569',

      fontWeight:'700',
    },

    locationError: {
      position:'absolute',

      top:14,

      left:14,

      right:14,

      minHeight:64,

      paddingHorizontal:12,

      borderRadius:17,

      backgroundColor:
        '#FFFFFF',

      flexDirection:'row',

      alignItems:'center',

      elevation:7,
    },

    locationErrorIcon: {
      width:40,

      height:40,

      borderRadius:14,

      backgroundColor:
        '#FEF2F2',

      alignItems:'center',

      justifyContent:'center',
    },

    locationErrorContent: {
      flex:1,

      marginLeft:11,
    },

    locationErrorTitle: {
      fontSize:
        rf(13),

      color:DARK,

      fontWeight:'900',
    },

    locationErrorText: {
      marginTop:2,

      fontSize:
        rf(11),

      color:'#94A3B8',

      fontWeight:'600',
    },

    /*
     * TIP
     */

    tipCard: {
      position:'absolute',

      top:14,

      left:14,

      right:14,

      minHeight:70,

      borderRadius:20,

      backgroundColor:
        '#FFFFFF',

      flexDirection:'row',

      alignItems:'center',

      paddingHorizontal:12,

      elevation:8,

      shadowColor:'#000',

      shadowOpacity:.08,

      shadowRadius:12,

      shadowOffset:{
        width:0,

        height:5,
      },
    },

    tipIcon: {
      width:42,

      height:42,

      borderRadius:14,

      backgroundColor:
        '#FFF8D9',

      alignItems:'center',

      justifyContent:'center',
    },

    tipContent: {
      flex:1,

      marginLeft:11,
    },

    tipTitle: {
      fontSize:
        rf(13),

      color:DARK,

      fontWeight:'900',
    },

    tipText: {
      marginTop:3,

      fontSize:
        rf(11),

      lineHeight:
        rf(15),

      color:'#64748B',

      fontWeight:'600',
    },

    tipClose: {
      width:34,

      height:34,

      borderRadius:17,

      alignItems:'center',

      justifyContent:'center',
    },

    /*
     * MAP CONTROLS
     */

    mapControls: {
      position:'absolute',

      right:14,

      top:
        height < 700
          ? height * .22
          : height * .25,

      backgroundColor:
        '#FFFFFF',

      borderRadius:18,

      padding:5,

      elevation:7,

      shadowColor:'#000',

      shadowOpacity:.08,

      shadowRadius:10,

      shadowOffset:{
        width:0,

        height:4,
      },
    },

    mapControl: {
      width:
        isSmall
          ? 42
          : 46,

      height:
        isSmall
          ? 42
          : 46,

      borderRadius:14,

      alignItems:'center',

      justifyContent:'center',
    },

    controlDivider: {
      height:1,

      marginHorizontal:7,

      backgroundColor:
        '#E5E7EB',
    },

    /*
     * LOCATION PILL
     */

    locationPill: {
      position:'absolute',

      left:14,

      bottom:20,

      height:38,

      paddingHorizontal:12,

      borderRadius:20,

      backgroundColor:
        'rgba(255,255,255,.96)',

      flexDirection:'row',

      alignItems:'center',

      elevation:5,

      maxWidth:
        width * .55,
    },

    locationDot: {
      width:9,

      height:9,

      borderRadius:5,

      backgroundColor:
        '#2563EB',

      marginRight:8,
    },

    locationPillText: {
      fontSize:
        rf(11),

      color:'#334155',

      fontWeight:'800',
    },

    /*
     * AREA PILL
     */

    liveAreaPill: {
      position:'absolute',

      right:14,

      bottom:20,

      height:58,

      paddingHorizontal:11,

      paddingRight:15,

      borderRadius:18,

      backgroundColor:
        '#FFFFFF',

      flexDirection:'row',

      alignItems:'center',

      elevation:6,

      shadowColor:'#000',

      shadowOpacity:.08,

      shadowRadius:10,

      shadowOffset:{
        width:0,

        height:4,
      },
    },

    liveIcon: {
      width:36,

      height:36,

      borderRadius:12,

      backgroundColor:
        '#E8F8EE',

      alignItems:'center',

      justifyContent:'center',

      marginRight:9,
    },

    liveLabel: {
      fontSize:
        rf(8.5),

      color:'#94A3B8',

      fontWeight:'900',

      letterSpacing:1,
    },

    liveValue: {
      marginTop:2,

      fontSize:
        rf(13),

      color:DARK,

      fontWeight:'900',
    },

    /*
     * BOTTOM BAR
     */

    bottomBar: {
      position:'absolute',

      left:14,

      right:14,

      bottom:
        Platform.OS === 'ios'
          ? 25
          : 18,

      flexDirection:'row',

      alignItems:'center',

      gap:9,
    },

    undoButton: {
      width:
        isSmall
          ? 54
          : 58,

      height:
        isSmall
          ? 54
          : 58,

      borderRadius:17,

      backgroundColor:
        '#FFFFFF',

      alignItems:'center',

      justifyContent:'center',

      elevation:7,

      shadowColor:'#000',

      shadowOpacity:.08,

      shadowRadius:8,

      shadowOffset:{
        width:0,

        height:4,
      },
    },

    continueWrapper: {
      flex:1,
    },

    continueButton: {
      height:
        isSmall
          ? 54
          : 58,

      borderRadius:17,

      alignItems:'center',

      justifyContent:'center',

      flexDirection:'row',

      gap:9,
    },

    continueText: {
      fontSize:
        rf(15),

      color:'#FFFFFF',

      fontWeight:'900',
    },

    clearButton: {
      width:
        isSmall
          ? 54
          : 58,

      height:
        isSmall
          ? 54
          : 58,

      borderRadius:17,

      backgroundColor:
        '#FFFFFF',

      alignItems:'center',

      justifyContent:'center',

      elevation:7,

      shadowColor:'#000',

      shadowOpacity:.08,

      shadowRadius:8,

      shadowOffset:{
        width:0,

        height:4,
      },
    },

    /*
     * DRAWER
     */

    drawerOverlay: {
      ...StyleSheet.absoluteFillObject,

      justifyContent:
        'flex-end',

      zIndex:20,
    },

    drawerBackdrop: {
      flex:1,

      backgroundColor:
        'rgba(15,23,42,.28)',
    },

    summarySheet: {
      minHeight:
        isShort
          ? height * .49
          : height * .44,

      borderTopLeftRadius:30,

      borderTopRightRadius:30,

      backgroundColor:
        '#FFFFFF',

      paddingHorizontal:
        isSmall
          ? 16
          : 22,

      paddingTop:14,

      paddingBottom:
        Platform.OS === 'ios'
          ? 28
          : 20,
    },

    sheetHandle: {
      alignSelf:'center',

      width:48,

      height:5,

      borderRadius:10,

      backgroundColor:
        '#E2E8F0',

      marginBottom:22,
    },

    sheetHeader: {
      flexDirection:'row',

      alignItems:'center',

      justifyContent:
        'space-between',
    },

    sheetEyebrow: {
      fontSize:
        rf(10),

      color:'#94A3B8',

      fontWeight:'900',

      letterSpacing:1.4,
    },

    sheetTitle: {
      marginTop:4,

      fontSize:
        rf(24),

      color:DARK,

      fontWeight:'900',
    },

    successCircle: {
      width:46,

      height:46,

      borderRadius:23,

      backgroundColor:
        DARK_GREEN,

      alignItems:'center',

      justifyContent:'center',
    },

    /*
     * STATS
     */

    statsRow: {
      marginTop:20,

      flexDirection:'row',

      gap:9,
    },

    statCard: {
      flex:1,

      minHeight:104,

      borderRadius:17,

      backgroundColor:
        '#F8FAFC',

      borderWidth:1,

      borderColor:
        '#EEF2F6',

      padding:11,

      justifyContent:
        'center',
    },

    statIcon: {
      width:29,

      height:29,

      borderRadius:10,

      backgroundColor:
        '#E8F8EE',

      alignItems:'center',

      justifyContent:'center',

      marginBottom:7,
    },

    statLabel: {
      fontSize:
        rf(8.5),

      color:'#94A3B8',

      fontWeight:'900',

      letterSpacing:.8,
    },

    statValue: {
      marginTop:3,

      fontSize:
        rf(17),

      color:DARK,

      fontWeight:'900',
    },

    statUnit: {
      marginTop:1,

      fontSize:
        rf(9),

      color:'#94A3B8',

      fontWeight:'600',
    },

    /*
     * STATUS
     */

    boundaryStatus: {
      marginTop:14,

      minHeight:61,

      borderRadius:16,

      backgroundColor:
        '#EFFBF4',

      flexDirection:'row',

      alignItems:'center',

      paddingHorizontal:13,
    },

    statusIcon: {
      width:35,

      height:35,

      borderRadius:12,

      backgroundColor:
        '#DDF7E7',

      alignItems:'center',

      justifyContent:'center',
    },

    statusTextWrap: {
      flex:1,

      marginLeft:10,
    },

    statusTitle: {
      fontSize:
        rf(12.5),

      color:DARK,

      fontWeight:'900',
    },

    statusSubtitle: {
      marginTop:2,

      fontSize:
        rf(10),

      color:'#64748B',

      fontWeight:'500',
    },

    /*
     * EDIT
     */

    editButton: {
      marginTop:12,

      height:
        isSmall
          ? 52
          : 56,

      borderRadius:15,

      backgroundColor:
        '#F3F4F6',

      alignItems:'center',

      justifyContent:'center',

      flexDirection:'row',

      gap:9,
    },

    editText: {
      fontSize:
        rf(14),

      color:DARK,

      fontWeight:'900',
    },

    /*
     * NEXT
     */

    nextButton: {
      marginTop:10,

      height:
        isSmall
          ? 54
          : 58,

      borderRadius:15,

      alignItems:'center',

      justifyContent:'center',

      flexDirection:'row',

      gap:10,
    },

    nextButtonText: {
      fontSize:
        rf(15.5),

      color:'#FFFFFF',

      fontWeight:'900',
    },
  });