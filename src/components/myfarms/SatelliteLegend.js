import React, {
  useEffect,
  useMemo,
  useRef,
} from 'react';

import {
  Animated,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ChevronDown,
  ListFilter,
} from 'lucide-react-native';

const GREEN = '#16883E';
const DARK_GREEN = '#116B32';
const WHITE = '#FFFFFF';
const TEXT = '#142018';
const MUTED = '#728078';
const BORDER = '#E7ECE9';

export default function SatelliteLegend({
  legend = [],
  open,
  setOpen,
  loading = false,
}) {
  const fadeAnim = useRef(
    new Animated.Value(0),
  ).current;

  /*
   * Normalize legend data so this component
   * works with both:
   *
   * percentage
   *
   * and CropGen's:
   *
   * percent
   */
  const normalizedLegend = useMemo(() => {
    if (!Array.isArray(legend)) {
      return [];
    }

    return legend.map((item, index) => {
      const percentage = Number(
        item?.percentage ??
          item?.percent ??
          0,
      );

      const hectares = Number(
        item?.hectares ?? 0,
      );

      return {
        id:
          item?.id ??
          `${item?.label || 'legend'}-${index}`,

        label:
          item?.label ||
          item?.name ||
          '-',

        color:
          item?.color ||
          getLegendColor(
            index,
            legend.length,
          ),

        percentage:
          Number.isFinite(percentage)
            ? percentage
            : 0,

        hectares:
          Number.isFinite(hectares)
            ? hectares
            : 0,

        min: item?.min,
        max: item?.max,
      };
    });
  }, [legend]);

  /*
   * Fade animation exactly like
   * the CropGen implementation.
   */
  useEffect(() => {
    const task =
      InteractionManager.runAfterInteractions(
        () => {
          Animated.timing(fadeAnim, {
            toValue: open ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        },
      );

    return () => task?.cancel();
  }, [open, fadeAnim]);

  /*
   * Total analysed coverage
   */
  const total = useMemo(() => {
    return normalizedLegend.reduce(
      (sum, item) =>
        sum + item.percentage,
      0,
    );
  }, [normalizedLegend]);

  /*
   * Progress bar
   */
  const progressBar = useMemo(() => {
    if (loading) {
      return null;
    }

    if (!normalizedLegend.length) {
      return null;
    }

    let cumulative = 0;

    return (
      <View style={styles.progressBar}>
        {normalizedLegend.map(
          (item, index) => {
            const left = cumulative;

            cumulative += item.percentage;

            return (
              <View
                key={item.id}
                style={[
                  styles.progressSegment,
                  {
                    left: `${left}%`,
                    width: `${item.percentage}%`,
                    backgroundColor:
                      item.color ||
                      getLegendColor(
                        index,
                        normalizedLegend.length,
                      ),
                  },
                ]}
              />
            );
          },
        )}
      </View>
    );
  }, [
    normalizedLegend,
    loading,
  ]);

  const toggleLegend = () => {
    setOpen(prev => !prev);
  };

  return (
    <View style={styles.container}>
      {/* ================================= */}
      {/* LEGEND HEADER */}
      {/* ================================= */}

      <View style={styles.legendHeader}>
        <Text style={styles.legendTitle}>
          Legend
        </Text>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={toggleLegend}
          style={styles.legendButton}>
          
          <ListFilter
            size={15}
            color={WHITE}
          />

          <Text style={styles.legendButtonText}>
            {open
              ? 'Hide details'
              : 'Details'}
          </Text>

          <ChevronDown
            size={14}
            color={WHITE}
            style={[
              styles.arrow,
              open && styles.arrowOpen,
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* ================================= */}
      {/* COLOR DISTRIBUTION */}
      {/* ================================= */}

      {loading ? (
        <View style={styles.loadingBar}>
          <View
            style={[
              styles.loadingBarInner,
            ]}
          />
        </View>
      ) : normalizedLegend.length ? (
        <View style={styles.gradientWrapper}>
          {progressBar}

          <View style={styles.statusRow}>
            {normalizedLegend.map(
              item => (
                <Text
                  key={item.id}
                  style={[
                    styles.statusLabel,
                    {
                      color:
                        item.color ||
                        GREEN,
                    },
                  ]}>
                  {item.label}
                </Text>
              ),
            )}
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>
          Legend will appear when index
          data is available.
        </Text>
      )}

      {/* ================================= */}
      {/* DROPDOWN */}
      {/* ================================= */}

      {open && loading ? (
        <Animated.View
          style={[
            styles.dropdown,
            {
              opacity: fadeAnim,
            },
          ]}>
          <View style={styles.loadingContent}>
            <Text style={styles.loadingText}>
              Analysing farm imagery...
            </Text>
          </View>
        </Animated.View>
      ) : null}

      {open &&
      !loading &&
      normalizedLegend.length > 0 ? (
        <Animated.View
          style={[
            styles.dropdown,
            {
              opacity: fadeAnim,
            },
          ]}>
          
          <ScrollView
            style={styles.legendScroll}
            contentContainerStyle={
              styles.legendScrollContent
            }
            nestedScrollEnabled
            showsVerticalScrollIndicator
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled">
            
            {normalizedLegend.map(
              (item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.legendItem,
                    index ===
                      normalizedLegend.length -
                        1 &&
                      styles.legendItemLast,
                  ]}>
                  
                  {/* COLOR */}
                  <View
                    style={[
                      styles.colorBox,
                      {
                        backgroundColor:
                          item.color ||
                          getLegendColor(
                            index,
                            normalizedLegend.length,
                          ),
                      },
                    ]}
                  />

                  {/* LABEL */}
                  <Text
                    style={styles.legendLabel}
                    numberOfLines={1}>
                    {item.label}
                  </Text>

                  {/* VALUE */}
                  <Text
                    style={styles.legendValue}>
                    {item.hectares > 0
                      ? `${item.hectares.toFixed(
                          2,
                        )} ha `
                      : ''}
                    (
                    {item.percentage.toFixed(
                      2,
                    )}
                    %)
                  </Text>
                </View>
              ),
            )}
          </ScrollView>

          {/* COVERAGE */}
          <View style={styles.coverageRow}>
            <Text
              style={styles.coverageLabel}>
              Analysed coverage
            </Text>

            <Text
              style={styles.coverageValue}>
              {Math.min(
                total,
                100,
              ).toFixed(1)}
              %
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

/* ================================= */
/* COLOR HELPER */
/* ================================= */

const getLegendColor = (
  index,
  length,
) => {
  const colors = [
    '#8B0000',
    '#D73027',
    '#FC8D59',
    '#FEE08B',
    '#D9EF8B',
    '#91CF60',
    '#1A9850',
    '#006837',
  ];

  if (length <= 1) {
    return colors[4];
  }

  const position =
    index /
    Math.max(length - 1, 1);

  const colorIndex = Math.round(
    position *
      (colors.length - 1),
  );

  return colors[
    Math.min(
      Math.max(colorIndex, 0),
      colors.length - 1,
    )
  ];
};

/* ================================= */
/* STYLES */
/* ================================= */

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: WHITE,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },

  /* HEADER */

  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 8,
  },

  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
  },

  legendButton: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor:
      DARK_GREEN,

    paddingVertical: 6,
    paddingHorizontal: 12,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: GREEN,
  },

  legendButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: WHITE,

    marginLeft: 5,
    marginRight: 4,
  },

  arrow: {
    transform: [
      {
        rotate: '-90deg',
      },
    ],
  },

  arrowOpen: {
    transform: [
      {
        rotate: '0deg',
      },
    ],
  },

  /* PROGRESS */

  gradientWrapper: {
    marginTop: 2,
  },

  progressBar: {
    width: '100%',
    height: 12,

    backgroundColor:
      '#E5E7EB',

    borderRadius: 6,

    overflow: 'hidden',

    position: 'relative',
  },

  progressSegment: {
    position: 'absolute',

    top: 0,
    bottom: 0,
  },

  statusRow: {
    marginTop: 8,

    flexDirection: 'row',

    justifyContent:
      'space-between',

    flexWrap: 'wrap',
  },

  statusLabel: {
    fontWeight: '700',
    fontSize: 11,

    marginHorizontal: 3,
  },

  /* DROPDOWN */

  dropdown: {
    backgroundColor:
      DARK_GREEN,

    borderRadius: 12,

    paddingVertical: 8,
    paddingHorizontal: 8,

    marginTop: 10,

    overflow: 'hidden',

    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.15)',
  },

  legendScroll: {
    maxHeight: 180,
  },

  legendScrollContent: {
    paddingBottom: 4,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 7,

    borderBottomWidth: 0.3,
    borderBottomColor:
      'rgba(255,255,255,0.2)',
  },

  legendItemLast: {
    borderBottomWidth: 0,
  },

  colorBox: {
    width: 24,
    height: 16,

    borderRadius: 4,

    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.15)',

    marginRight: 8,
  },

  legendLabel: {
    flex: 1,

    color: WHITE,

    fontWeight: '600',

    fontSize: 13,
  },

  legendValue: {
    color: '#DCEFE3',

    fontSize: 12,

    fontWeight: '400',
  },

  /* COVERAGE */

  coverageRow: {
    marginTop: 8,

    paddingTop: 8,

    borderTopWidth: 0.5,
    borderTopColor:
      'rgba(255,255,255,0.18)',

    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',
  },

  coverageLabel: {
    color: '#BBD8C5',

    fontSize: 10,

    fontWeight: '600',
  },

  coverageValue: {
    color: WHITE,

    fontSize: 11,

    fontWeight: '800',
  },

  /* LOADING */

  loadingBar: {
    width: '100%',
    height: 12,

    borderRadius: 6,

    overflow: 'hidden',

    backgroundColor:
      '#E5E7EB',
  },

  loadingBarInner: {
    width: '55%',
    height: '100%',

    backgroundColor:
      '#B8DCC4',

    borderRadius: 6,
  },

  loadingContent: {
    minHeight: 70,

    alignItems: 'center',
    justifyContent:
      'center',
  },

  loadingText: {
    color: WHITE,

    fontSize: 12,

    fontWeight: '600',
  },

  /* EMPTY */

  emptyText: {
    fontSize: 12,

    fontWeight: '600',

    color: MUTED,

    paddingVertical: 6,
  },
});