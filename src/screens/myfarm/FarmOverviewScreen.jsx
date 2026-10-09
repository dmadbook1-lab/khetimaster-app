import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useDispatch, useSelector} from 'react-redux';

import {
  RefreshCw,
  Satellite,
  Sprout,
  Waves,
} from 'lucide-react-native';

import FarmWeatherCard from '../../components/myfarms/FarmWeatherCard';

import CropHealthCard from '../../components/myfarms/CropHealthCard';

import FarmOverviewHeader from '../../components/myfarms/FarmOverviewHeader';

import FarmOverviewHero from '../../components/myfarms/FarmOverviewHero';

import SatelliteControls from '../../components/myfarms/SatelliteControls';

import ObservationCard from '../../components/myfarms/ObservationCard';

import SatelliteMap from '../../components/myfarms/SatelliteMap';

import SatelliteLegend from '../../components/myfarms/SatelliteLegend';

import {
  fetchDatesData,
  fetchIndexData,
  resetState,
  setSelectedIndex,
  setSelectedSatellite,
  setSelectedSatelliteDate,
} from '../../redux/slices/satelliteSlice';

import {
  fetchCropHealth,
  clearCropHealth,
} from '../../redux/slices/cropSlice';

import {farmToGeoJSON} from '../../utils/cropMonitoringGeometry';

const {width} = Dimensions.get('window');

const GREEN = '#16883E';
const TEXT = '#142018';
const MUTED = '#728078';
const BACKGROUND = '#F5F8F6';

const DEFAULT_CLOUD_THRESHOLD = 60;

const S2_INDEX_OPTIONS = [
  {label: 'NDVI', value: 'NDVI'},
  {label: 'EVI', value: 'EVI'},
  {label: 'EVI2', value: 'EVI2'},
  {label: 'SAVI', value: 'SAVI'},
  {label: 'MSAVI', value: 'MSAVI'},
  {label: 'NDMI', value: 'NDMI'},
  {label: 'NDWI', value: 'NDWI'},
  {label: 'SMI', value: 'SMI'},
  {label: 'CCC', value: 'CCC'},
  {label: 'NITROGEN', value: 'NITROGEN'},
  {label: 'SOC', value: 'SOC'},
  {label: 'NDRE', value: 'NDRE'},
  {label: 'RECI', value: 'RECI'},
  {label: 'TRUE COLOR', value: 'TRUE_COLOR'},
];

const S1_INDEX_OPTIONS = [
  {label: 'VV', value: 'VV'},
  {label: 'VH', value: 'VH'},
  {label: 'VV / VH', value: 'VV_VH'},
  {label: 'VH / VV', value: 'VH_VV'},
  {label: 'RVI', value: 'RVI'},
  {label: 'SDWI', value: 'SDWI'},
  {label: 'Sigma 0 VV', value: 'SIGMA0_VV'},
  {label: 'Sigma 0 VH', value: 'SIGMA0_VH'},
  {label: 'Gamma 0 VV', value: 'GAMMA0_VV'},
  {label: 'Gamma 0 VH', value: 'GAMMA0_VH'},
];

const getIndexOptions = satellite => {
  return satellite === 's1'
    ? S1_INDEX_OPTIONS
    : S2_INDEX_OPTIONS;
};

const formatDate = date => {
  if (!date) {
    return '';
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

const getCloudCover = item => {
  if (
    item?.cloud_cover === null ||
    item?.cloud_cover === undefined
  ) {
    return null;
  }

  const value = Number(item.cloud_cover);

  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.min(100, value));
};

const getAvailabilityRange = farm => {
  const today = new Date();

  const endDate = today
    .toISOString()
    .slice(0, 10);

  const sowingDate = farm?.sowingDate;

  if (sowingDate) {
    const parsed = new Date(sowingDate);

    if (!Number.isNaN(parsed.getTime())) {
      const start = new Date(parsed);

      start.setDate(start.getDate() - 15);

      return {
        startDate: start
          .toISOString()
          .slice(0, 10),

        endDate,
      };
    }
  }

  const start = new Date(today);

  start.setDate(start.getDate() - 180);

  return {
    startDate: start
      .toISOString()
      .slice(0, 10),

    endDate,
  };
};

const hasUsableIndexLayer = data => {
  if (!data) {
    return false;
  }

  if (data.image_base64) {
    return true;
  }

  if (
    Array.isArray(data.legend) &&
    data.legend.length > 0
  ) {
    return true;
  }

  if (data.area_stats) {
    return true;
  }

  return false;
};

const normalizeLegend = legend => {
  if (!Array.isArray(legend)) {
    return [];
  }

  return legend
    .map((item, index) => {
      const min = Number(
        item?.min ??
          item?.min_value ??
          item?.range?.[0],
      );

      const max = Number(
        item?.max ??
          item?.max_value ??
          item?.range?.[1],
      );

      const percentage = Number(
        item?.percentage ??
          item?.percent ??
          item?.area_percentage ??
          item?.area_percent ??
          0,
      );

      return {
        ...item,

        id: `${index}-${item?.label || 'range'}`,

        min: Number.isFinite(min)
          ? min
          : null,

        max: Number.isFinite(max)
          ? max
          : null,

        percentage: Number.isFinite(
          percentage,
        )
          ? Math.max(0, percentage)
          : 0,

        label:
          item?.label ||
          item?.name ||
          `${min} – ${max}`,
      };
    })
    .filter(Boolean);
};

export default function FarmOverviewScreen({
  navigation,
  route,
}) {
  const dispatch = useDispatch();

  const farm = route?.params?.farm;

  const {
    datesData,
    indexData,
    selectedDate,
    selectedSatellite,
    selectedIndex,
    datesLoading,
    indexLoading,
    datesError,
    indexError,
  } = useSelector(
    state => state.satellite,
  );

  const {
    cropHealth,
    loading: cropHealthLoading,
    error: cropHealthError,
  } = useSelector(
    state => state.crop,
  );

  const [legendOpen, setLegendOpen] =
    useState(true);

  const fallbackAttemptedRef =
    useRef(new Set());

  /* ============================================================
     FARM DATA
  ============================================================ */

  const coordinates = useMemo(() => {
    return farm?.field || [];
  }, [farm]);

  const geometry = useMemo(() => {
    try {
      return farmToGeoJSON(farm);
    } catch {
      return null;
    }
  }, [farm]);

  const farmName =
    farm?.fieldName ||
    farm?.title ||
    farm?.name ||
    'My Farm';

  const cropName =
    farm?.cropName ||
    farm?.crop ||
    'Crop';

  const variety =
    farm?.variety ||
    'Local Variety';

  const farmArea =
    farm?.acre != null
      ? `${Number(farm.acre).toFixed(2)} acres`
      : farm?.area
      ? farm.area
      : 'Farm boundary';

  /* ============================================================
     SATELLITE DATES
  ============================================================ */

  const dates = useMemo(() => {
    const items = Array.isArray(
      datesData?.items,
    )
      ? [...datesData.items]
      : [];

    return items
      .filter(item => item?.date)
      .sort((a, b) =>
        String(b.date).localeCompare(
          String(a.date),
        ),
      )
      .map(item => ({
        ...item,
        formattedDate: formatDate(
          item.date,
        ),
      }));
  }, [datesData]);

  const indexOptions = useMemo(() => {
    return getIndexOptions(
      selectedSatellite,
    );
  }, [selectedSatellite]);

  const legend = useMemo(() => {
    return normalizeLegend(
      indexData?.legend,
    );
  }, [indexData]);

  const cloudCover = useMemo(() => {
    const item = dates.find(
      date =>
        date.date === selectedDate,
    );

    if (!item) {
      return null;
    }

    return getCloudCover(item);
  }, [dates, selectedDate]);

  /* ============================================================
     LOAD AVAILABILITY
  ============================================================ */

  const loadAvailability =
    useCallback(() => {
      if (!geometry) {
        return;
      }

      const {
        startDate,
        endDate,
      } = getAvailabilityRange(farm);

      dispatch(
        fetchDatesData({
          geometry,
          startDate,
          endDate,
          satellite:
            selectedSatellite,
        }),
      );
    }, [
      dispatch,
      geometry,
      farm,
      selectedSatellite,
    ]);

  /* ============================================================
     RESET WHEN FARM CHANGES
  ============================================================ */

  useEffect(() => {
    dispatch(resetState());

    dispatch(clearCropHealth());

    fallbackAttemptedRef.current.clear();
  }, [
    dispatch,
    farm?._id,
  ]);

  /* ============================================================
     FETCH AVAILABLE DATES
  ============================================================ */

  useEffect(() => {
    if (!geometry) {
      return;
    }

    loadAvailability();
  }, [
    geometry,
    selectedSatellite,
    loadAvailability,
  ]);

  /* ============================================================
     SELECT DEFAULT DATE
  ============================================================ */

  useEffect(() => {
    if (!dates.length) {
      dispatch(
        setSelectedSatelliteDate(null),
      );

      return;
    }

    if (
      selectedDate &&
      dates.some(
        item =>
          item.date === selectedDate,
      )
    ) {
      return;
    }

    let suitableDate = dates[0];

    if (
      selectedSatellite === 's2'
    ) {
      const lowCloudDate =
        dates.find(item => {
          const cloud =
            getCloudCover(item);

          return (
            cloud === null ||
            cloud <=
              DEFAULT_CLOUD_THRESHOLD
          );
        });

      if (lowCloudDate) {
        suitableDate =
          lowCloudDate;
      }
    }

    fallbackAttemptedRef.current.clear();

    dispatch(
      setSelectedSatelliteDate(
        suitableDate?.date || null,
      ),
    );
  }, [
    dates,
    selectedDate,
    selectedSatellite,
    dispatch,
  ]);

  /* ============================================================
     FETCH SATELLITE INDEX
  ============================================================ */

  useEffect(() => {
    if (
      !geometry ||
      !selectedDate ||
      !selectedIndex
    ) {
      return;
    }

    dispatch(
      fetchIndexData({
        geometry,
        endDate: selectedDate,
        index: selectedIndex,
        satellite:
          selectedSatellite,
      }),
    );
  }, [
    geometry,
    selectedDate,
    selectedIndex,
    selectedSatellite,
    dispatch,
  ]);

  /* ============================================================
     FETCH CROP HEALTH
  ============================================================ */

  useEffect(() => {
    if (
      !geometry ||
      !selectedDate ||
      !farm?.sowingDate
    ) {
      return;
    }

    dispatch(
      fetchCropHealth({
        geometry,
        date: selectedDate,
        sowingDate:
          farm.sowingDate,
        provider: 'both',
        satellite: 's2',
      }),
    );
  }, [
    dispatch,
    geometry,
    selectedDate,
    farm?.sowingDate,
  ]);

  /* ============================================================
     424 / 503 / 504 FALLBACK
  ============================================================ */

  useEffect(() => {
    if (!indexError?.status) {
      return;
    }

    if (
      indexError.status !== 424 &&
      indexError.status !== 503 &&
      indexError.status !== 504
    ) {
      return;
    }

    if (
      !dates.length ||
      !selectedDate
    ) {
      return;
    }

    const currentIndex =
      dates.findIndex(
        item =>
          item.date === selectedDate,
      );

    if (currentIndex < 0) {
      return;
    }

    const nextDate = dates
      .slice(currentIndex + 1)
      .find(item => {
        if (
          selectedSatellite === 's1'
        ) {
          return true;
        }

        const cloud =
          getCloudCover(item);

        return (
          cloud === null ||
          cloud <=
            DEFAULT_CLOUD_THRESHOLD
        );
      });

    if (!nextDate) {
      return;
    }

    const key = `${selectedSatellite}-${selectedIndex}-${nextDate.date}`;

    if (
      fallbackAttemptedRef.current.has(
        key,
      )
    ) {
      return;
    }

    fallbackAttemptedRef.current.add(key);

    dispatch(
      setSelectedSatelliteDate(
        nextDate.date,
      ),
    );
  }, [
    indexError,
    dates,
    selectedDate,
    selectedSatellite,
    selectedIndex,
    dispatch,
  ]);

  /* ============================================================
     HANDLERS
  ============================================================ */

  const handleSatelliteChange =
    value => {
      fallbackAttemptedRef.current.clear();

      dispatch(
        setSelectedSatellite(value),
      );
    };

  const handleIndexChange =
    value => {
      fallbackAttemptedRef.current.clear();

      dispatch(
        setSelectedIndex(value),
      );
    };

  const handleDateChange =
    value => {
      fallbackAttemptedRef.current.clear();

      dispatch(
        setSelectedSatelliteDate(
          value,
        ),
      );
    };

  const handleRefresh = () => {
    fallbackAttemptedRef.current.clear();

    loadAvailability();
  };

  /* ============================================================
     EMPTY FARM
  ============================================================ */

  if (!farm) {
    return (
      <SafeAreaView
        style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Sprout
              size={30}
              color={GREEN}
            />
          </View>

          <Text style={styles.emptyTitle}>
            Farm data unavailable
          </Text>

          <Text style={styles.emptyText}>
            The selected farm does not
            contain enough information
            to display monitoring data.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}>
    <FarmOverviewHeader
  navigation={navigation}
  farmName={farmName}
  cropName={cropName}
  farmArea={farmArea}

/>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }>
        {/* ======================================================
            FARM HERO
        ====================================================== */}

        <FarmOverviewHero
          farmName={farmName}
          cropName={cropName}
          variety={variety}
          farmArea={farmArea}
          selectedSatellite={
            selectedSatellite
          }
           cropImage={farm?.cropImage}
        />

        {/* ======================================================
            CROP HEALTH — FIRST
        ====================================================== */}

        <CropHealthCard
          healthData={cropHealth}
          loading={cropHealthLoading}
          error={cropHealthError}
        />

        {/* ======================================================
            WEATHER
        ====================================================== */}

        <FarmWeatherCard
          farmData={farm}
        />

        {/* ======================================================
            SATELLITE SECTION
        ====================================================== */}

        <View
          style={styles.sectionHeading}>
          <View>
            <View
              style={
                styles.sectionEyebrowRow
              }>
              <Satellite
                size={14}
                color={GREEN}
                strokeWidth={2.5}
              />

              <Text
                style={
                  styles.sectionEyebrow
                }>
                SATELLITE INTELLIGENCE
              </Text>
            </View>

            <Text
              style={
                styles.sectionTitle
              }>
              Crop Monitoring
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }>
              Analyse crop conditions
              using satellite imagery
              and vegetation indices.
            </Text>
          </View>
        </View>

        {/* ======================================================
            CONTROLS
        ====================================================== */}

        <SatelliteControls
          selectedSatellite={
            selectedSatellite
          }
          selectedIndex={
            selectedIndex
          }
          selectedDate={
            selectedDate
          }
          indexOptions={
            indexOptions
          }
          dates={dates}
          datesLoading={
            datesLoading
          }
          datesError={
            datesError
          }
          cloudCover={
            cloudCover
          }
          onSatelliteChange={
            handleSatelliteChange
          }
          onIndexChange={
            handleIndexChange
          }
          onDateChange={
            handleDateChange
          }
          onRefresh={
            handleRefresh
          }
        />

        {/* ======================================================
            CURRENT OBSERVATION
        ====================================================== */}

        <ObservationCard
          selectedDate={
            selectedDate
          }
          selectedIndex={
            selectedIndex
          }
          formatDate={formatDate}
        />

        {/* ======================================================
            MAP
        ====================================================== */}

        <View style={styles.mapCard}>
          <View
            style={styles.mapHeader}>
            <View
              style={
                styles.mapHeaderLeft
              }>
              <View
                style={
                  styles.mapIconBox
                }>
                <Satellite
                  size={18}
                  color={GREEN}
                  strokeWidth={2.2}
                />
              </View>

              <View>
                <Text
                  style={styles.mapTitle}>
                  {selectedIndex ||
                    'Satellite'}{' '}
                  Map
                </Text>

                <Text
                  style={
                    styles.mapSubtitle
                  }>
                  {selectedDate
                    ? formatDate(
                        selectedDate,
                      )
                    : 'No date selected'}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.mapSatelliteBadge
              }>
              <Satellite
                size={13}
                color={GREEN}
              />

              <Text
                style={
                  styles.mapSatelliteText
                }>
                {selectedSatellite ===
                's1'
                  ? 'S1'
                  : 'S2'}
              </Text>
            </View>
          </View>

          <SatelliteMap
            coordinates={
              coordinates
            }
            indexData={indexData}
            indexLoading={
              indexLoading ||
              datesLoading
            }
            selectedDate={
              selectedDate
            }
            selectedSatellite={
              selectedSatellite
            }
            cloudCover={
              cloudCover
            }
            selectedIndex={
              selectedIndex
            }
          />

          <View
            style={
              styles.mapFooter
            }>
            <View
              style={
                styles.mapFooterItem
              }>
              <View
                style={
                  styles.footerDot
                }
              />

              <Text
                style={
                  styles.mapFooterText
                }>
                Farm boundary
              </Text>
            </View>

            <View
              style={
                styles.mapFooterItem
              }>
              <View
                style={[
                  styles.footerDot,
                  styles.footerDotImage,
                ]}
              />

              <Text
                style={
                  styles.mapFooterText
                }>
                Satellite layer
              </Text>
            </View>
          </View>
        </View>

        {/* ======================================================
            LEGEND
        ====================================================== */}

        <SatelliteLegend
          legend={legend}
          open={legendOpen}
          setOpen={setLegendOpen}
          loading={indexLoading}
          index={selectedIndex}
        />

        {/* ======================================================
            SATELLITE ERROR
        ====================================================== */}

        {indexError &&
          indexError.status !==
            424 && (
            <View
              style={
                styles.errorCard
              }>
              <View
                style={
                  styles.errorIcon
                }>
                <Satellite
                  size={19}
                  color="#B42318"
                />
              </View>

              <View
                style={
                  styles.errorContent
                }>
                <Text
                  style={
                    styles.errorTitle
                  }>
                  Satellite data
                  unavailable
                </Text>

                <Text
                  style={
                    styles.errorText
                  }>
                  {indexError.message ||
                    'Unable to load satellite imagery.'}
                </Text>

                <Text
                  onPress={() => {
                    if (
                      selectedDate
                    ) {
                      dispatch(
                        fetchIndexData({
                          geometry,
                          endDate:
                            selectedDate,
                          index:
                            selectedIndex,
                          satellite:
                            selectedSatellite,
                        }),
                      );
                    }
                  }}
                  style={
                    styles.retryText
                  }>
                  <RefreshCw
                    size={14}
                    color={GREEN}
                  />{' '}
                  Try Again
                </Text>
              </View>
            </View>
          )}

        {/* ======================================================
            NO DATA
        ====================================================== */}

        {!datesLoading &&
          !indexLoading &&
          selectedDate &&
          !hasUsableIndexLayer(
            indexData,
          ) &&
          !indexError && (
            <View
              style={
                styles.noDataCard
              }>
              <View
                style={
                  styles.noDataIcon
                }>
                <Satellite
                  size={25}
                  color={MUTED}
                />
              </View>

              <Text
                style={
                  styles.noDataTitle
                }>
                No satellite data
                available
              </Text>

              <Text
                style={
                  styles.noDataText
                }>
                No usable imagery was
                found for this
                observation date and
                index. Try another
                available date.
              </Text>
            </View>
          )}

        <View
          style={
            styles.bottomInfo
          }>
          <Waves
            size={15}
            color={MUTED}
          />

          <Text
            style={
              styles.bottomInfoText
            }>
            Satellite imagery may vary
            depending on cloud cover
            and provider availability.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 40,
  },

  sectionHeading: {
    marginTop: 25,
    marginBottom: 12,
  },

  sectionEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionEyebrow: {
    color: GREEN,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginLeft: 5,
  },

  sectionTitle: {
    color: TEXT,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },

  sectionSubtitle: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
    maxWidth: width * 0.88,
  },

  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E7ECE9',
  },

  mapHeader: {
    minHeight: 66,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  mapHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  mapIconBox: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: '#EAF7EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  mapTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '900',
  },

  mapSubtitle: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  mapSatelliteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#EAF7EF',
  },

  mapSatelliteText: {
    color: GREEN,
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 4,
  },

  mapFooter: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderTopWidth: 1,
    borderTopColor: '#EFF2F0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  mapFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 17,
  },

  footerDot: {
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: GREEN,
    marginRight: 5,
  },

  footerDotImage: {
    backgroundColor: '#82C96C',
  },

  mapFooterText: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '600',
  },

  errorCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 17,
    backgroundColor: '#FFF7F7',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
  },

  errorIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '900',
  },

  errorText: {
    color: '#B42318',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  retryText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 10,
  },

  noDataCard: {
    marginTop: 14,
    padding: 23,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7ECE9',
  },

  noDataIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F2F4F3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  noDataTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 10,
  },

  noDataText: {
    color: MUTED,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 16,
    maxWidth: width * 0.78,
  },

  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginTop: 18,
  },

  bottomInfoText: {
    flex: 1,
    color: MUTED,
    fontSize: 9,
    lineHeight: 14,
    marginLeft: 6,
    textAlign: 'center',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 21,
    backgroundColor: '#EAF7EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    color: TEXT,
    fontSize: 19,
    fontWeight: '900',
  },

  emptyText: {
    color: MUTED,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    fontSize: 12,
  },
});