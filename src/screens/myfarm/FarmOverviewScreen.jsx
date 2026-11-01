import { useTranslation } from 'react-i18next';
import {formatDate as formatDisplayDate} from '../../utils/dateFormat';
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
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {useDispatch, useSelector} from 'react-redux';

import {
  Bot,
  ChevronRight,
  RefreshCw,
  Satellite,
  Sprout,
  Waves,
} from 'lucide-react-native';

import FarmWeatherCard from '../../components/myfarms/FarmWeatherCard';

import FarmAdvisorySection from '../../components/advisory/FarmAdvisorySection';

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

  return formatDisplayDate(parsed, {pad: true, year: true});
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
  const { t } = useTranslation();
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

  const [legendOpen, setLegendOpen] =
    useState(true);

  // Paused while a finger is on the map so pinch / pan reach it.
  const [scrollEnabled, setScrollEnabled] =
    useState(true);

  const handleMapInteraction =
    useCallback(active => {
      setScrollEnabled(!active);
    }, []);

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
    t('common.my_farm');

  const cropName =
    farm?.cropName ||
    farm?.crop ||
    t('common.crop');

  const variety =
    farm?.variety ||
    t('farms.local_variety');

  const farmArea =
    farm?.acre != null
      ? t('units.acres_value', {n: Number(farm.acre).toFixed(2)})
      : farm?.area
      ? farm.area
      : t('farms.farm_boundary');

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
            {t('farms.data_unavailable')}
          </Text>

          <Text style={styles.emptyText}>
            {t('farms.data_unavailable_text')}
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
        scrollEnabled={scrollEnabled}
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
                {t('farms.satellite_intelligence')}
              </Text>
            </View>

            <Text
              style={
                styles.sectionTitle
              }>
              {t('farms.crop_monitoring')}
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }>
              {t('farms.crop_monitoring_sub')}
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
                  {t('farms.index_map', {
                    index: selectedIndex || t('farms.satellite'),
                  })}
                </Text>

                <Text
                  style={
                    styles.mapSubtitle
                  }>
                  {selectedDate
                    ? formatDate(
                        selectedDate,
                      )
                    : t('farms.no_date_selected')}
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
            onInteractionChange={
              handleMapInteraction
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
                {t('farms.farm_boundary')}
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
                {t('farms.satellite_layer')}
              </Text>
            </View>

            <Text
              style={
                styles.mapFooterHint
              }>
              {t('farms.pinch_to_zoom')}
            </Text>
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
                  {t('farms.satellite_unavailable')}
                </Text>

                <Text
                  style={
                    styles.errorText
                  }>
                  {indexError.message ||
                    t('farms.err_satellite')}
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
                  {t('common.try_again')}
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
                {t('farms.no_satellite_data')}
              </Text>

              <Text
                style={
                  styles.noDataText
                }>
                {t('farms.no_satellite_data_text')}
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
            {t('farms.imagery_note')}
          </Text>
        </View>

        {/* ======================================================
            SMART ADVISORY — crop health, NPK, soil, today's
            tasks, growth journey
        ====================================================== */}

        <FarmAdvisorySection farm={farm} />

        {/* ======================================================
            AI GURU — chat about this farm with its advisory,
            weather and crop stage as context
        ====================================================== */}

        {!!farm?._id && (
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.aiGuruCard}
            onPress={() =>
              navigation.navigate('AIGuru', {
                fieldId: String(farm._id),
              })
            }>
            <View style={styles.aiGuruIcon}>
              <Bot size={20} color="#FFFFFF" strokeWidth={2.3} />
            </View>

            <View style={styles.aiGuruText}>
              <Text style={styles.aiGuruTitle}>
                {t('farms.ask_ai_farm')}
              </Text>
              <Text style={styles.aiGuruSubtitle}>
                {t('farms.ask_ai_farm_sub', {
                  name: farm.fieldName || t('farms.your_farm'),
                })}
              </Text>
            </View>

            <ChevronRight size={20} color="#16883E" strokeWidth={2.4} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  aiGuruCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#F1F8F3',
    borderWidth: 1,
    borderColor: '#DCEFE2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  aiGuruIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#16883E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiGuruText: {
    flex: 1,
  },

  aiGuruTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#171D2C',
  },

  aiGuruSubtitle: {
    marginTop: 3,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#5F6B7D',
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
    shadowColor: '#0D3B1E',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
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

  mapFooterHint: {
    marginLeft: 'auto',
    color: GREEN,
    fontSize: 9,
    fontWeight: '800',
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