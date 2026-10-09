import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import LinearGradient from 'react-native-linear-gradient';

import {
  Map,
  Grid3X3,
  PlusCircle,
  CircleDot,
  CloudSun,
  Sparkles,
  Check,
  Zap,
  BarChart3,
  Ruler,
  Droplets,
  Sprout,
  Tractor,
  MapPin,
} from 'lucide-react-native';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

const {
  width,
  height,
} = Dimensions.get('window');

const GREEN = '#159447';
const DARK = '#111827';

const isSmall =
  width < 360;

const isShort =
  height < 700;

const rf = size => {
  const scale =
    width / 390;

  return Math.max(
    size - 3,
    Math.min(
      size * scale,
      size + 2,
    ),
  );
};

/*
|--------------------------------------------------------------------------
| SCREEN
|--------------------------------------------------------------------------
*/

export default function FarmSuccessScreen() {
  const navigation =
    useNavigation();

  const route =
    useRoute();

  /*
  |--------------------------------------------------------------------------
  | DATA FROM FARM DETAILS
  |--------------------------------------------------------------------------
  */

  const {
    farmField = null,
    farmBoundary = [],
    areaHectares = 0,
    areaAcres = 0,
    perimeterMeters = 0,
    location = null,
  } = route?.params || {};

  /*
  |--------------------------------------------------------------------------
  | REAL FARM DATA
  |--------------------------------------------------------------------------
  */

  const farmName =
    farmField?.fieldName ||
    farmField?.farmName ||
    'My Farm';

  const cropName =
    farmField?.cropName ||
    'Crop not specified';

  const variety =
    farmField?.variety ||
    '';

  const acreValue =
    Number(
      farmField?.acre ??
        areaAcres ??
        0,
    );

  const hectareValue =
    Number(
      areaHectares ||
        0,
    );

  const irrigation =
    farmField?.typeOfIrrigation ||
    '';

  const farmingType =
    farmField?.typeOfFarming ||
    '';

  const barren =
    Boolean(
      farmField?.isBarrenLand,
    );

  const boundaryCount =
    Array.isArray(
      farmBoundary,
    )
      ? farmBoundary.length
      : Array.isArray(
          farmField?.field,
        )
      ? farmField.field.length
      : 0;

  const locationText =
    [
      location?.city,
      location?.district,
      location?.state,
    ]
      .filter(Boolean)
      .join(', ');

  /*
  |--------------------------------------------------------------------------
  | NAVIGATION
  |--------------------------------------------------------------------------
  */

  const goToDashboard =
    () => {
      navigation.replace(
        'Home',
      );
    };

  const addAnotherFarm =
    () => {
      navigation.replace(
        'MapYourFarm',
      );
    };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        'top',
        'bottom',
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F0FFF7"
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* ============================================================ */}
        {/* LOGO */}
        {/* ============================================================ */}

        <View
          style={styles.logoWrap}
        >
          <Image
            source={require('../../assets/images/logoo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* ============================================================ */}
        {/* HERO */}
        {/* ============================================================ */}

        <View
          style={styles.heroWrap}
        >
          <Image
            source={require('../../assets/images/farmfinal.png')}
            style={
              styles.heroImage
            }
            resizeMode="contain"
          />
        </View>

        {/* ============================================================ */}
        {/* SUCCESS PILL */}
        {/* ============================================================ */}

        <View
          style={
            styles.successPill
          }
        >
          <View
            style={
              styles.pillDot
            }
          />

          <Text
            style={
              styles.successPillText
            }
          >
            Farm Saved Successfully
          </Text>
        </View>

        {/* ============================================================ */}
        {/* TITLE */}
        {/* ============================================================ */}

        <Text
          style={styles.title}
        >
          Your Farm Is Ready!
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Your field boundary and crop details
          have been successfully saved to
          KhetiMaster.
        </Text>

        {/* ============================================================ */}
        {/* FARM CARD */}
        {/* ============================================================ */}

        <View
          style={styles.farmCard}
        >
          {/* ---------------------------------------------------------- */}
          {/* FARM HEADER */}
          {/* ---------------------------------------------------------- */}

          <View
            style={
              styles.farmHeader
            }
          >
            <View
              style={
                styles.mapIconBox
              }
            >
              <Map
                size={26}
                color="#FFFFFF"
                strokeWidth={2.4}
              />
            </View>

            <View
              style={
                styles.farmNameWrap
              }
            >
              <Text
                style={
                  styles.smallLabel
                }
              >
                FARM NAME
              </Text>

              <Text
                numberOfLines={1}
                style={
                  styles.farmName
                }
              >
                {farmName}
              </Text>
            </View>

            <View
              style={
                styles.activePill
              }
            >
              <View
                style={
                  styles.activeDot
                }
              />

              <Text
                style={
                  styles.activeText
                }
              >
                Saved
              </Text>
            </View>
          </View>

          {/* ---------------------------------------------------------- */}
          {/* CROP / AREA */}
          {/* ---------------------------------------------------------- */}

          <View
            style={styles.detailRow}
          >
            <DetailBox
              icon={
                <CircleDot
                  size={18}
                  color={GREEN}
                />
              }
              label="Crop"
              value={
                cropName
              }
            />

            <DetailBox
              icon={
                <Ruler
                  size={18}
                  color={GREEN}
                />
              }
              label="Area"
              value={`${acreValue.toFixed(
                2,
              )} Acres`}
            />
          </View>

          {/* ---------------------------------------------------------- */}
          {/* VARIETY */}
          {/* ---------------------------------------------------------- */}

          {variety ? (
            <View
              style={
                styles.infoRow
              }
            >
              <Sprout
                size={17}
                color={GREEN}
              />

              <View
                style={
                  styles.infoRowContent
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Variety
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {variety}
                </Text>
              </View>
            </View>
          ) : null}

          {/* ---------------------------------------------------------- */}
          {/* FARMING TYPE */}
          {/* ---------------------------------------------------------- */}

          {farmingType ? (
            <View
              style={
                styles.infoRow
              }
            >
              <LeafIcon />

              <View
                style={
                  styles.infoRowContent
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Farming type
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {farmingType}
                </Text>
              </View>
            </View>
          ) : null}

          {/* ---------------------------------------------------------- */}
          {/* IRRIGATION */}
          {/* ---------------------------------------------------------- */}

          {irrigation ? (
            <View
              style={
                styles.infoRow
              }
            >
              <Droplets
                size={17}
                color={GREEN}
              />

              <View
                style={
                  styles.infoRowContent
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Irrigation
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {irrigation}
                </Text>
              </View>
            </View>
          ) : null}

          {/* ---------------------------------------------------------- */}
          {/* LOCATION */}
          {/* ---------------------------------------------------------- */}

          {locationText ? (
            <View
              style={
                styles.infoRow
              }
            >
              <MapPin
                size={17}
                color={GREEN}
              />

              <View
                style={
                  styles.infoRowContent
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Location
                </Text>

                <Text
                  numberOfLines={2}
                  style={
                    styles.infoValue
                  }
                >
                  {locationText}
                </Text>
              </View>
            </View>
          ) : null}

          {/* ---------------------------------------------------------- */}
          {/* MEASUREMENTS */}
          {/* ---------------------------------------------------------- */}

          <View
            style={
              styles.measurementRow
            }
          >
            <MiniMeasurement
              label="Hectares"
              value={`${hectareValue.toFixed(
                2,
              )} ha`}
            />

            <MiniMeasurement
              label="Boundary"
              value={`${boundaryCount} points`}
            />

            <MiniMeasurement
              label="Perimeter"
              value={`${Math.round(
                Number(
                  perimeterMeters ||
                    0,
                ),
              )} m`}
            />
          </View>

          {/* ---------------------------------------------------------- */}
          {/* STATUS */}
          {/* ---------------------------------------------------------- */}

          <View
            style={
              styles.monitorBox
            }
          >
            <View
              style={
                styles.monitorLeft
              }
            >
              <View
                style={
                  styles.monitorIcon
                }
              >
                <Zap
                  size={17}
                  color={GREEN}
                />
              </View>

              <View>
                <Text
                  style={
                    styles.monitorText
                  }
                >
                  Farm Field Saved
                </Text>

                <Text
                  style={
                    styles.monitorSubtext
                  }
                >
                  Your field data is now available
                  in KhetiMaster.
                </Text>
              </View>
            </View>

            <View
              style={
                styles.monitorCheck
              }
            >
              <Check
                size={17}
                color="#FFFFFF"
                strokeWidth={3}
              />
            </View>
          </View>

          {/* ---------------------------------------------------------- */}
          {/* BARREN LAND */}
          {/* ---------------------------------------------------------- */}

          {barren ? (
            <View
              style={
                styles.barrenNotice
              }
            >
              <Sprout
                size={15}
                color="#B7791F"
              />

              <Text
                style={
                  styles.barrenText
                }
              >
                This field is marked as barren
                land.
              </Text>
            </View>
          ) : null}
        </View>

        {/* ============================================================ */}
        {/* NEXT TITLE */}
        {/* ============================================================ */}

        <Text
          style={
            styles.nextTitle
          }
        >
          What's Next?
        </Text>

        {/* ============================================================ */}
        {/* CARDS */}
        {/* ============================================================ */}

        <NextCard
          type="green"
          Icon={CircleDot}
          title="Your Farm Is Saved"
          text="Your field boundary, crop and farming details are now stored in KhetiMaster."
        />

        <NextCard
          type="blue"
          Icon={CloudSun}
          title="Weather Information"
          text="You can use your farm location to access relevant weather information and alerts."
        />

        <NextCard
          type="orange"
          Icon={Sparkles}
          title="Farm Insights"
          text="KhetiMaster can use your saved crop and field information for future farm features."
        />

        {/* ============================================================ */}
        {/* DASHBOARD */}
        {/* ============================================================ */}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={
            goToDashboard
          }
        >
          <LinearGradient
            colors={[
              '#138A3D',
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
              styles.dashboardBtn
            }
          >
            <Grid3X3
              size={22}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.dashboardText
              }
            >
              Go To Dashboard
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ============================================================ */}
        {/* ADD FARM */}
        {/* ============================================================ */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.addFarmBtn
          }
          onPress={
            addAnotherFarm
          }
        >
          <PlusCircle
            size={22}
            color="#138A3D"
          />

          <Text
            style={
              styles.addFarmText
            }
          >
            Add Another Farm
          </Text>
        </TouchableOpacity>

        <Text
          style={
            styles.footerText
          }
        >
          You can manage your farm fields from
          KhetiMaster whenever you need.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| DETAIL BOX
|--------------------------------------------------------------------------
*/

function DetailBox({
  icon,
  label,
  value,
}) {
  return (
    <View
      style={styles.detailBox}
    >
      {icon}

      <View
        style={styles.detailText}
      >
        <Text
          style={
            styles.detailLabel
          }
        >
          {label}
        </Text>

        <Text
          numberOfLines={1}
          style={
            styles.detailValue
          }
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| MINI MEASUREMENT
|--------------------------------------------------------------------------
*/

function MiniMeasurement({
  label,
  value,
}) {
  return (
    <View
      style={
        styles.miniMeasurement
      }
    >
      <Text
        style={
          styles.miniLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.miniValue
        }
      >
        {value}
      </Text>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| LEAF ICON
|--------------------------------------------------------------------------
*/

function LeafIcon() {
  return (
    <Sprout
      size={17}
      color={GREEN}
    />
  );
}

/*
|--------------------------------------------------------------------------
| NEXT CARD
|--------------------------------------------------------------------------
*/

function NextCard({
  type,
  Icon,
  title,
  text,
}) {
  const theme =
    type === 'blue'
      ? {
          bg: '#EEF6FF',
          border: '#D8EAFE',
          iconBg: '#DBEAFE',
          icon: '#2563EB',
        }
      : type === 'orange'
      ? {
          bg: '#FFF7ED',
          border: '#FED7AA',
          iconBg: '#FFEDD5',
          icon: '#F97316',
        }
      : {
          bg: '#ECFFF3',
          border: '#C7F9D8',
          iconBg: '#DFF8E8',
          icon: GREEN,
        };

  return (
    <View
      style={[
        styles.nextCard,
        {
          backgroundColor:
            theme.bg,
          borderColor:
            theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.nextIconBox,
          {
            backgroundColor:
              theme.iconBg,
          },
        ]}
      >
        <Icon
          size={22}
          color={theme.icon}
        />
      </View>

      <View
        style={
          styles.nextContent
        }
      >
        <Text
          style={
            styles.nextCardTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.nextCardText
          }
        >
          {text}
        </Text>
      </View>

      <View
        style={
          styles.nextCheck
        }
      >
        <Check
          size={15}
          color="#FFFFFF"
          strokeWidth={4}
        />
      </View>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        '#F0FFF7',
    },

    scrollContent: {
      paddingHorizontal:
        isSmall ? 18 : 22,
      paddingBottom: 38,
      backgroundColor:
        '#FFFFFF',
    },

    /*
    |--------------------------------------------------------------------------
    | LOGO
    |--------------------------------------------------------------------------
    */

    logoWrap: {
      alignItems: 'center',
      justifyContent:
        'center',
      marginTop: 10,
      marginBottom: 8,
    },

    logo: {
      width:
        width * 0.42,
      height: 55,
    },

    /*
    |--------------------------------------------------------------------------
    | HERO
    |--------------------------------------------------------------------------
    */

    heroWrap: {
      alignItems: 'center',
      marginTop:
        isShort ? 12 : 20,
    },

    heroImage: {
      width:
        width * 0.72,
      height:
        isShort
          ? height * 0.22
          : height * 0.27,
    },

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    successPill: {
      alignSelf: 'center',
      marginTop: 32,
      height: 34,
      paddingHorizontal: 18,
      borderRadius: 20,
      backgroundColor:
        '#DFF8E8',
      borderWidth: 1,
      borderColor:
        '#98E6B6',
      flexDirection: 'row',
      alignItems: 'center',
    },

    pillDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        '#22C55E',
      marginRight: 10,
    },

    successPillText: {
      fontSize: rf(13),
      color: '#0F8A3D',
      fontWeight: '900',
    },

    title: {
      marginTop: 18,
      textAlign: 'center',
      fontSize:
        isSmall ? 26 : 30,
      lineHeight:
        isSmall ? 32 : 38,
      color: DARK,
      fontWeight: '900',
      letterSpacing: -0.6,
    },

    subtitle: {
      alignSelf: 'center',
      marginTop: 18,
      maxWidth:
        width * 0.82,
      textAlign: 'center',
      fontSize: rf(14),
      lineHeight: rf(22),
      color: '#64748B',
      fontWeight: '500',
    },

    /*
    |--------------------------------------------------------------------------
    | FARM CARD
    |--------------------------------------------------------------------------
    */

    farmCard: {
      marginTop: 36,
      borderRadius: 26,
      borderWidth: 1,
      borderColor:
        '#E8EEF5',
      backgroundColor:
        '#FFFFFF',
      padding:
        isSmall ? 18 : 20,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 18,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      elevation: 3,
    },

    farmHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    mapIconBox: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor:
        GREEN,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    farmNameWrap: {
      flex: 1,
      marginLeft: 16,
    },

    smallLabel: {
      fontSize: rf(10),
      color: '#A0AEC0',
      fontWeight: '900',
      letterSpacing: 1.3,
    },

    farmName: {
      marginTop: 3,
      fontSize: rf(17),
      color: DARK,
      fontWeight: '900',
    },

    activePill: {
      height: 30,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor:
        '#DFF8E8',
      flexDirection: 'row',
      alignItems: 'center',
    },

    activeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor:
        '#22C55E',
      marginRight: 7,
    },

    activeText: {
      fontSize: rf(12),
      color: GREEN,
      fontWeight: '900',
    },

    /*
    |--------------------------------------------------------------------------
    | DETAILS
    |--------------------------------------------------------------------------
    */

    detailRow: {
      marginTop: 22,
      flexDirection: 'row',
      gap: 12,
    },

    detailBox: {
      flex: 1,
      minHeight: 74,
      borderRadius: 17,
      backgroundColor:
        '#F8FAFC',
      borderWidth: 1,
      borderColor:
        '#EEF2F7',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal:
        isSmall ? 12 : 14,
      gap: 10,
    },

    detailText: {
      flex: 1,
    },

    detailLabel: {
      fontSize: rf(11),
      color: '#94A3B8',
      fontWeight: '700',
    },

    detailValue: {
      marginTop: 3,
      fontSize: rf(13.5),
      color: DARK,
      fontWeight: '900',
    },

    /*
    |--------------------------------------------------------------------------
    | INFO ROW
    |--------------------------------------------------------------------------
    */

    infoRow: {
      marginTop: 10,
      minHeight: 51,
      paddingHorizontal: 13,
      borderRadius: 14,
      backgroundColor:
        '#F8FAFC',
      flexDirection: 'row',
      alignItems: 'center',
    },

    infoRowContent: {
      flex: 1,
      marginLeft: 10,
    },

    infoLabel: {
      fontSize: rf(9.5),
      color: '#94A3B8',
      fontWeight: '700',
    },

    infoValue: {
      marginTop: 2,
      fontSize: rf(11.5),
      color: DARK,
      fontWeight: '800',
    },

    /*
    |--------------------------------------------------------------------------
    | MEASUREMENTS
    |--------------------------------------------------------------------------
    */

    measurementRow: {
      marginTop: 16,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor:
        '#EEF2F7',
      flexDirection: 'row',
    },

    miniMeasurement: {
      flex: 1,
    },

    miniLabel: {
      fontSize: rf(9),
      color: '#94A3B8',
      fontWeight: '800',
      textTransform:
        'uppercase',
    },

    miniValue: {
      marginTop: 3,
      fontSize: rf(11),
      color: DARK,
      fontWeight: '900',
    },

    /*
    |--------------------------------------------------------------------------
    | MONITOR
    |--------------------------------------------------------------------------
    */

    monitorBox: {
      marginTop: 16,
      minHeight: 62,
      borderRadius: 15,
      backgroundColor:
        '#EFFFF5',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingHorizontal: 13,
    },

    monitorLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },

    monitorIcon: {
      width: 37,
      height: 37,
      borderRadius: 12,
      backgroundColor:
        '#DFF8E8',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    monitorText: {
      marginLeft: 9,
      fontSize: rf(12),
      color: GREEN,
      fontWeight: '900',
    },

    monitorSubtext: {
      marginLeft: 9,
      marginTop: 2,
      fontSize: rf(8.5),
      color: '#6F8B79',
      fontWeight: '600',
    },

    monitorCheck: {
      width: 29,
      height: 29,
      borderRadius: 15,
      backgroundColor:
        '#22C55E',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    /*
    |--------------------------------------------------------------------------
    | BARREN
    |--------------------------------------------------------------------------
    */

    barrenNotice: {
      marginTop: 10,
      paddingHorizontal: 12,
      minHeight: 38,
      borderRadius: 11,
      backgroundColor:
        '#FFF8E8',
      flexDirection: 'row',
      alignItems: 'center',
    },

    barrenText: {
      marginLeft: 7,
      fontSize: rf(9.5),
      color: '#8A6B32',
      fontWeight: '700',
    },

    /*
    |--------------------------------------------------------------------------
    | NEXT
    |--------------------------------------------------------------------------
    */

    nextTitle: {
      marginTop: 40,
      marginBottom: 16,
      fontSize: rf(16),
      color: DARK,
      fontWeight: '900',
    },

    nextCard: {
      minHeight: 76,
      borderRadius: 17,
      borderWidth: 1,
      marginBottom: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },

    nextIconBox: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    nextContent: {
      flex: 1,
      marginLeft: 15,
      marginRight: 10,
    },

    nextCardTitle: {
      fontSize: rf(13.5),
      color: DARK,
      fontWeight: '900',
    },

    nextCardText: {
      marginTop: 3,
      fontSize: rf(10.5),
      lineHeight: rf(14),
      color: '#64748B',
      fontWeight: '500',
    },

    nextCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor:
        '#22C55E',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    /*
    |--------------------------------------------------------------------------
    | BUTTONS
    |--------------------------------------------------------------------------
    */

    dashboardBtn: {
      marginTop: 26,
      height: 60,
      borderRadius: 16,
      backgroundColor:
        GREEN,
      alignItems: 'center',
      justifyContent:
        'center',
      flexDirection: 'row',
      gap: 12,
      elevation: 6,
    },

    dashboardText: {
      fontSize: rf(17),
      color: '#FFFFFF',
      fontWeight: '900',
    },

    addFarmBtn: {
      marginTop: 16,
      height: 56,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        '#E2E8F0',
      backgroundColor:
        '#FFFFFF',
      alignItems: 'center',
      justifyContent:
        'center',
      flexDirection: 'row',
      gap: 10,
    },

    addFarmText: {
      fontSize: rf(16),
      color: GREEN,
      fontWeight: '900',
    },

    footerText: {
      marginTop: 14,
      textAlign: 'center',
      paddingHorizontal: 20,
      fontSize: rf(9.5),
      lineHeight: rf(14),
      color: '#A0AEC0',
      fontWeight: '600',
    },
  });