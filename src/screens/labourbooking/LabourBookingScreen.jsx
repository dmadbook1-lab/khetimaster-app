import React, {
  useEffect,
} from 'react';

import {
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  View,
  Text,
  RefreshControl,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import LabourBookingHeader from '../../components/labourbooking/LabourBookingHeader';

import LabourLocationBar from '../../components/labourbooking/LabourLocationBar';

import LabourHeroBanner from '../../components/labourbooking/LabourHeroBanner';

import WorkerRegistrationBanner from '../../components/labourbooking/WorkerRegistrationBanner';

import LabourQuickActions from '../../components/labourbooking/LabourQuickActions';

import AvailableWorkers from '../../components/labourbooking/AvailableWorkers';

import {
  getAllLabourers,
} from '../../redux/slices/labourerSlice';

const {width} =
  Dimensions.get('window');

const GREEN = '#16A34A';

export default function LabourBookingScreen({
  navigation,
}) {
  const dispatch =
    useDispatch();

  const {
    labourers = [],
    isLoadingLabourers,
    error,
    total,
  } = useSelector(
    state =>
      state?.labourer || {},
  );

  /*
  |--------------------------------------------------------------------------
  | LOAD WORKERS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    dispatch(
      getAllLabourers(),
    );
  }, [dispatch]);

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const refreshWorkers =
    () => {
      dispatch(
        getAllLabourers(),
      );
    };

  /*
  |--------------------------------------------------------------------------
  | WORKER PRESS
  |--------------------------------------------------------------------------
  */

  const handleWorkerPress =
    worker => {
      navigation.navigate(
        'WorkerDetails',
        {
          worker,

          labourerId:
            worker?.id ||
            worker?._id,
        },
      );
    };

  /*
  |--------------------------------------------------------------------------
  | BOOK
  |--------------------------------------------------------------------------
  */

  const handleBookPress =
    worker => {
      navigation.navigate(
        'LabourBookingDetails',
        {
          worker,

          labourerId:
            worker?.id ||
            worker?._id,
        },
      );
    };

  /*
  |--------------------------------------------------------------------------
  | QUICK ACTIONS
  |--------------------------------------------------------------------------
  */

 const handleActionPress =
  actionId => {
    switch (actionId) {
      case 'bookings':
        navigation.navigate(
          'MyBookings',
        );
        break;

      case 'requests':
        navigation.navigate(
          'LabourRequests',
        );
        break;

      default:
        break;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | HERO
  |--------------------------------------------------------------------------
  */

  const handleHeroPress =
    () => {
      if (
        labourers.length >
        0
      ) {
        const firstWorker =
          convertLabourerToWorker(
            labourers[0],
          );

        navigation.navigate(
          'LabourBookingDetails',
          {
            worker:
              firstWorker,

            labourerId:
              firstWorker.id,
          },
        );

        return;
      }

      navigation.navigate(
        'FindLabour',
      );
    };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={
              isLoadingLabourers
            }
            onRefresh={
              refreshWorkers
            }
            tintColor={GREEN}
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }>

        <LabourBookingHeader
          navigation={
            navigation
          }
          onNotificationPress={() =>
            Alert.alert(
              'Notifications',
              'No new labour notifications.',
            )
          }
        />

        <LabourLocationBar
          onChangePress={() =>
            Alert.alert(
              'Location',
              'Location filtering can be added when you want location-based worker search.',
            )
          }
        />

        <LabourHeroBanner
          onBookPress={
            handleHeroPress
          }
        />

        <WorkerRegistrationBanner
          onRegisterPress={() =>
            navigation.navigate(
              'FindWorkStep1',
            )
          }
          onFreeBadgePress={() =>
            Alert.alert(
              'Free Registration',
              'No cost to register as a worker.',
            )
          }
        />

        <LabourQuickActions
          onActionPress={
            handleActionPress
          }
        />

        <View
          style={
            styles.workerSection
          }>

          <View
            style={
              styles.workerHeader
            }>

            <Text
              style={
                styles.workerTitle
              }>
              Available Workers
            </Text>

            <Text
              style={
                styles.workerCount
              }>
              {total ||
                labourers.length ||
                0}{' '}
              available
            </Text>

          </View>

          {isLoadingLabourers ? (
            <View
              style={
                styles.loadingContainer
              }>

              <ActivityIndicator
                size="small"
                color={GREEN}
              />

              <Text
                style={
                  styles.loadingText
                }>
                Loading available
                workers...
              </Text>

            </View>
          ) : null}

          {!isLoadingLabourers &&
          error ? (
            <View
              style={
                styles.errorContainer
              }>

              <Text
                style={
                  styles.errorTitle
                }>
                Unable to load workers
              </Text>

              <Text
                style={
                  styles.errorText
                }>
                {error}
              </Text>

              <Text
                onPress={
                  refreshWorkers
                }
                style={
                  styles.retryText
                }>
                Try Again
              </Text>

            </View>
          ) : null}

          {!isLoadingLabourers &&
          !error &&
          labourers.length >
            0 ? (
            <AvailableWorkers
              workers={
                labourers.map(
                  convertLabourerToWorker,
                )
              }
              onSeeAllPress={
                refreshWorkers
              }
              onWorkerPress={
                handleWorkerPress
              }
              onBookPress={
                handleBookPress
              }
            />
          ) : null}

          {!isLoadingLabourers &&
          !error &&
          labourers.length ===
            0 ? (
            <View
              style={
                styles.emptyContainer
              }>

              <Text
                style={
                  styles.emptyTitle
                }>
                No workers available
              </Text>

              <Text
                style={
                  styles.emptyText
                }>
                There are currently no
                available labourers.
              </Text>

            </View>
          ) : null}

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| BACKEND → UI
|--------------------------------------------------------------------------
*/

const convertLabourerToWorker =
  labourer => {
    const fallbackImage =
      require('../../assets/labour/farmer-1.jpg');

    let image =
      fallbackImage;

    if (
      typeof labourer?.profileImage ===
        'string' &&
      labourer.profileImage.trim()
    ) {
      image = {
        uri:
          labourer.profileImage.trim(),
      };
    }

    return {
      id:
        labourer?._id ||
        labourer?.id,

      _id:
        labourer?._id ||
        labourer?.id,

      name:
        labourer?.fullName ||
        'Labourer',

      image,

      rating:
        Number(
          labourer?.rating || 0,
        ),

      reviews:
        Number(
          labourer?.totalReviews ||
            0,
        ),

      distance: [
        labourer?.village,
        labourer?.district,
      ]
        .filter(Boolean)
        .join(', '),

      skills:
        Array.isArray(
          labourer?.skills,
        ) &&
        labourer.skills.length >
          0
          ? labourer.skills
          : [
              labourer?.labourType ||
                'Farm Labourer',
            ],

      dailyWage:
        Number(
          labourer?.expectedWage ||
            0,
        ),

      expectedWage:
        Number(
          labourer?.expectedWage ||
            0,
        ),

      wageType:
        labourer?.wageType ||
        'daily',

      labourType:
        labourer?.labourType ||
        'Farm Labourer',

      experience:
        Number(
          labourer?.experience ||
            0,
        ),

      experienceUnit:
        labourer?.experienceUnit ||
        'years',

      availability:
        labourer?.availability ||
        'available',

      state:
        labourer?.state ||
        '',

      district:
        labourer?.district ||
        '',

      village:
        labourer?.village ||
        '',

      gender:
        labourer?.gender ||
        '',

      age:
        labourer?.age ||
        0,

      isActive:
        labourer?.isActive !==
        false,

      originalData:
        labourer,
    };
  };

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        '#FFFFFF',
    },

    scrollContent: {
      paddingHorizontal:
        width * 0.037,
      paddingTop: 2,
      paddingBottom: 36,
    },

    workerSection: {
      marginTop: 22,
    },

    workerHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      marginBottom: 2,
    },

    workerTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: '#172033',
    },

    workerCount: {
      fontSize: 12,
      fontWeight: '700',
      color: GREEN,
    },

    loadingContainer: {
      minHeight: 120,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    loadingText: {
      marginTop: 10,
      fontSize: 13,
      color: '#7C8596',
      fontWeight: '600',
    },

    errorContainer: {
      marginTop: 12,
      padding: 18,
      borderRadius: 14,
      backgroundColor:
        '#FFF7F7',
      borderWidth: 1,
      borderColor:
        '#FECACA',
    },

    errorTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#991B1B',
    },

    errorText: {
      marginTop: 5,
      fontSize: 12,
      color: '#B91C1C',
    },

    retryText: {
      marginTop: 12,
      fontSize: 13,
      fontWeight: '800',
      color: GREEN,
    },

    emptyContainer: {
      marginTop: 12,
      padding: 24,
      borderRadius: 14,
      backgroundColor:
        '#F8FAFC',
      borderWidth: 1,
      borderColor:
        '#E7EBED',
      alignItems:
        'center',
    },

    emptyTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#172033',
    },

    emptyText: {
      marginTop: 6,
      fontSize: 12,
      color: '#7C8596',
      textAlign:
        'center',
    },
  });