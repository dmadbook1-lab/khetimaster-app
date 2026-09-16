import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  HeartPulse,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
  Video,
  WalletCards,
} from 'lucide-react-native';

import {
  getMyDoctorProfile,
  resetDoctorState,
} from '../../redux/slices/doctorSlice';

import {
  getMyConsultations,
  resetDoctorConsultationState,
} from '../../redux/slices/doctorConsultationSlice';

/*
|--------------------------------------------------------------------------
| COLORS
|--------------------------------------------------------------------------
*/

const COLORS = {
  green: '#16883E',
  greenDark: '#126B31',
  greenLight: '#EAF7EE',

  blue: '#2563EB',
  blueLight: '#EFF6FF',

  orange: '#F97316',
  orangeLight: '#FFF7ED',

  red: '#DC2626',
  redLight: '#FEF2F2',

  purple: '#7C3AED',
  purpleLight: '#F5F3FF',

  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',

  border: '#E5E7EB',
  background: '#F8FAFC',
  white: '#FFFFFF',

  success: '#16A34A',
  successLight: '#F0FDF4',

  warning: '#D97706',
  warningLight: '#FFFBEB',
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const getDoctorTypeLabel = doctorType => {
  if (doctorType === 'veterinarian') {
    return 'Veterinarian';
  }

  if (doctorType === 'agriculturalDoctor') {
    return 'Agricultural Doctor';
  }

  return 'Doctor';
};

const getStatusLabel = status => {
  switch (status) {
    case 'pending':
      return 'Pending';

    case 'confirmed':
      return 'Confirmed';

    case 'accepted':
      return 'Accepted';

    case 'rejected':
      return 'Rejected';

    case 'cancelled':
      return 'Cancelled';

    case 'completed':
      return 'Completed';

    default:
      return 'Unknown';
  }
};

const getStatusColors = status => {
  switch (status) {
    case 'pending':
      return {
        background: COLORS.warningLight,
        text: COLORS.warning,
      };

    case 'confirmed':
    case 'accepted':
      return {
        background: COLORS.successLight,
        text: COLORS.success,
      };

    case 'completed':
      return {
        background: COLORS.blueLight,
        text: COLORS.blue,
      };

    case 'rejected':
    case 'cancelled':
      return {
        background: COLORS.redLight,
        text: COLORS.red,
      };

    default:
      return {
        background: '#F3F4F6',
        text: COLORS.textSecondary,
      };
  }
};

const formatConsultationType = type => {
  if (type === 'veterinary') {
    return 'Veterinary';
  }

  if (type === 'agricultural') {
    return 'Agricultural';
  }

  return 'Consultation';
};

const formatDate = date => {
  if (!date) {
    return '';
  }

  try {
    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  } catch {
    return '';
  }
};

const getDoctorLocation = doctor => {
  const parts = [
    doctor?.village,
    doctor?.district,
    doctor?.state,
  ].filter(Boolean);

  return parts.join(', ');
};

/*
|--------------------------------------------------------------------------
| MAIN SCREEN
|--------------------------------------------------------------------------
*/

const DoctorMainScreen = ({
  navigation,
}) => {
  const dispatch = useDispatch();

  /*
  |--------------------------------------------------------------------------
  | LOCAL STATE
  |--------------------------------------------------------------------------
  */

  const [refreshing, setRefreshing] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | REDUX STATE
  |--------------------------------------------------------------------------
  */

  const myDoctor = useSelector(
    state =>
      state.doctor?.myDoctor || null,
  );

  const isLoadingMyDoctor =
    useSelector(
      state =>
        state.doctor
          ?.isLoadingMyDoctor || false,
    );

  const myDoctorError =
    useSelector(
      state =>
        state.doctor
          ?.myDoctorError || null,
    );

  const myConsultations =
    useSelector(
      state =>
        state.doctorConsultation
          ?.myConsultations || [],
    );

  const isLoadingMyConsultations =
    useSelector(
      state =>
        state.doctorConsultation
          ?.isLoadingMyConsultations ||
        false,
    );

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT
  |
  | This tells us whether the CURRENT user has
  | a doctor profile.
  |--------------------------------------------------------------------------
  */

  const hasDoctorProfile =
    Boolean(myDoctor?._id);

  /*
  |--------------------------------------------------------------------------
  | LOAD CURRENT USER DATA
  |--------------------------------------------------------------------------
  */

  const loadDoctorData =
    useCallback(async () => {
      await Promise.all([
        dispatch(
          getMyDoctorProfile(),
        ),

        dispatch(
          getMyConsultations({
            page: 1,
            limit: 5,
          }),
        ),
      ]);
    }, [dispatch]);

  /*
  |--------------------------------------------------------------------------
  | SCREEN FOCUS
  |
  | Every time DoctorMain becomes active:
  |
  | 1. Clear old doctor data
  | 2. Clear old consultation data
  | 3. Fetch current user's data
  |
  |--------------------------------------------------------------------------
  */

  useFocusEffect(
    useCallback(() => {
      /*
      |--------------------------------------------------------------------------
      | CLEAR PREVIOUS USER DATA FIRST
      |--------------------------------------------------------------------------
      */

      dispatch(
        resetDoctorState(),
      );

      dispatch(
        resetDoctorConsultationState(),
      );

      /*
      |--------------------------------------------------------------------------
      | FETCH CURRENT USER DATA
      |--------------------------------------------------------------------------
      */

      loadDoctorData();

      return () => {};
    }, [
      dispatch,
      loadDoctorData,
    ]),
  );

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const handleRefresh =
    useCallback(async () => {
      setRefreshing(true);

      /*
      * Clear stale data before refresh.
      */

      dispatch(
        resetDoctorState(),
      );

      dispatch(
        resetDoctorConsultationState(),
      );

      await loadDoctorData();

      setRefreshing(false);
    }, [
      dispatch,
      loadDoctorData,
    ]);

  /*
  |--------------------------------------------------------------------------
  | NAVIGATION
  |--------------------------------------------------------------------------
  */

  const handleFindDoctor = () => {
    navigation.navigate(
      'Doctors',
    );
  };

  const handleMyConsultations = () => {
    navigation.navigate(
      'MyConsultations',
    );
  };

  const handleDoctorProfile = () => {
    if (hasDoctorProfile) {
      navigation.navigate(
        'MyDoctorProfile',
      );
    } else {
      navigation.navigate(
        'DoctorRegistration',
      );
    }
  };

  const handleConsultationPress =
    consultation => {
      if (!consultation?._id) {
        return;
      }

      navigation.navigate(
        'DoctorConsultationDetails',
        {
          consultationId:
            consultation._id,
        },
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
        'left',
        'right',
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.white
        }
      />

      <View style={styles.container}>
        {/* ---------------------------------------------------------------
            HEADER
        ---------------------------------------------------------------- */}

        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.goBack()
            }
            style={styles.backButton}
          >
            <ArrowLeft
              size={21}
              color={COLORS.text}
              strokeWidth={2}
            />
          </TouchableOpacity>

          <View
            style={styles.headerTitleWrapper}
          >
            <Text
              style={styles.headerTitle}
            >
              Vets & Doctors
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              Expert help for your farm
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={
              handleMyConsultations
            }
            style={
              styles.headerAction
            }
          >
            <ClipboardList
              size={21}
              color={COLORS.green}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        {/* ---------------------------------------------------------------
            CONTENT
        ---------------------------------------------------------------- */}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={
                handleRefresh
              }
              tintColor={
                COLORS.green
              }
            />
          }
        >
          {/* -------------------------------------------------------------
              HERO
          -------------------------------------------------------------- */}

          <View
            style={styles.heroCard}
          >
            <View
              style={
                styles.heroContent
              }
            >
              <View
                style={
                  styles.heroIcon
                }
              >
                <Stethoscope
                  size={27}
                  color={
                    COLORS.green
                  }
                  strokeWidth={2}
                />
              </View>

              <Text
                style={
                  styles.heroTitle
                }
              >
                Get expert help for
                your farm
              </Text>

              <Text
                style={
                  styles.heroDescription
                }
              >
                Connect with veterinarians
                and agricultural doctors
                for trusted guidance when
                you need it.
              </Text>

              <TouchableOpacity
                activeOpacity={0.88}
                style={
                  styles.heroButton
                }
                onPress={
                  handleFindDoctor
                }
              >
                <Search
                  size={18}
                  color={
                    COLORS.white
                  }
                  strokeWidth={2}
                />

                <Text
                  style={
                    styles.heroButtonText
                  }
                >
                  Find a Doctor
                </Text>

                <ArrowRight
                  size={18}
                  color={
                    COLORS.white
                  }
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.heroCircleOne
              }
            />

            <View
              style={
                styles.heroCircleTwo
              }
            />
          </View>

          {/* -------------------------------------------------------------
              MAIN ACTIONS
          -------------------------------------------------------------- */}

          <View
            style={styles.actionGrid}
          >
            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.actionCard}
              onPress={
                handleFindDoctor
              }
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor:
                      COLORS.blueLight,
                  },
                ]}
              >
                <Users
                  size={22}
                  color={
                    COLORS.blue
                  }
                  strokeWidth={2}
                />
              </View>

              <Text
                style={
                  styles.actionTitle
                }
              >
                Find a Doctor
              </Text>

              <Text
                style={
                  styles.actionDescription
                }
              >
                Browse available
                experts
              </Text>

              <ChevronRight
                size={19}
                color={
                  COLORS.textLight
                }
                style={
                  styles.actionArrow
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.actionCard}
              onPress={
                handleMyConsultations
              }
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor:
                      COLORS.orangeLight,
                  },
                ]}
              >
                <CalendarDays
                  size={22}
                  color={
                    COLORS.orange
                  }
                  strokeWidth={2}
                />
              </View>

              <Text
                style={
                  styles.actionTitle
                }
              >
                My Consultations
              </Text>

              <Text
                style={
                  styles.actionDescription
                }
              >
                View your requests
              </Text>

              <ChevronRight
                size={19}
                color={
                  COLORS.textLight
                }
                style={
                  styles.actionArrow
                }
              />
            </TouchableOpacity>
          </View>

          {/* -------------------------------------------------------------
              REGISTER / MANAGE DOCTOR
          -------------------------------------------------------------- */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Are you a Doctor?
            </Text>
          </View>

          {isLoadingMyDoctor ? (
            <View
              style={
                styles.doctorLoadingCard
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  COLORS.green
                }
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Checking your doctor
                profile...
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.88}
              style={
                styles.registerDoctorCard
              }
              onPress={
                handleDoctorProfile
              }
            >
              <View
                style={
                  styles.registerDoctorIcon
                }
              >
                {hasDoctorProfile ? (
                  <UserRound
                    size={24}
                    color={
                      COLORS.green
                    }
                    strokeWidth={2}
                  />
                ) : (
                  <Stethoscope
                    size={24}
                    color={
                      COLORS.green
                    }
                    strokeWidth={2}
                  />
                )}
              </View>

              <View
                style={
                  styles.registerDoctorContent
                }
              >
                <Text
                  style={
                    styles.registerDoctorTitle
                  }
                >
                  {hasDoctorProfile
                    ? 'Manage My Doctor Profile'
                    : 'Register as a Doctor'}
                </Text>

                <Text
                  style={
                    styles.registerDoctorDescription
                  }
                >
                  {hasDoctorProfile
                    ? 'Update your profile, availability and consultation details.'
                    : 'Join KhetiMaster and provide expert help to farmers.'}
                </Text>

                {hasDoctorProfile && (
                  <View
                    style={
                      styles.doctorStatusRow
                    }
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            myDoctor?.isActive
                              ? COLORS.success
                              : COLORS.textLight,
                        },
                      ]}
                    />

                    <Text
                      style={
                        styles.doctorStatusText
                      }
                    >
                      {myDoctor?.isActive
                        ? 'Profile active'
                        : 'Profile inactive'}
                    </Text>
                  </View>
                )}

                {!hasDoctorProfile && (
                  <View
                    style={
                      styles.registerDoctorCTA
                    }
                  >
                    <Text
                      style={
                        styles.registerDoctorCTAText
                      }
                    >
                      Register now
                    </Text>

                    <ChevronRight
                      size={17}
                      color={
                        COLORS.green
                      }
                      strokeWidth={2}
                    />
                  </View>
                )}
              </View>

              {hasDoctorProfile && (
                <ChevronRight
                  size={20}
                  color={
                    COLORS.textLight
                  }
                />
              )}
            </TouchableOpacity>
          )}

          {/* -------------------------------------------------------------
              DOCTOR PROFILE SUMMARY
          -------------------------------------------------------------- */}

          {!isLoadingMyDoctor &&
            hasDoctorProfile && (
              <>
                <View
                  style={
                    styles.sectionHeader
                  }
                >
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    My Doctor Profile
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={
                      handleDoctorProfile
                    }
                  >
                    <Text
                      style={
                        styles.seeAllText
                      }
                    >
                      View
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={
                    styles.profileCard
                  }
                >
                  <View
                    style={
                      styles.profileTop
                    }
                  >
                    <View
                      style={
                        styles.profileAvatar
                      }
                    >
                      <Stethoscope
                        size={24}
                        color={
                          COLORS.green
                        }
                        strokeWidth={2}
                      />
                    </View>

                    <View
                      style={
                        styles.profileInfo
                      }
                    >
                      <Text
                        style={
                          styles.profileName
                        }
                        numberOfLines={1}
                      >
                        {myDoctor?.fullName ||
                          'Doctor'}
                      </Text>

                      <Text
                        style={
                          styles.profileType
                        }
                      >
                        {getDoctorTypeLabel(
                          myDoctor?.doctorType,
                        )}
                      </Text>

                      {getDoctorLocation(
                        myDoctor,
                      ) ? (
                        <View
                          style={
                            styles.locationRow
                          }
                        >
                          <MapPin
                            size={14}
                            color={
                              COLORS.textSecondary
                            }
                            strokeWidth={2}
                          />

                          <Text
                            style={
                              styles.locationText
                            }
                            numberOfLines={
                              1
                            }
                          >
                            {getDoctorLocation(
                              myDoctor,
                            )}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View
                    style={
                      styles.profileStats
                    }
                  >
                    <View
                      style={
                        styles.profileStat
                      }
                    >
                      <Text
                        style={
                          styles.profileStatNumber
                        }
                      >
                        {Number(
                          myDoctor?.rating ||
                            0,
                        ).toFixed(1)}
                      </Text>

                      <Text
                        style={
                          styles.profileStatLabel
                        }
                      >
                        Rating
                      </Text>
                    </View>

                    <View
                      style={
                        styles.profileStatDivider
                      }
                    />

                    <View
                      style={
                        styles.profileStat
                      }
                    >
                      <Text
                        style={
                          styles.profileStatNumber
                        }
                      >
                        {myDoctor
                          ?.totalReviews ||
                          0}
                      </Text>

                      <Text
                        style={
                          styles.profileStatLabel
                        }
                      >
                        Reviews
                      </Text>
                    </View>

                    <View
                      style={
                        styles.profileStatDivider
                      }
                    />

                    <View
                      style={
                        styles.profileStat
                      }
                    >
                      <Text
                        style={
                          styles.profileStatNumber
                        }
                      >
                        {myDoctor
                          ?.totalConsultations ||
                          0}
                      </Text>

                      <Text
                        style={
                          styles.profileStatLabel
                        }
                      >
                        Consultations
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Doctor requests */}

                <TouchableOpacity
                  activeOpacity={0.86}
                  style={
                    styles.requestCard
                  }
                  onPress={() =>
                    navigation.navigate(
                      'DoctorRequests',
                    )
                  }
                >
                  <View
                    style={
                      styles.requestIcon
                    }
                  >
                    <MessageCircle
                      size={21}
                      color={
                        COLORS.purple
                      }
                      strokeWidth={2}
                    />
                  </View>

                  <View
                    style={
                      styles.requestContent
                    }
                  >
                    <Text
                      style={
                        styles.requestTitle
                      }
                    >
                      Consultation Requests
                    </Text>

                    <Text
                      style={
                        styles.requestDescription
                      }
                    >
                      View farmers who need
                      your help
                    </Text>
                  </View>

                  <ChevronRight
                    size={20}
                    color={
                      COLORS.textLight
                    }
                  />
                </TouchableOpacity>
              </>
            )}

          {/* -------------------------------------------------------------
              RECENT CONSULTATIONS
          -------------------------------------------------------------- */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Recent Consultations
            </Text>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={
                handleMyConsultations
              }
            >
              <Text
                style={
                  styles.seeAllText
                }
              >
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {isLoadingMyConsultations ? (
            <View
              style={
                styles.loadingCard
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  COLORS.green
                }
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Loading consultations...
              </Text>
            </View>
          ) : myConsultations.length >
            0 ? (
            <View
              style={
                styles.consultationsList
              }
            >
              {myConsultations
                .slice(0, 5)
                .map(
                  consultation => {
                    const statusColors =
                      getStatusColors(
                        consultation?.status,
                      );

                    return (
                      <TouchableOpacity
                        key={
                          consultation?._id
                        }
                        activeOpacity={
                          0.86
                        }
                        style={
                          styles.consultationCard
                        }
                        onPress={() =>
                          handleConsultationPress(
                            consultation,
                          )
                        }
                      >
                        <View
                          style={
                            styles.consultationIcon
                          }
                        >
                          {consultation?.consultationType ===
                          'veterinary' ? (
                            <HeartPulse
                              size={
                                21
                              }
                              color={
                                COLORS.green
                              }
                              strokeWidth={
                                2
                              }
                            />
                          ) : (
                            <Stethoscope
                              size={
                                21
                              }
                              color={
                                COLORS.green
                              }
                              strokeWidth={
                                2
                              }
                            />
                          )}
                        </View>

                        <View
                          style={
                            styles.consultationContent
                          }
                        >
                          <View
                            style={
                              styles.consultationTitleRow
                            }
                          >
                            <Text
                              style={
                                styles.consultationDoctor
                              }
                              numberOfLines={
                                1
                              }
                            >
                              {consultation
                                ?.doctor
                                ?.fullName ||
                                'Doctor'}
                            </Text>

                            <View
                              style={[
                                styles.statusBadge,
                                {
                                  backgroundColor:
                                    statusColors.background,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusBadgeText,
                                  {
                                    color:
                                      statusColors.text,
                                  },
                                ]}
                              >
                                {getStatusLabel(
                                  consultation?.status,
                                )}
                              </Text>
                            </View>
                          </View>

                          <Text
                            style={
                              styles.consultationType
                            }
                          >
                            {formatConsultationType(
                              consultation?.consultationType,
                            )}
                            {' '}
                            Consultation
                          </Text>

                          <View
                            style={
                              styles.consultationMetaRow
                            }
                          >
                            <CalendarDays
                              size={
                                14
                              }
                              color={
                                COLORS.textSecondary
                              }
                              strokeWidth={
                                2
                              }
                            />

                            <Text
                              style={
                                styles.consultationMetaText
                              }
                            >
                              {formatDate(
                                consultation?.consultationDate,
                              )}
                            </Text>

                            {consultation
                              ?.startTime ? (
                              <>
                                <View
                                  style={
                                    styles.metaDot
                                  }
                                />

                                <Text
                                  style={
                                    styles.consultationMetaText
                                  }
                                >
                                  {
                                    consultation.startTime
                                  }
                                </Text>
                              </>
                            ) : null}
                          </View>
                        </View>

                        <ChevronRight
                          size={19}
                          color={
                            COLORS.textLight
                          }
                        />
                      </TouchableOpacity>
                    );
                  },
                )}
            </View>
          ) : (
            <View
              style={
                styles.emptyCard
              }
            >
              <View
                style={
                  styles.emptyIcon
                }
              >
                <CalendarDays
                  size={24}
                  color={
                    COLORS.textSecondary
                  }
                  strokeWidth={2}
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No consultations yet
              </Text>

              <Text
                style={
                  styles.emptyDescription
                }
              >
                Find a doctor and request
                a consultation when you
                need expert help.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={
                  styles.emptyButton
                }
                onPress={
                  handleFindDoctor
                }
              >
                <Text
                  style={
                    styles.emptyButtonText
                  }
                >
                  Find a Doctor
                </Text>

                <ArrowRight
                  size={17}
                  color={
                    COLORS.green
                  }
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* -------------------------------------------------------------
              HELP SECTION
          -------------------------------------------------------------- */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              How can they help?
            </Text>
          </View>

          <View
            style={
              styles.helpList
            }
          >
            <View
              style={
                styles.helpItem
              }
            >
              <View
                style={[
                  styles.helpIcon,
                  {
                    backgroundColor:
                      COLORS.greenLight,
                  },
                ]}
              >
                <HeartPulse
                  size={20}
                  color={
                    COLORS.green
                  }
                  strokeWidth={2}
                />
              </View>

              <View
                style={
                  styles.helpContent
                }
              >
                <Text
                  style={
                    styles.helpTitle
                  }
                >
                  Animal health
                </Text>

                <Text
                  style={
                    styles.helpDescription
                  }
                >
                  Get guidance for animal
                  health, symptoms and
                  treatment.
                </Text>
              </View>
            </View>

            <View
              style={
                styles.helpItem
              }
            >
              <View
                style={[
                  styles.helpIcon,
                  {
                    backgroundColor:
                      COLORS.blueLight,
                  },
                ]}
              >
                <Stethoscope
                  size={20}
                  color={
                    COLORS.blue
                  }
                  strokeWidth={2}
                />
              </View>

              <View
                style={
                  styles.helpContent
                }
              >
                <Text
                  style={
                    styles.helpTitle
                  }
                >
                  Crop & farm guidance
                </Text>

                <Text
                  style={
                    styles.helpDescription
                  }
                >
                  Connect with agricultural
                  experts for crop and farm
                  problems.
                </Text>
              </View>
            </View>

            <View
              style={
                styles.helpItem
              }
            >
              <View
                style={[
                  styles.helpIcon,
                  {
                    backgroundColor:
                      COLORS.orangeLight,
                  },
                ]}
              >
                <Video
                  size={20}
                  color={
                    COLORS.orange
                  }
                  strokeWidth={2}
                />
              </View>

              <View
                style={
                  styles.helpContent
                }
              >
                <Text
                  style={
                    styles.helpTitle
                  }
                >
                  Consult remotely
                </Text>

                <Text
                  style={
                    styles.helpDescription
                  }
                >
                  Request expert assistance
                  and discuss your problem.
                </Text>
              </View>
            </View>
          </View>

          {/* -------------------------------------------------------------
              TRUST SECTION
          -------------------------------------------------------------- */}

          <View
            style={
              styles.trustCard
            }
          >
            <View
              style={
                styles.trustIcon
              }
            >
              <ShieldCheck
                size={22}
                color={
                  COLORS.green
                }
                strokeWidth={2}
              />
            </View>

            <View
              style={
                styles.trustContent
              }
            >
              <Text
                style={
                  styles.trustTitle
                }
              >
                Expert support for farmers
              </Text>

              <Text
                style={
                  styles.trustDescription
                }
              >
                Choose an available doctor
                and send your consultation
                request through KhetiMaster.
              </Text>
            </View>
          </View>

          <View
            style={
              styles.bottomSpacing
            }
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.white,
  },

  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  /*
  |--------------------------------------------------------------------------
  | HEADER
  |--------------------------------------------------------------------------
  */

  header: {
    height: 66,
    paddingHorizontal: 16,
    backgroundColor:
      COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
      COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleWrapper: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
      COLORS.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /*
  |--------------------------------------------------------------------------
  | SCROLL
  |--------------------------------------------------------------------------
  */

  scrollContent: {
    padding: 16,
  },

  /*
  |--------------------------------------------------------------------------
  | HERO
  |--------------------------------------------------------------------------
  */

  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor:
      COLORS.greenLight,
    minHeight: 236,
    marginBottom: 16,
  },

  heroContent: {
    zIndex: 2,
    padding: 20,
    paddingRight: 48,
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor:
      COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  heroTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    color: COLORS.text,
    maxWidth: 310,
  },

  heroDescription: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
    maxWidth: 320,
  },

  heroButton: {
    alignSelf: 'flex-start',
    marginTop: 17,
    minHeight: 45,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor:
      COLORS.green,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  heroButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },

  heroCircleOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -95,
    top: -70,
    backgroundColor:
      'rgba(22, 136, 62, 0.08)',
  },

  heroCircleTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    right: -35,
    bottom: -75,
    backgroundColor:
      'rgba(22, 136, 62, 0.07)',
  },

  /*
  |--------------------------------------------------------------------------
  | ACTIONS
  |--------------------------------------------------------------------------
  */

  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },

  actionCard: {
    flex: 1,
    minHeight: 145,
    padding: 15,
    borderRadius: 18,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    position: 'relative',
  },

  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    paddingRight: 18,
  },

  actionDescription: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSecondary,
    paddingRight: 14,
  },

  actionArrow: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },

  /*
  |--------------------------------------------------------------------------
  | SECTION HEADER
  |--------------------------------------------------------------------------
  */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.green,
  },

  /*
  |--------------------------------------------------------------------------
  | REGISTER DOCTOR
  |--------------------------------------------------------------------------
  */

  registerDoctorCard: {
    minHeight: 100,
    padding: 15,
    borderRadius: 18,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      '#D7EBDD',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  registerDoctorIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor:
      COLORS.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  registerDoctorContent: {
    flex: 1,
  },

  registerDoctorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  registerDoctorDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSecondary,
    paddingRight: 4,
  },

  registerDoctorCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },

  registerDoctorCTAText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.green,
  },

  doctorStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  doctorStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  doctorLoadingCard: {
    minHeight: 100,
    borderRadius: 18,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    marginBottom: 22,
  },

  /*
  |--------------------------------------------------------------------------
  | DOCTOR PROFILE
  |--------------------------------------------------------------------------
  */

  profileCard: {
    borderRadius: 18,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 16,
    marginBottom: 12,
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileAvatar: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor:
      COLORS.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  profileType: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.green,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 4,
  },

  locationText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  profileStats: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileStat: {
    flex: 1,
    alignItems: 'center',
  },

  profileStatNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  profileStatLabel: {
    marginTop: 3,
    fontSize: 10,
    color: COLORS.textSecondary,
  },

  profileStatDivider: {
    width: 1,
    height: 27,
    backgroundColor:
      COLORS.border,
  },

  /*
  |--------------------------------------------------------------------------
  | REQUEST CARD
  |--------------------------------------------------------------------------
  */

  requestCard: {
    minHeight: 72,
    borderRadius: 17,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  requestIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor:
      COLORS.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  requestContent: {
    flex: 1,
  },

  requestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  requestDescription: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  /*
  |--------------------------------------------------------------------------
  | CONSULTATIONS
  |--------------------------------------------------------------------------
  */

  consultationsList: {
    gap: 10,
    marginBottom: 22,
  },

  consultationCard: {
    minHeight: 83,
    borderRadius: 17,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  consultationIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor:
      COLORS.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  consultationContent: {
    flex: 1,
  },

  consultationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7,
  },

  consultationDoctor: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },

  consultationType: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  consultationMetaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  consultationMetaText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor:
      COLORS.textLight,
    marginHorizontal: 2,
  },

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  loadingCard: {
    minHeight: 100,
    borderRadius: 18,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    marginBottom: 22,
  },

  loadingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  /*
  |--------------------------------------------------------------------------
  | EMPTY
  |--------------------------------------------------------------------------
  */

  emptyCard: {
    padding: 20,
    borderRadius: 18,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: 'center',
    marginBottom: 22,
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor:
      COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  emptyDescription: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 290,
  },

  emptyButton: {
    minHeight: 42,
    marginTop: 14,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor:
      '#BFE1C9',
    backgroundColor:
      COLORS.greenLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  emptyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.green,
  },

  /*
  |--------------------------------------------------------------------------
  | HELP
  |--------------------------------------------------------------------------
  */

  helpList: {
    borderRadius: 18,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 8,
    marginBottom: 16,
  },

  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },

  helpIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  helpContent: {
    flex: 1,
  },

  helpTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  helpDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },

  /*
  |--------------------------------------------------------------------------
  | TRUST
  |--------------------------------------------------------------------------
  */

  trustCard: {
    padding: 15,
    borderRadius: 18,
    backgroundColor:
      COLORS.greenLight,
    flexDirection: 'row',
    alignItems: 'center',
  },

  trustIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor:
      COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  trustContent: {
    flex: 1,
  },

  trustTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },

  trustDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },

  bottomSpacing: {
    height: 25,
  },
});

export default DoctorMainScreen;