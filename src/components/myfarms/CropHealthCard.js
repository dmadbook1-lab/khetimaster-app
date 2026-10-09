import React from 'react';

import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  Droplets,
  Leaf,
  Sprout,
  TriangleAlert,
} from 'lucide-react-native';

const getHealthTheme = score => {
  const numericScore =
    Number(score);

  if (numericScore >= 75) {
    return {
      label: 'Healthy',
      icon: CheckCircle2,
      iconColor: '#159447',
      background: '#EAF8F0',
      textColor: '#159447',
      progressColor: '#159447',
    };
  }

  if (numericScore >= 50) {
    return {
      label: 'Moderate',
      icon: TriangleAlert,
      iconColor: '#D98B00',
      background: '#FFF7E6',
      textColor: '#C77D00',
      progressColor: '#E3A329',
    };
  }

  return {
    label: 'Poor',
    icon: AlertCircle,
    iconColor: '#DC3F3F',
    background: '#FFF0F0',
    textColor: '#D93636',
    progressColor: '#DC3F3F',
  };
};

const formatValue = value => {
  if (
    value === null ||
    value === undefined
  ) {
    return '--';
  }

  return value;
};

const CropHealthCard = ({
  healthData,
  loading = false,
  error = null,

  /*
   * These can come directly from the farm.
   */
  cropImage = '',
  cropName = '',
}) => {
  if (loading) {
    return (
      <View
        style={styles.card}
      >
        <View
          style={styles.header}
        >
          <View
            style={styles.titleRow}
          >
            <View
              style={
                styles.iconBox
              }
            >
              <Leaf
                size={19}
                color="#159447"
              />
            </View>

            <View>
              <Text
                style={
                  styles.title
                }
              >
                Crop Health
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Analysing your crop
                condition
              </Text>
            </View>
          </View>
        </View>

        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="small"
            color="#159447"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Calculating crop health...
          </Text>
        </View>
      </View>
    );
  }

  if (
    error &&
    !healthData
  ) {
    return (
      <View
        style={styles.card}
      >
        <View
          style={styles.header}
        >
          <View
            style={styles.titleRow}
          >
            <View
              style={
                styles.iconBox
              }
            >
              <Leaf
                size={19}
                color="#159447"
              />
            </View>

            <View>
              <Text
                style={
                  styles.title
                }
              >
                Crop Health
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Satellite-based crop
                condition
              </Text>
            </View>
          </View>
        </View>

        <View
          style={
            styles.errorBox
          }
        >
          <AlertCircle
            size={19}
            color="#D93636"
          />

          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>
        </View>
      </View>
    );
  }

  if (!healthData) {
    return null;
  }

  const score =
    Math.round(
      Number(
        healthData.health ||
          0,
      ),
    );

  const theme =
    getHealthTheme(score);

  const StatusIcon =
    theme.icon;

  const ndvi =
    healthData.ndvi;

  const ndre =
    healthData.ndre;

  const stress =
    healthData.stress;

  const stage =
    healthData.stage;

  const cloudCoverage =
    healthData.cloud_coverage;

  /*
   * Support multiple possible locations
   * for the crop image.
   */
  const finalCropImage =
    cropImage ||
    healthData.cropImage ||
    healthData.crop_image ||
    healthData.crop?.cropImage ||
    '';

  const finalCropName =
    cropName ||
    healthData.cropName ||
    healthData.crop_name ||
    healthData.crop?.cropName ||
    '';

  const progressWidth =
    `${Math.max(
      0,
      Math.min(
        score,
        100,
      ),
    )}%`;

  return (
    <View
      style={styles.card}
    >
      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <View
        style={styles.header}
      >
        <View
          style={styles.titleRow}
        >
          <View
            style={styles.iconBox}
          >
            <Leaf
              size={19}
              color="#159447"
            />
          </View>

          <View
            style={
              styles.titleContainer
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Crop Health
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Satellite-based crop
              condition
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                theme.background,
            },
          ]}
        >
          <StatusIcon
            size={14}
            color={
              theme.iconColor
            }
          />

          <Text
            style={[
              styles.statusText,
              {
                color:
                  theme.textColor,
              },
            ]}
          >
            {healthData.status ||
              theme.label}
          </Text>
        </View>
      </View>

      {/* ========================================================= */}
      {/* CROP IMAGE */}
      {/* ========================================================= */}

      {finalCropImage ? (
        <View
          style={
            styles.cropImageContainer
          }
        >
          <Image
            source={{
              uri: finalCropImage,
            }}
            style={
              styles.cropImage
            }
            resizeMode="cover"
          />

          <View
            style={
              styles.cropImageOverlay
            }
          >
            <View
              style={
                styles.cropImageLabel
              }
            >
              <Leaf
                size={14}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.cropImageLabelText
                }
              >
                YOUR CROP
              </Text>
            </View>

            {finalCropName ? (
              <Text
                style={
                  styles.cropImageCropName
                }
              >
                {finalCropName}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* ========================================================= */}
      {/* SCORE */}
      {/* ========================================================= */}

      <View
        style={
          styles.scoreSection
        }
      >
        <View
          style={
            styles.scoreCircle
          }
        >
          <Text
            style={
              styles.score
            }
          >
            {score}
          </Text>

          <Text
            style={
              styles.scoreOutOf
            }
          >
            /100
          </Text>
        </View>

        <View
          style={
            styles.scoreContent
          }
        >
          <Text
            style={
              styles.scoreTitle
            }
          >
            Overall Crop Health
          </Text>

          <Text
            style={
              styles.scoreDescription
            }
          >
            Your crop is currently in{' '}
            <Text
              style={{
                color:
                  theme.textColor,
                fontWeight:
                  '700',
              }}
            >
              {(
                healthData.status ||
                theme.label
              ).toLowerCase()}
            </Text>{' '}
            condition.
          </Text>

          <View
            style={
              styles.progressTrack
            }
          >
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    progressWidth,
                  backgroundColor:
                    theme.progressColor,
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* ========================================================= */}
      {/* METRICS */}
      {/* ========================================================= */}

      <View
        style={
          styles.metricsGrid
        }
      >
        <View
          style={styles.metric}
        >
          <View
            style={
              styles.metricIcon
            }
          >
            <Leaf
              size={15}
              color="#159447"
            />
          </View>

          <View>
            <Text
              style={
                styles.metricLabel
              }
            >
              NDVI
            </Text>

            <Text
              style={
                styles.metricValue
              }
            >
              {formatValue(
                ndvi !==
                  undefined &&
                  ndvi !==
                    null
                  ? Number(
                      ndvi,
                    ).toFixed(
                      3,
                    )
                  : null,
              )}
            </Text>
          </View>
        </View>

        <View
          style={styles.metric}
        >
          <View
            style={
              styles.metricIcon
            }
          >
            <Sprout
              size={15}
              color="#159447"
            />
          </View>

          <View>
            <Text
              style={
                styles.metricLabel
              }
            >
              NDRE
            </Text>

            <Text
              style={
                styles.metricValue
              }
            >
              {formatValue(
                ndre !==
                  undefined &&
                  ndre !==
                    null
                  ? Number(
                      ndre,
                    ).toFixed(
                      3,
                    )
                  : null,
              )}
            </Text>
          </View>
        </View>

        <View
          style={styles.metric}
        >
          <View
            style={
              styles.metricIcon
            }
          >
            <Droplets
              size={15}
              color="#159447"
            />
          </View>

          <View>
            <Text
              style={
                styles.metricLabel
              }
            >
              Stress
            </Text>

            <Text
              style={
                styles.metricValue
              }
            >
              {formatValue(
                stress,
              )}
            </Text>
          </View>
        </View>

        <View
          style={styles.metric}
        >
          <View
            style={
              styles.metricIcon
            }
          >
            <Sprout
              size={15}
              color="#159447"
            />
          </View>

          <View>
            <Text
              style={
                styles.metricLabel
              }
            >
              Stage
            </Text>

            <Text
              style={[
                styles.metricValue,
                styles.capitalize,
              ]}
            >
              {formatValue(
                stage,
              )}
            </Text>
          </View>
        </View>
      </View>

      {/* ========================================================= */}
      {/* CLOUD COVER */}
      {/* ========================================================= */}

      {cloudCoverage !==
        null &&
        cloudCoverage !==
          undefined && (
          <View
            style={
              styles.cloudRow
            }
          >
            <View
              style={
                styles.cloudLeft
              }
            >
              <Cloud
                size={16}
                color="#667085"
              />

              <Text
                style={
                  styles.cloudText
                }
              >
                Cloud coverage
              </Text>
            </View>

            <Text
              style={
                styles.cloudValue
              }
            >
              {Number(
                cloudCoverage,
              ).toFixed(1)}
              %
            </Text>
          </View>
        )}
    </View>
  );
};

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 20,
      padding: 16,
      marginTop: 14,
      borderWidth: 1,
      borderColor:
        '#E9ECEF',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    iconBox: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        '#EAF8F0',
      alignItems: 'center',
      justifyContent:
        'center',
      marginRight: 10,
    },

    titleContainer: {
      flex: 1,
    },

    title: {
      fontSize: 16,
      fontWeight: '800',
      color: '#172026',
    },

    subtitle: {
      fontSize: 11,
      color: '#8A9299',
      marginTop: 2,
    },

    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 4,
    },

    statusText: {
      fontSize: 11,
      fontWeight: '800',
    },

    /*
    |--------------------------------------------------------------------------
    | CROP IMAGE
    |--------------------------------------------------------------------------
    */

    cropImageContainer: {
      marginTop: 16,
      height: 180,
      borderRadius: 18,
      overflow: 'hidden',
      backgroundColor:
        '#EAF8F0',
      position: 'relative',
    },

    cropImage: {
      width: '100%',
      height: '100%',
    },

    cropImageOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 14,
      paddingVertical: 13,
      backgroundColor:
        'rgba(0,0,0,0.42)',
    },

    cropImageLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    cropImageLabelText: {
      fontSize: 9,
      color: '#FFFFFF',
      fontWeight: '900',
      letterSpacing: 1,
    },

    cropImageCropName: {
      marginTop: 2,
      fontSize: 17,
      color: '#FFFFFF',
      fontWeight: '900',
      textTransform:
        'capitalize',
    },

    /*
    |--------------------------------------------------------------------------
    | SCORE
    |--------------------------------------------------------------------------
    */

    scoreSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
    },

    scoreCircle: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor:
        '#F3FAF6',
      borderWidth: 5,
      borderColor:
        '#D9F0E1',
      alignItems: 'center',
      justifyContent:
        'center',
      marginRight: 16,
    },

    score: {
      fontSize: 27,
      fontWeight: '900',
      color: '#172026',
      lineHeight: 30,
    },

    scoreOutOf: {
      fontSize: 10,
      color: '#8A9299',
      fontWeight: '600',
    },

    scoreContent: {
      flex: 1,
    },

    scoreTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#172026',
    },

    scoreDescription: {
      fontSize: 11,
      color: '#7A838B',
      lineHeight: 17,
      marginTop: 4,
    },

    progressTrack: {
      height: 7,
      backgroundColor:
        '#EEF1F3',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 10,
    },

    progressFill: {
      height: '100%',
      borderRadius: 10,
    },

    /*
    |--------------------------------------------------------------------------
    | METRICS
    |--------------------------------------------------------------------------
    */

    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 18,
      borderTopWidth: 1,
      borderTopColor:
        '#F0F1F2',
      paddingTop: 14,
    },

    metric: {
      width: '50%',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },

    metricIcon: {
      width: 30,
      height: 30,
      borderRadius: 9,
      backgroundColor:
        '#F1F8F4',
      alignItems: 'center',
      justifyContent:
        'center',
      marginRight: 8,
    },

    metricLabel: {
      fontSize: 10,
      color: '#90979D',
      fontWeight: '600',
    },

    metricValue: {
      fontSize: 13,
      color: '#172026',
      fontWeight: '800',
      marginTop: 2,
    },

    capitalize: {
      textTransform:
        'capitalize',
    },

    /*
    |--------------------------------------------------------------------------
    | CLOUD
    |--------------------------------------------------------------------------
    */

    cloudRow: {
      borderTopWidth: 1,
      borderTopColor:
        '#F0F1F2',
      paddingTop: 12,
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
    },

    cloudLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },

    cloudText: {
      fontSize: 11,
      color: '#727A81',
      fontWeight: '600',
    },

    cloudValue: {
      fontSize: 12,
      color: '#172026',
      fontWeight: '800',
    },

    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    loadingContainer: {
      minHeight: 110,
      alignItems: 'center',
      justifyContent:
        'center',
      flexDirection: 'row',
      gap: 10,
    },

    loadingText: {
      fontSize: 12,
      color: '#7A838B',
      fontWeight: '600',
    },

    /*
    |--------------------------------------------------------------------------
    | ERROR
    |--------------------------------------------------------------------------
    */

    errorBox: {
      marginTop: 16,
      minHeight: 70,
      borderRadius: 12,
      backgroundColor:
        '#FFF5F5',
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

    errorText: {
      flex: 1,
      fontSize: 12,
      color: '#C73535',
      lineHeight: 17,
    },
  });

export default CropHealthCard;