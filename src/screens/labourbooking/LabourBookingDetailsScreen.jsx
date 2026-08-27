import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Star,
  Minus,
  Plus,
  MapPin,
  Briefcase,
} from 'lucide-react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import {useDispatch, useSelector} from 'react-redux';

import {
  setLabourFormData,
} from '../../redux/slices/labourSlice';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size,
    Math.min(size * scale, size + 3),
  );
};

// ============================================================
// COLORS
// ============================================================

const GREEN = '#16A34A';
const DARK = '#172033';
const MUTED = '#7C8596';
const BORDER = '#E7EBED';
const ORANGE = '#F97316';

// ============================================================
// OPTIONS
// ============================================================

const ACTIVITIES = [
  'Sowing',
  'Harvesting',
  'Weeding',
  'Irrigation',
  'Tractor Assistance',
  'Loading',
];

const DURATIONS = [
  'Half Day',
  'Full Day',
  'Custom Hours',
];

const GENDERS = [
  {
    id: 'any',
    label: 'Any',
  },
  {
    id: 'male',
    label: 'Male',
  },
  {
    id: 'female',
    label: 'Female',
  },
  {
    id: 'mixed',
    label: 'Mixed',
  },
];

// ============================================================
// DATE HELPER
// ============================================================

const getBookingDates = () => {
  const dates = [];

  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);

    date.setDate(
      today.getDate() + i,
    );

    const dayName =
      date
        .toLocaleDateString('en-US', {
          weekday: 'short',
        })
        .toUpperCase();

    const dateNumber =
      date.getDate();

    let status = 'Available';

    if (i === 0) {
      status = 'Today';
    }

    dates.push({
      day: dayName,
      date: dateNumber,
      fullDate:
        date.toISOString(),
      status,
    });
  }

  return dates;
};

// ============================================================
// TIME HELPERS
// ============================================================

const createTime = (hour, minute = 0) => {
  const date = new Date();

  date.setHours(
    hour,
    minute,
    0,
    0,
  );

  return date;
};

const formatTime = time => {
  if (!time) {
    return '';
  }

  const date =
    time instanceof Date
      ? time
      : new Date(time);

  return date.toLocaleTimeString(
    'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  );
};

// ============================================================
// SCREEN
// ============================================================

export default function LabourBookingDetailsScreen({
  navigation,
  route,
}) {
  const dispatch = useDispatch();

  // ==========================================================
  // REDUX
  // ==========================================================

  const formData = useSelector(
    state =>
      state.labour?.formData ||
      {},
  );

  // ==========================================================
  // WORKER
  // ==========================================================

  const routeWorker =
    route?.params?.worker;

  const worker =
    routeWorker ||
    route?.params?.labourer ||
    null;

  // ==========================================================
  // WORKER VALUES
  // ==========================================================

  const workerId =
    worker?._id ||
    worker?.id ||
    '';

  const workerName =
    worker?.fullName ||
    worker?.name ||
    formData?.fullName ||
    'Labour Worker';

  const workerImage =
    worker?.profileImage ||
    formData?.profileImage ||
    '';

  const workerRating =
    Number(worker?.rating ?? 0);

  const workerReviews =
    Number(
      worker?.totalReviews ?? 0,
    );

  const workerExperience =
    worker?.experience
      ? `${worker.experience} ${
          worker?.experienceUnit ||
          'years'
        }`
      : formData?.experience
      ? `${formData.experience} ${
          formData?.experienceUnit ||
          'years'
        }`
      : 'Experience not specified';

  const workerWage =
    Number(
      worker?.expectedWage ??
        formData?.expectedWage ??
        0,
    );

  const workerWageType =
    worker?.wageType ||
    formData?.wageType ||
    'daily';

  // ==========================================================
  // LOCATION
  // ==========================================================

  const workerLocation = [
    worker?.village ||
      formData?.village,
    worker?.district,
    worker?.state,
  ]
    .filter(Boolean)
    .join(', ');

  // ==========================================================
  // DATES
  // ==========================================================

  const dates = useMemo(
    () => getBookingDates(),
    [],
  );

  const initialDate =
    route?.params?.selectedDate ||
    dates[0]?.date;

  const [selectedDate, setSelectedDate] =
    useState(initialDate);

  // ==========================================================
  // BOOKING FORM
  // ==========================================================

  const [workerCount, setWorkerCount] =
    useState(
      Number(
        route?.params?.workerCount ||
          formData?.workerCount ||
          1,
      ),
    );

  const [activity, setActivity] =
    useState(
      route?.params?.activity ||
        formData?.activity ||
        formData?.preferredWork?.[0] ||
        'Harvesting',
    );

  const [duration, setDuration] =
    useState(
      route?.params?.duration ||
        formData?.duration ||
        'Full Day',
    );

  const [gender, setGender] =
    useState(
      route?.params?.gender ||
        formData?.bookingGender ||
        'any',
    );

  const [instructions, setInstructions] =
    useState(
      route?.params?.instructions ||
        formData?.instructions ||
        '',
    );

  // ==========================================================
  // WORKING TIME
  // ==========================================================

  const [startTime, setStartTime] =
    useState(() => {
      if (
        route?.params?.startTime
      ) {
        return new Date(
          route.params.startTime,
        );
      }

      if (
        formData?.startTime
      ) {
        return new Date(
          formData.startTime,
        );
      }

      // Full Day default
      const currentDuration =
        route?.params?.duration ||
        formData?.duration ||
        'Full Day';

      if (
        currentDuration ===
        'Full Day'
      ) {
        return createTime(8, 0);
      }

      return null;
    });

  const [endTime, setEndTime] =
    useState(() => {
      if (
        route?.params?.endTime
      ) {
        return new Date(
          route.params.endTime,
        );
      }

      if (
        formData?.endTime
      ) {
        return new Date(
          formData.endTime,
        );
      }

      // Full Day default
      const currentDuration =
        route?.params?.duration ||
        formData?.duration ||
        'Full Day';

      if (
        currentDuration ===
        'Full Day'
      ) {
        return createTime(17, 0);
      }

      return null;
    });

  const [timePickerMode, setTimePickerMode] =
    useState(null);

  // ==========================================================
  // FARM DETAILS
  // ==========================================================

  const [farmName, setFarmName] =
    useState(
      route?.params?.farmName ||
        formData?.farmName ||
        'My Farm',
    );

  const [farmLocation, setFarmLocation] =
    useState(
      route?.params?.farmLocation ||
        formData?.farmLocation ||
        '',
    );

  // ==========================================================
  // COST
  // ==========================================================

  const dailyWage =
    workerWage > 0
      ? workerWage
      : 600;

  const labourCost = useMemo(() => {
    let multiplier = 1;

    if (duration === 'Half Day') {
      multiplier = 0.5;
    }

    if (duration === 'Custom Hours') {
      multiplier = 1;
    }

    return Math.round(
      workerCount *
        dailyWage *
        multiplier,
    );
  }, [
    workerCount,
    dailyWage,
    duration,
  ]);

  const platformFee =
    route?.params?.platformFee ??
    200;

  const taxes =
    route?.params?.taxes ??
    Math.round(
      labourCost * 0.033,
    );

  const grandTotal =
    labourCost +
    platformFee +
    taxes;

  // ==========================================================
  // INITIALIZE REDUX FORM WITH WORKER
  // ==========================================================

  useEffect(() => {
    if (!worker) {
      return;
    }

    const skills =
      Array.isArray(worker?.skills) &&
      worker.skills.length > 0
        ? worker.skills
        : Array.isArray(
            worker?.preferredWork,
          )
        ? worker.preferredWork
        : worker?.labourType
        ? [worker.labourType]
        : [];

    dispatch(
      setLabourFormData({
        fullName: workerName,

        phoneNumber:
          worker?.phoneNumber || '',

        village:
          worker?.village || '',

        profileImage:
          workerImage,

        gender:
          worker?.gender || '',

        preferredWork:
          skills,

        expectedWage:
          String(workerWage),

        wageType:
          workerWageType,

        experience:
          worker?.experience
            ? String(worker.experience)
            : '',

        experienceUnit:
          worker?.experienceUnit ||
          'years',
      }),
    );
  }, [
    dispatch,
    worker,
    workerId,
    workerName,
    workerImage,
    workerWage,
    workerWageType,
  ]);

  // ==========================================================
  // DURATION CHANGE
  // ==========================================================

  const handleDurationChange = value => {
    setDuration(value);

    if (value === 'Full Day') {
      setStartTime(
        createTime(8, 0),
      );

      setEndTime(
        createTime(17, 0),
      );

      return;
    }

    // Half Day and Custom Hours
    // require the user to select time.
    setStartTime(null);
    setEndTime(null);
  };

  // ==========================================================
  // TIME PICKER
  // ==========================================================

  const handleTimeChange = (
    event,
    selectedTime,
  ) => {
    setTimePickerMode(null);

    if (
      event?.type ===
      'dismissed'
    ) {
      return;
    }

    if (!selectedTime) {
      return;
    }

    if (
      timePickerMode ===
      'start'
    ) {
      setStartTime(
        selectedTime,
      );

      if (
        endTime &&
        selectedTime >=
          new Date(endTime)
      ) {
        setEndTime(null);
      }

      return;
    }

    if (
      timePickerMode ===
      'end'
    ) {
      if (
        startTime &&
        selectedTime <=
          new Date(startTime)
      ) {
        Alert.alert(
          'Invalid time',
          'End time must be later than start time.',
        );

        return;
      }

      setEndTime(
        selectedTime,
      );
    }
  };

  // ==========================================================
  // HALF DAY SELECTOR
  // ==========================================================

  const selectMorning = () => {
    setStartTime(
      createTime(8, 0),
    );

    setEndTime(
      createTime(12, 0),
    );
  };

  const selectAfternoon = () => {
    setStartTime(
      createTime(13, 0),
    );

    setEndTime(
      createTime(17, 0),
    );
  };

  const isMorningSelected =
    startTime &&
    endTime &&
    new Date(startTime).getHours() ===
      8 &&
    new Date(endTime).getHours() ===
      12;

  const isAfternoonSelected =
    startTime &&
    endTime &&
    new Date(startTime).getHours() ===
      13 &&
    new Date(endTime).getHours() ===
      17;

  // ============================================================
  // SAVE BOOKING DATA TO REDUX
  // ============================================================

  const saveBookingData = () => {
    const selectedDateObject =
      dates.find(
        item =>
          item.date ===
          selectedDate,
      );

    const bookingData = {
      workerId,

      workerCount,

      activity,

      duration,

      startTime:
        startTime
          ? startTime.toISOString()
          : null,

      endTime:
        endTime
          ? endTime.toISOString()
          : null,

      workingTimeDisplay:
        startTime && endTime
          ? `${formatTime(
              startTime,
            )} - ${formatTime(
              endTime,
            )}`
          : '',

      bookingDate:
        selectedDateObject?.fullDate ||
        new Date().toISOString(),

      bookingDateDisplay:
        selectedDate,

      bookingGender:
        gender,

      instructions,

      farmName,

      farmLocation,

      labourCost,

      platformFee,

      taxes,

      grandTotal,
    };

    dispatch(
      setLabourFormData(
        bookingData,
      ),
    );

    return {
      ...bookingData,

      gender,
    };
  };

  // ============================================================
  // CONTINUE
  // ============================================================

  const handleContinue = () => {
    if (!workerId) {
      Alert.alert(
        'Worker unavailable',
        'Worker information is missing. Please go back and select a worker again.',
      );

      return;
    }

    if (!worker) {
      Alert.alert(
        'Worker unavailable',
        'Unable to load the selected worker.',
      );

      return;
    }

    if (
      worker?.isActive === false
    ) {
      Alert.alert(
        'Worker unavailable',
        'This worker is currently unavailable.',
      );

      return;
    }

    if (workerCount < 1) {
      Alert.alert(
        'Invalid worker count',
        'Please select at least one worker.',
      );

      return;
    }

    if (!activity) {
      Alert.alert(
        'Select activity',
        'Please select a farming activity.',
      );

      return;
    }

    if (!selectedDate) {
      Alert.alert(
        'Select date',
        'Please select a booking date.',
      );

      return;
    }

    // ========================================================
    // WORKING TIME VALIDATION
    // ========================================================

    if (
      duration === 'Half Day' ||
      duration === 'Custom Hours'
    ) {
      if (
        !startTime ||
        !endTime
      ) {
        Alert.alert(
          'Select working time',
          'Please select the working time before continuing.',
        );

        return;
      }
    }

    if (
      startTime &&
      endTime &&
      new Date(endTime) <=
        new Date(startTime)
    ) {
      Alert.alert(
        'Invalid working time',
        'End time must be later than start time.',
      );

      return;
    }

    const bookingData =
      saveBookingData();

    navigation.navigate(
      'ConfirmLabourBooking',
      {
        worker,

        ...bookingData,

        selectedDate,

        workerCount,

        activity,

        duration,

        startTime:
          bookingData.startTime,

        endTime:
          bookingData.endTime,

        workingTimeDisplay:
          bookingData.workingTimeDisplay,

        gender,

        instructions,

        farmName,

        farmLocation,

        labourCost,

        platformFee,

        taxes,

        grandTotal,
      },
    );
  };

  // ============================================================
  // NO WORKER
  // ============================================================

  if (!worker) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}>

        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
            style={styles.iconBtn}>

            <ArrowLeft
              size={rf(22)}
              color={DARK}
              strokeWidth={2.4}
            />
          </TouchableOpacity>

          <Text
            style={
              styles.headerTitle
            }>
            Booking Details
          </Text>
        </View>

        <View
          style={
            styles.errorContainer
          }>

          <Text
            style={
              styles.errorTitle
            }>
            Worker not found
          </Text>

          <Text
            style={
              styles.errorText
            }>
            Please go back and select a
            worker before continuing.
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.errorButton
            }>

            <Text
              style={
                styles.errorButtonText
              }>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          style={styles.iconBtn}>

          <ArrowLeft
            size={rf(22)}
            color={DARK}
            strokeWidth={2.4}
          />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            marginLeft: 12,
          }}>

          <Text
            style={
              styles.headerTitle
            }>
            Booking Details
          </Text>

          <Text
            style={styles.headerSub}
            numberOfLines={1}>
            {workerName}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 120,
        }}>

        <View
          style={{
            padding:
              width * 0.037,
          }}>

          {/* ==================================================
              WORKER CARD
          ================================================== */}

          <View
            style={
              styles.workerCard
            }>

            {workerImage ? (
              <Image
                source={{
                  uri: workerImage,
                }}
                style={
                  styles.workerImage
                }
              />
            ) : (
              <View
                style={
                  styles.workerPlaceholder
                }>

                <Text
                  style={
                    styles.workerPlaceholderText
                  }>
                  {workerName
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
            )}

            <View
              style={{
                flex: 1,
                marginLeft: 14,
              }}>

              <View
                style={{
                  flexDirection:
                    'row',
                  alignItems:
                    'center',
                  gap: 6,
                }}>

                <Text
                  style={
                    styles.workerName
                  }
                  numberOfLines={1}>
                  {workerName}
                </Text>

                {worker?.isVerified ? (
                  <View
                    style={
                      styles.verifiedPill
                    }>

                    <BadgeCheck
                      size={rf(10)}
                      color={GREEN}
                      strokeWidth={
                        2.5
                      }
                    />

                    <Text
                      style={
                        styles.verifiedText
                      }>
                      Verified
                    </Text>
                  </View>
                ) : null}
              </View>

              <View
                style={{
                  flexDirection:
                    'row',
                  alignItems:
                    'center',
                  gap: 4,
                  marginTop: 5,
                }}>

                <Star
                  size={rf(12)}
                  color="#FACC15"
                  fill="#FACC15"
                />

                <Text
                  style={
                    styles.rating
                  }>
                  {workerRating.toFixed(
                    1,
                  )}
                </Text>

                <Text
                  style={
                    styles.reviews
                  }>
                  ({workerReviews}{' '}
                  Reviews)
                </Text>

                <View
                  style={
                    styles.expPill
                  }>

                  <Text
                    style={
                      styles.expText
                    }>
                    {workerExperience}
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.wage
                }>
                ₹{dailyWage}

                <Text
                  style={
                    styles.perDay
                  }>
                  {' '}
                  /{' '}
                  {workerWageType ===
                  'hourly'
                    ? 'Hour'
                    : 'Day'}
                </Text>
              </Text>
            </View>
          </View>

          {/* ==================================================
              BOOKING DATE
          ================================================== */}

          <Text
            style={
              styles.sectionTitle
            }>
            Booking Date
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }>

            {dates.map(
              dateItem => {
                const active =
                  selectedDate ===
                  dateItem.date;

                return (
                  <TouchableOpacity
                    key={
                      dateItem.fullDate
                    }
                    onPress={() =>
                      setSelectedDate(
                        dateItem.date,
                      )
                    }
                    style={[
                      styles.dateCard,
                      active &&
                        styles.activeDateCard,
                    ]}>

                    <Text
                      style={[
                        styles.dateDay,
                        active && {
                          color:
                            '#FFFFFF',
                        },
                      ]}>
                      {
                        dateItem.day
                      }
                    </Text>

                    <Text
                      style={[
                        styles.dateNum,
                        active && {
                          color:
                            '#FFFFFF',
                        },
                      ]}>
                      {
                        dateItem.date
                      }
                    </Text>

                    <Text
                      style={[
                        styles.dateStatus,
                        active && {
                          color:
                            '#FFFFFF',
                        },
                      ]}>
                      {
                        dateItem.status
                      }
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </ScrollView>

          {/* ==================================================
              WORKERS
          ================================================== */}

          <Text
            style={
              styles.sectionTitle
            }>
            Workers
          </Text>

          <View
            style={
              styles.workerCountCard
            }>

            <Text
              style={
                styles.countLabel
              }>
              Select required count
            </Text>

            <View
              style={{
                flex: 1,
              }}
            />

            <TouchableOpacity
              onPress={() =>
                setWorkerCount(
                  Math.max(
                    1,
                    workerCount -
                      1,
                  ),
                )
              }
              style={
                styles.countBtn
              }>

              <Minus
                size={rf(18)}
                color={DARK}
                strokeWidth={
                  2.4
                }
              />
            </TouchableOpacity>

            <Text
              style={
                styles.countValue
              }>
              {workerCount}
            </Text>

            <TouchableOpacity
              onPress={() =>
                setWorkerCount(
                  workerCount + 1,
                )
              }
              style={[
                styles.countBtn,
                {
                  backgroundColor:
                    GREEN,
                },
              ]}>

              <Plus
                size={rf(18)}
                color="#FFFFFF"
                strokeWidth={
                  2.4
                }
              />
            </TouchableOpacity>
          </View>

          {/* ==================================================
              AI WORKER RECOMMENDATION
          ================================================== */}

          <View
            style={
              styles.aiPill
            }>

            <Briefcase
              size={rf(14)}
              color={GREEN}
            />

            <Text
              style={
                styles.aiPillText
              }>
              AI Recommendation:{' '}
              {workerCount}{' '}
              Workers
            </Text>

            <View
              style={
                styles.optimalPill
              }>

              <Text
                style={
                  styles.optimalText
                }>
                Optimal
              </Text>
            </View>
          </View>

          {/* ==================================================
              FARMING ACTIVITY
          ================================================== */}

          <Text
            style={
              styles.sectionTitle
            }>
            Farming Activity
          </Text>

          <View
            style={
              styles.pillGrid
            }>

            {ACTIVITIES.map(
              item => {
                const active =
                  activity ===
                  item;

                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() =>
                      setActivity(
                        item,
                      )
                    }
                    style={[
                      styles.activityPill,
                      active &&
                        styles.activeActivityPill,
                    ]}>

                    <Text
                      style={[
                        styles.activityText,
                        active && {
                          color:
                            '#FFFFFF',
                        },
                      ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>

          {/* ==================================================
              WORKING DURATION
          ================================================== */}

          <Text
            style={
              styles.sectionTitle
            }>
            Working Duration
          </Text>

          <View
            style={
              styles.segment
            }>

            {DURATIONS.map(
              item => {
                const active =
                  duration ===
                  item;

                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() =>
                      handleDurationChange(
                        item,
                      )
                    }
                    style={[
                      styles.segmentBtn,
                      active &&
                        styles.activeSegmentBtn,
                    ]}>

                    <Text
                      style={[
                        styles.segmentText,
                        active && {
                          color:
                            '#FFFFFF',
                        },
                      ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>

          {/* ==================================================
              WORKING TIME
          ================================================== */}

          <Text
            style={
              styles.sectionTitle
            }>
            Working Time
          </Text>

          {/* ==================================================
              FULL DAY
          ================================================== */}

          {duration ===
          'Full Day' ? (
            <View
              style={
                styles.fixedTimeCard
              }>

              <View
                style={
                  styles.timeIconCircle
                }>

                <Text
                  style={
                    styles.clockText
                  }>
                  8–5
                </Text>
              </View>

              <View
                style={
                  styles.timeInfo
                }>

                <Text
                  style={
                    styles.timeLabel
                  }>
                  Full Day Working Hours
                </Text>

                <Text
                  style={
                    styles.timeValue
                  }>
                  8:00 AM - 5:00 PM
                </Text>
              </View>

              <View
                style={
                  styles.fixedBadge
                }>

                <Text
                  style={
                    styles.fixedBadgeText
                  }>
                  Fixed
                </Text>
              </View>
            </View>
          ) : null}

          {/* ==================================================
              HALF DAY
          ================================================== */}

          {duration ===
          'Half Day' ? (
            <View>

              <Text
                style={
                  styles.timeHint
                }>
                Select your preferred
                half-day working period
              </Text>

              <View
                style={
                  styles.halfDayRow
                }>

                <TouchableOpacity
                  activeOpacity={
                    0.85
                  }
                  onPress={
                    selectMorning
                  }
                  style={[
                    styles.timeOption,
                    isMorningSelected &&
                      styles.activeTimeOption,
                  ]}>

                  <Text
                    style={[
                      styles.timeOptionTitle,
                      isMorningSelected &&
                        styles.activeTimeOptionText,
                    ]}>
                    Morning
                  </Text>

                  <Text
                    style={[
                      styles.timeOptionTime,
                      isMorningSelected &&
                        styles.activeTimeOptionText,
                    ]}>
                    8:00 AM - 12:00 PM
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={
                    0.85
                  }
                  onPress={
                    selectAfternoon
                  }
                  style={[
                    styles.timeOption,
                    isAfternoonSelected &&
                      styles.activeTimeOption,
                  ]}>

                  <Text
                    style={[
                      styles.timeOptionTitle,
                      isAfternoonSelected &&
                        styles.activeTimeOptionText,
                    ]}>
                    Afternoon
                  </Text>

                  <Text
                    style={[
                      styles.timeOptionTime,
                      isAfternoonSelected &&
                        styles.activeTimeOptionText,
                    ]}>
                    1:00 PM - 5:00 PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* ==================================================
              CUSTOM HOURS
          ================================================== */}

          {duration ===
          'Custom Hours' ? (
            <View>

              <Text
                style={
                  styles.timeHint
                }>
                Select start and end
                time for custom working
                hours
              </Text>

              <View
                style={
                  styles.customTimeRow
                }>

                <TouchableOpacity
                  activeOpacity={
                    0.85
                  }
                  onPress={() =>
                    setTimePickerMode(
                      'start',
                    )
                  }
                  style={
                    styles.customTimeButton
                  }>

                  <Text
                    style={
                      styles.customTimeLabel
                    }>
                    Start Time
                  </Text>

                  <Text
                    style={
                      styles.customTimeValue
                    }>
                    {startTime
                      ? formatTime(
                          startTime,
                        )
                      : 'Select time'}
                  </Text>
                </TouchableOpacity>

                <View
                  style={
                    styles.timeArrow
                  }>

                  <ArrowRight
                    size={rf(18)}
                    color={MUTED}
                    strokeWidth={
                      2.2
                    }
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={
                    0.85
                  }
                  disabled={
                    !startTime
                  }
                  onPress={() =>
                    setTimePickerMode(
                      'end',
                    )
                  }
                  style={[
                    styles.customTimeButton,
                    !startTime &&
                      styles.disabledTimeButton,
                  ]}>

                  <Text
                    style={
                      styles.customTimeLabel
                    }>
                    End Time
                  </Text>

                  <Text
                    style={
                      styles.customTimeValue
                    }>
                    {endTime
                      ? formatTime(
                          endTime,
                        )
                      : 'Select time'}
                  </Text>
                </TouchableOpacity>
              </View>

              {!startTime ? (
                <Text
                  style={
                    styles.selectionWarning
                  }>
                  Please select a start
                  time first.
                </Text>
              ) : null}
            </View>
          ) : null}

          {/* ==================================================
              TIME PICKER
          ================================================== */}

          {timePickerMode ? (
            <DateTimePicker
              value={
                timePickerMode ===
                'start'
                  ? startTime ||
                    createTime(
                      8,
                      0,
                    )
                  : endTime ||
                    createTime(
                      17,
                      0,
                    )
              }
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={
                handleTimeChange
              }
            />
          ) : null}

          {/* ==================================================
              GENDER
          ================================================== */}

          <Text
            style={
              styles.sectionTitle
            }>
            Gender Preference{' '}
            <Text
              style={
                styles.optional
              }>
              (Optional)
            </Text>
          </Text>

          <View
            style={
              styles.genderRow
            }>

            {GENDERS.map(
              item => {
                const active =
                  gender ===
                  item.id;

                return (
                  <TouchableOpacity
                    key={
                      item.id
                    }
                    onPress={() =>
                      setGender(
                        item.id,
                      )
                    }
                    style={[
                      styles.genderCard,
                      active &&
                        styles.activeGenderCard,
                    ]}>

                    <Text
                      style={
                        styles.genderIcon
                      }>
                      {item.id ===
                      'any'
                        ? 'Any'
                        : item.id ===
                          'male'
                        ? 'M'
                        : item.id ===
                          'female'
                        ? 'F'
                        : 'M/F'}
                    </Text>

                    <Text
                      style={[
                        styles.genderLabel,
                        active && {
                          color:
                            '#FFFFFF',
                        },
                      ]}>
                      {
                        item.label
                      }
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>

          {/* ==================================================
              FARM LOCATION
          ================================================== */}

          <Text
            style={
              styles.sectionTitle
            }>
            Farm Location
          </Text>

          <View
            style={
              styles.locationCard
            }>

            <View
              style={
                styles.locIconBox
              }>

              <MapPin
                size={rf(19)}
                color={GREEN}
                strokeWidth={
                  2.4
                }
              />
            </View>

            <View
              style={{
                flex: 1,
                marginLeft: 10,
              }}>

              <Text
                style={
                  styles.locName
                }>
                {farmName}
              </Text>

              <Text
                style={
                  styles.locSub
                }
                numberOfLines={2}>
                {farmLocation ||
                  'Farm location not specified'}
              </Text>
            </View>
          </View>

          {/* ==================================================
              SPECIAL INSTRUCTIONS
          ================================================== */}

          <Text
            style={
              styles.sectionTitle
            }>
            Special Instructions
          </Text>

          <TextInput
            value={
              instructions
            }
            onChangeText={
              setInstructions
            }
            placeholder="Add instructions for workers..."
            placeholderTextColor="#94A3B8"
            multiline
            style={
              styles.textArea
            }
          />

          {/* ==================================================
              COST SUMMARY
          ================================================== */}

          <View
            style={
              styles.summaryCard
            }>

            <Text
              style={
                styles.summaryTitle
              }>
              Cost Summary
            </Text>

            <SummaryRow
              label={`Labour Cost (${workerCount} Workers × ${
                duration ===
                'Half Day'
                  ? '0.5'
                  : '1'
              } Day)`}
              value={`₹${labourCost.toLocaleString(
                'en-IN',
              )}`}
            />

            <SummaryRow
              label="Platform Fee"
              value={`₹${platformFee}`}
            />

            <SummaryRow
              label="GST (3.3%)"
              value={`₹${taxes}`}
            />

            <View
              style={
                styles.divider
              }
            />

            <View
              style={
                styles.totalRow
              }>

              <Text
                style={
                  styles.totalLabel
                }>
                Grand Total
              </Text>

              <Text
                style={
                  styles.totalValue
                }>
                ₹
                {grandTotal.toLocaleString(
                  'en-IN',
                )}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ======================================================
          BOTTOM BAR
      ====================================================== */}

      <View
        style={
          styles.bottomBar
        }>

        <View>
          <Text
            style={
              styles.bottomLabel
            }>
            Grand Total
          </Text>

          <Text
            style={
              styles.bottomValue
            }>
            ₹
            {grandTotal.toLocaleString(
              'en-IN',
            )}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={
            handleContinue
          }
          style={
            styles.continueBtn
          }>

          <Text
            style={
              styles.continueText
            }>
            Continue
          </Text>

          <ArrowRight
            size={rf(18)}
            color="#FFFFFF"
            strokeWidth={
              2.6
            }
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ============================================================
// SUMMARY ROW
// ============================================================

function SummaryRow({
  label,
  value,
}) {
  return (
    <View
      style={
        styles.sRow
      }>

      <Text
        style={
          styles.sLabel
        }
        numberOfLines={2}>
        {label}
      </Text>

      <Text
        style={
          styles.sValue
        }>
        {value}
      </Text>
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      '#FFFFFF',
  },

  header: {
    height: 60,
    flexDirection:
      'row',
    alignItems:
      'center',
    paddingHorizontal:
      width * 0.037,
    borderBottomWidth: 1,
    borderBottomColor:
      '#EEF1F2',
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
      '#F8FAFC',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  headerTitle: {
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },

  headerSub: {
    marginTop: 2,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },

  workerCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor:
      '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection:
      'row',
  },

  workerImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor:
      '#F1F5F9',
  },

  workerPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor:
      '#DCFCE7',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  workerPlaceholderText: {
    fontSize: rf(25),
    fontWeight: '900',
    color: GREEN,
  },

  workerName: {
    flex: 1,
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },

  verifiedPill: {
    paddingHorizontal: 7,
    height: 20,
    borderRadius: 10,
    backgroundColor:
      '#DCFCE7',
    flexDirection:
      'row',
    alignItems:
      'center',
    gap: 3,
  },

  verifiedText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: GREEN,
  },

  rating: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },

  reviews: {
    fontSize: rf(11),
    color: MUTED,
  },

  expPill: {
    marginLeft: 5,
    paddingHorizontal: 7,
    height: 20,
    borderRadius: 10,
    backgroundColor:
      '#F1F5F9',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  expText: {
    fontSize: rf(10),
    fontWeight: '800',
    color: DARK,
  },

  wage: {
    marginTop: 6,
    fontSize: rf(17),
    fontWeight: '900',
    color: GREEN,
  },

  perDay: {
    fontSize: rf(12),
    color: MUTED,
    fontWeight: '500',
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 12,
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },

  dateCard: {
    width: 72,
    height: 84,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor:
      '#FFFFFF',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  activeDateCard: {
    backgroundColor:
      GREEN,
    borderColor: GREEN,
  },

  dateDay: {
    fontSize: rf(11),
    fontWeight: '800',
    color: MUTED,
  },

  dateNum: {
    marginTop: 2,
    fontSize: rf(19),
    fontWeight: '900',
    color: DARK,
  },

  dateStatus: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '700',
    color: GREEN,
  },

  workerCountCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor:
      '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection:
      'row',
    alignItems:
      'center',
  },

  countLabel: {
    fontSize: rf(14),
    fontWeight: '800',
    color: DARK,
  },

  countBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:
      '#F1F5F9',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  countValue: {
    marginHorizontal: 18,
    fontSize: rf(22),
    fontWeight: '900',
    color: DARK,
  },

  aiPill: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor:
      '#F0FDF4',
    borderWidth: 1,
    borderColor:
      '#BBF7D0',
    flexDirection:
      'row',
    alignItems:
      'center',
    gap: 7,
  },

  aiPillText: {
    flex: 1,
    fontSize: rf(12),
    fontWeight: '800',
    color: GREEN,
  },

  optimalPill: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    backgroundColor:
      GREEN,
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  optimalText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  pillGrid: {
    flexDirection:
      'row',
    flexWrap:
      'wrap',
    gap: 8,
  },

  activityPill: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    backgroundColor:
      '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  activeActivityPill: {
    backgroundColor:
      GREEN,
    borderColor: GREEN,
  },

  activityText: {
    fontSize: rf(13),
    fontWeight: '800',
    color: DARK,
  },

  segment: {
    flexDirection:
      'row',
    padding: 4,
    borderRadius: 12,
    backgroundColor:
      '#F1F5F9',
  },

  segmentBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  activeSegmentBtn: {
    backgroundColor:
      GREEN,
  },

  segmentText: {
    fontSize: rf(13),
    fontWeight: '800',
    color: DARK,
  },

  // ==========================================================
  // WORKING TIME STYLES
  // ==========================================================

  timeHint: {
    marginTop: -4,
    marginBottom: 10,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },

  fixedTimeCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor:
      '#F0FDF4',
    borderWidth: 1,
    borderColor:
      '#BBF7D0',
    flexDirection:
      'row',
    alignItems:
      'center',
  },

  timeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor:
      '#DCFCE7',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  clockText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: GREEN,
  },

  timeInfo: {
    flex: 1,
    marginLeft: 12,
  },

  timeLabel: {
    fontSize: rf(12),
    color: MUTED,
    fontWeight: '700',
  },

  timeValue: {
    marginTop: 4,
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },

  fixedBadge: {
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    backgroundColor:
      GREEN,
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  fixedBadgeText: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  halfDayRow: {
    flexDirection:
      'row',
    gap: 10,
  },

  timeOption: {
    flex: 1,
    minHeight: 78,
    padding: 12,
    borderRadius: 14,
    backgroundColor:
      '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent:
      'center',
  },

  activeTimeOption: {
    backgroundColor:
      GREEN,
    borderColor: GREEN,
  },

  timeOptionTitle: {
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },

  timeOptionTime: {
    marginTop: 5,
    fontSize: rf(11),
    fontWeight: '700',
    color: MUTED,
  },

  activeTimeOptionText: {
    color: '#FFFFFF',
  },

  customTimeRow: {
    flexDirection:
      'row',
    alignItems:
      'center',
    gap: 8,
  },

  customTimeButton: {
    flex: 1,
    minHeight: 78,
    padding: 12,
    borderRadius: 14,
    backgroundColor:
      '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent:
      'center',
  },

  disabledTimeButton: {
    opacity: 0.5,
  },

  customTimeLabel: {
    fontSize: rf(11),
    fontWeight: '700',
    color: MUTED,
  },

  customTimeValue: {
    marginTop: 5,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },

  timeArrow: {
    width: 30,
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  selectionWarning: {
    marginTop: 8,
    fontSize: rf(11),
    fontWeight: '700',
    color: ORANGE,
  },

  // ==========================================================
  // GENDER
  // ==========================================================

  optional: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '500',
  },

  genderRow: {
    flexDirection:
      'row',
    gap: 8,
  },

  genderCard: {
    flex: 1,
    height: 84,
    borderRadius: 12,
    backgroundColor:
      '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems:
      'center',
    justifyContent:
      'center',
    gap: 6,
  },

  activeGenderCard: {
    backgroundColor:
      GREEN,
    borderColor: GREEN,
  },

  genderIcon: {
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },

  genderLabel: {
    fontSize: rf(12),
    fontWeight: '800',
    color: DARK,
  },

  // ==========================================================
  // LOCATION
  // ==========================================================

  locationCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor:
      '#F0FDF4',
    borderWidth: 1,
    borderColor:
      '#BBF7D0',
    flexDirection:
      'row',
    alignItems:
      'center',
  },

  locIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor:
      '#DCFCE7',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  locName: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },

  locSub: {
    marginTop: 3,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },

  // ==========================================================
  // TEXT AREA
  // ==========================================================

  textArea: {
    minHeight: 90,
    padding: 14,
    borderRadius: 12,
    backgroundColor:
      '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    fontSize: rf(13),
    color: DARK,
    textAlignVertical:
      'top',
  },

  // ==========================================================
  // SUMMARY
  // ==========================================================

  summaryCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 14,
    backgroundColor:
      '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  summaryTitle: {
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
    marginBottom: 14,
  },

  sRow: {
    flexDirection:
      'row',
    justifyContent:
      'space-between',
    marginBottom: 12,
    gap: 12,
  },

  sLabel: {
    flex: 1,
    fontSize: rf(13),
    color: MUTED,
    fontWeight: '500',
  },

  sValue: {
    fontSize: rf(13),
    color: DARK,
    fontWeight: '900',
  },

  divider: {
    height: 1,
    backgroundColor:
      '#E5E7EB',
    marginVertical: 6,
  },

  totalRow: {
    marginTop: 8,
    flexDirection:
      'row',
    justifyContent:
      'space-between',
    alignItems:
      'center',
  },

  totalLabel: {
    fontSize: rf(17),
    fontWeight: '900',
    color: DARK,
  },

  totalValue: {
    fontSize: rf(20),
    fontWeight: '900',
    color: GREEN,
  },

  // ==========================================================
  // BOTTOM BAR
  // ==========================================================

  bottomBar: {
    position:
      'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 78,
    paddingHorizontal:
      width * 0.037,
    paddingVertical: 12,
    backgroundColor:
      '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection:
      'row',
    alignItems:
      'center',
    justifyContent:
      'space-between',
  },

  bottomLabel: {
    fontSize: rf(11),
    color: '#94A3B8',
    fontWeight: '600',
  },

  bottomValue: {
    marginTop: 3,
    fontSize: rf(20),
    color: GREEN,
    fontWeight: '900',
  },

  continueBtn: {
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor:
      GREEN,
    flexDirection:
      'row',
    alignItems:
      'center',
    gap: 8,
  },

  continueText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // ==========================================================
  // ERROR
  // ==========================================================

  errorContainer: {
    flex: 1,
    alignItems:
      'center',
    justifyContent:
      'center',
    paddingHorizontal: 30,
  },

  errorTitle: {
    fontSize: rf(20),
    fontWeight: '900',
    color: DARK,
  },

  errorText: {
    marginTop: 8,
    fontSize: rf(13),
    lineHeight: rf(19),
    color: MUTED,
    textAlign:
      'center',
  },

  errorButton: {
    marginTop: 20,
    height: 46,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor:
      GREEN,
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  errorButtonText: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});