import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Leaf,
  Map,
  MapPin,
  Navigation,
  Ruler,
  Search,
  Sprout,
  Tractor,
  X,
} from 'lucide-react-native';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import axios from 'axios';

import {
  addFarmField,
  selectFarmFieldAdding,
  selectFarmFieldError,
} from '../../redux/slices/farmFieldSlice';

import {
  selectUser,
} from '../../redux/slices/authSlice';

const GREEN = '#159447';
const DARK = '#17211B';
const MUTED = '#718078';
const BORDER = '#E5EAE7';
const BACKGROUND = '#F7FAF8';

const CROP_API =
  'https://server.cropgenapp.com/v1/api/crop/get-crop-list';

const IRRIGATION_OPTIONS = [
  'Drip',
  'Sprinkler',
  'Flood',
  'Rainfed',
  'Other',
];

const FARMING_OPTIONS = [
  'Organic',
  'Inorganic',
  'Integrated',
];

/*
|--------------------------------------------------------------------------
| DATE HELPERS
|--------------------------------------------------------------------------
*/

const pad = value =>
  String(value).padStart(2, '0');

const makeDateKey = (
  year,
  month,
  day,
) => {
  return `${year}-${pad(
    month + 1,
  )}-${pad(day)}`;
};

const parseDateKey = value => {
  if (!value) {
    return null;
  }

  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value,
    );

  if (!match) {
    return null;
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]) - 1;

  const day =
    Number(match[3]);

  const date =
    new Date(
      year,
      month,
      day,
    );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const startOfDay = date => {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0,
  );

  return result;
};

const getTodayKey = () => {
  const today =
    new Date();

  return makeDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
};

const formatDisplayDate = value => {
  const date =
    parseDateKey(value);

  if (!date) {
    return '';
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
};

const formatMonthYear = date => {
  return date.toLocaleDateString(
    'en-IN',
    {
      month: 'long',
      year: 'numeric',
    },
  );
};

const getDaysInMonth = (
  year,
  month,
) => {
  return new Date(
    year,
    month + 1,
    0,
  ).getDate();
};

const getFirstDayOfMonth = (
  year,
  month,
) => {
  return new Date(
    year,
    month,
    1,
  ).getDay();
};

/*
|--------------------------------------------------------------------------
| SCREEN
|--------------------------------------------------------------------------
*/

export default function FarmDetailsScreen() {
  const navigation =
    useNavigation();

  const route =
    useRoute();

  const dispatch =
    useDispatch();

  const {
    farmBoundary = [],
    areaHectares = 0,
    areaAcres = 0,
    perimeterMeters = 0,
    location = null,
  } = route?.params || {};

  const user =
    useSelector(selectUser);

  const userId =
    user?._id ||
    user?.id ||
    user?.userId;

  const saving =
    useSelector(
      selectFarmFieldAdding,
    );

  const reduxError =
    useSelector(
      selectFarmFieldError,
    );

  /*
  |--------------------------------------------------------------------------
  | FORM STATE
  |--------------------------------------------------------------------------
  */

  const [
    farmName,
    setFarmName,
  ] = useState('');

  const [
    cropName,
    setCropName,
  ] = useState('');

  const [
    selectedCrop,
    setSelectedCrop,
  ] = useState(null);

  const [
    variety,
    setVariety,
  ] = useState('');

  const [
    sowingDate,
    setSowingDate,
  ] = useState('');

  const [
    acre,
    setAcre,
  ] = useState(
    areaAcres
      ? Number(
          areaAcres.toFixed(2),
        ).toString()
      : '',
  );

  const [
    irrigation,
    setIrrigation,
  ] = useState('');

  const [
    farmingType,
    setFarmingType,
  ] = useState('');

  const [
    isBarrenLand,
    setIsBarrenLand,
  ] = useState(false);

  const [
    showIrrigation,
    setShowIrrigation,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | CROP STATE
  |--------------------------------------------------------------------------
  */

  const [
    crops,
    setCrops,
  ] = useState([]);

  const [
    cropLoading,
    setCropLoading,
  ] = useState(true);

  const [
    cropError,
    setCropError,
  ] = useState('');

  const [
    cropModalVisible,
    setCropModalVisible,
  ] = useState(false);

  const [
    cropSearch,
    setCropSearch,
  ] = useState('');

  /*
  |--------------------------------------------------------------------------
  | DATE PICKER STATE
  |--------------------------------------------------------------------------
  */

  const [
    datePickerVisible,
    setDatePickerVisible,
  ] = useState(false);

  const [
    calendarMonth,
    setCalendarMonth,
  ] = useState(() => {
    const today =
      new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );
  });

  /*
  |--------------------------------------------------------------------------
  | FETCH CROPS FROM CROPGEN
  |--------------------------------------------------------------------------
  */

  const fetchCrops = async () => {
    try {
      setCropLoading(true);
      setCropError('');

      console.log(
        '[FarmDetails] Fetching CropGen crop list...',
      );

      const response =
        await axios.get(
          CROP_API,
          {
            timeout: 20000,
          },
        );

      console.log(
        '[FarmDetails] CropGen API status:',
        response?.status,
      );

      console.log(
        '[FarmDetails] CropGen API response:',
        JSON.stringify(
          response?.data,
          null,
          2,
        ),
      );

      const responseData =
        response?.data;

      let cropArray = [];

      /*
       * CropGen normally returns an array,
       * but support common wrapper formats.
       */

      if (
        Array.isArray(
          responseData,
        )
      ) {
        cropArray =
          responseData;
      } else if (
        Array.isArray(
          responseData?.data,
        )
      ) {
        cropArray =
          responseData.data;
      } else if (
        Array.isArray(
          responseData?.crops,
        )
      ) {
        cropArray =
          responseData.crops;
      } else if (
        Array.isArray(
          responseData?.result,
        )
      ) {
        cropArray =
          responseData.result;
      }

      /*
       * IMPORTANT:
       *
       * Preserve CropGen's actual cropName
       * and cropImage.
       */

      const normalized =
        cropArray
          .filter(
            crop =>
              crop &&
              typeof crop.cropName ===
                'string' &&
              crop.cropName.trim(),
          )
          .map(crop => {
            const normalizedImage =
              typeof crop.cropImage ===
              'string'
                ? crop.cropImage.trim()
                : '';

            return {
              _id:
                crop._id ||
                crop.id ||
                crop.cropName,

              cropName:
                crop.cropName.trim(),

              cropImage:
                normalizedImage,
            };
          });

      /*
       * Remove duplicate crop names.
       */

      const unique =
        normalized.filter(
          (crop, index, array) =>
            array.findIndex(
              item =>
                item.cropName.toLowerCase() ===
                crop.cropName.toLowerCase(),
            ) === index,
        );

      setCrops(unique);

      console.log(
        `[FarmDetails] Loaded ${unique.length} crops`,
      );

      if (unique.length > 0) {
        console.log(
          '[FarmDetails] First CropGen crop:',
          JSON.stringify(
            unique[0],
            null,
            2,
          ),
        );
      }
    } catch (error) {
      console.log(
        '[FarmDetails] Crop API error:',
        error?.response?.data ||
          error?.message ||
          error,
      );

      setCropError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to load crops.',
      );

      setCrops([]);
    } finally {
      setCropLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadCrops = async () => {
      try {
        setCropLoading(true);
        setCropError('');

        console.log(
          '[FarmDetails] Fetching CropGen crop list...',
        );

        const response =
          await axios.get(
            CROP_API,
            {
              timeout: 20000,
            },
          );

        if (!mounted) {
          return;
        }

        console.log(
          '[FarmDetails] CropGen API status:',
          response?.status,
        );

        console.log(
          '[FarmDetails] CropGen API response:',
          JSON.stringify(
            response?.data,
            null,
            2,
          ),
        );

        const responseData =
          response?.data;

        let cropArray = [];

        if (
          Array.isArray(
            responseData,
          )
        ) {
          cropArray =
            responseData;
        } else if (
          Array.isArray(
            responseData?.data,
          )
        ) {
          cropArray =
            responseData.data;
        } else if (
          Array.isArray(
            responseData?.crops,
          )
        ) {
          cropArray =
            responseData.crops;
        } else if (
          Array.isArray(
            responseData?.result,
          )
        ) {
          cropArray =
            responseData.result;
        }

        const normalized =
          cropArray
            .filter(
              crop =>
                crop &&
                typeof crop.cropName ===
                  'string' &&
                crop.cropName.trim(),
            )
            .map(crop => ({
              _id:
                crop._id ||
                crop.id ||
                crop.cropName,

              cropName:
                crop.cropName.trim(),

              cropImage:
                typeof crop.cropImage ===
                'string'
                  ? crop.cropImage.trim()
                  : '',
            }));

        const unique =
          normalized.filter(
            (crop, index, array) =>
              array.findIndex(
                item =>
                  item.cropName.toLowerCase() ===
                  crop.cropName.toLowerCase(),
              ) === index,
          );

        setCrops(unique);

        console.log(
          `[FarmDetails] Loaded ${unique.length} crops`,
        );

        if (unique.length > 0) {
          console.log(
            '[FarmDetails] First crop:',
            JSON.stringify(
              unique[0],
              null,
              2,
            ),
          );
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.log(
          '[FarmDetails] Crop API error:',
          error?.response?.data ||
            error?.message ||
            error,
        );

        setCropError(
          error?.response?.data?.message ||
            error?.message ||
            'Unable to load crops.',
        );

        setCrops([]);
      } finally {
        if (mounted) {
          setCropLoading(false);
        }
      }
    };

    loadCrops();

    return () => {
      mounted = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTERED CROPS
  |--------------------------------------------------------------------------
  */

  const filteredCrops =
    useMemo(() => {
      const query =
        cropSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return crops;
      }

      return crops.filter(
        crop =>
          crop.cropName
            .toLowerCase()
            .includes(query),
      );
    }, [
      crops,
      cropSearch,
    ]);

  /*
  |--------------------------------------------------------------------------
  | CROP SELECT
  |--------------------------------------------------------------------------
  */

  const handleSelectCrop =
    crop => {
      if (!crop) {
        return;
      }

      const normalizedCrop = {
        _id:
          crop?._id ||
          crop?.id ||
          crop?.cropName ||
          '',

        cropName:
          typeof crop?.cropName ===
          'string'
            ? crop.cropName.trim()
            : '',

        cropImage:
          typeof crop?.cropImage ===
          'string'
            ? crop.cropImage.trim()
            : '',
      };

      console.log(
        '====================================',
      );

      console.log(
        '[FarmDetails] CROP SELECTED:',
      );

      console.log(
        JSON.stringify(
          normalizedCrop,
          null,
          2,
        ),
      );

      console.log(
        '[FarmDetails] cropName:',
        normalizedCrop.cropName,
      );

      console.log(
        '[FarmDetails] cropImage:',
        normalizedCrop.cropImage,
      );

      console.log(
        '====================================',
      );

      setSelectedCrop(
        normalizedCrop,
      );

      /*
       * Keep CropGen's canonical name.
       *
       * Do NOT change:
       * soybean -> Soyabeen
       * wheat -> Wheat Crop
       * etc.
       */

      setCropName(
        normalizedCrop.cropName,
      );

      setCropModalVisible(
        false,
      );

      setCropSearch('');
    };

  /*
  |--------------------------------------------------------------------------
  | FORMATTED VALUES
  |--------------------------------------------------------------------------
  */

  const formattedArea =
    Number(
      areaAcres || 0,
    ).toFixed(2);

  const formattedHectares =
    Number(
      areaHectares || 0,
    ).toFixed(2);

  const formattedPerimeter =
    Math.round(
      Number(
        perimeterMeters || 0,
      ),
    );

  const locationText =
    location?.city ||
    location?.district ||
    location?.state ||
    'Current location';

  /*
  |--------------------------------------------------------------------------
  | DATE LIMITS
  |--------------------------------------------------------------------------
  */

  const todayDate =
    useMemo(
      () =>
        startOfDay(
          new Date(),
        ),
      [],
    );

  const todayKey =
    getTodayKey();

  const isDateDisabled =
    day => {
      const selected =
        startOfDay(
          new Date(
            calendarMonth.getFullYear(),
            calendarMonth.getMonth(),
            day,
          ),
        );

      if (isBarrenLand) {
        return (
          selected <
          todayDate
        );
      }

      return (
        selected >
        todayDate
      );
    };

  /*
  |--------------------------------------------------------------------------
  | DATE PICKER
  |--------------------------------------------------------------------------
  */

  const openDatePicker =
    () => {
      const selected =
        parseDateKey(
          sowingDate,
        );

      if (selected) {
        setCalendarMonth(
          new Date(
            selected.getFullYear(),
            selected.getMonth(),
            1,
          ),
        );
      } else {
        const today =
          new Date();

        setCalendarMonth(
          new Date(
            today.getFullYear(),
            today.getMonth(),
            1,
          ),
        );
      }

      setDatePickerVisible(
        true,
      );
    };

  const selectDate =
    day => {
      if (
        isDateDisabled(day)
      ) {
        return;
      }

      const value =
        makeDateKey(
          calendarMonth.getFullYear(),
          calendarMonth.getMonth(),
          day,
        );

      setSowingDate(value);

      setDatePickerVisible(
        false,
      );
    };

  const goPreviousMonth =
    () => {
      const previous =
        new Date(
          calendarMonth.getFullYear(),
          calendarMonth.getMonth() - 1,
          1,
        );

      if (isBarrenLand) {
        const current =
          new Date(
            todayDate.getFullYear(),
            todayDate.getMonth(),
            1,
          );

        if (
          previous <
          current
        ) {
          return;
        }
      }

      setCalendarMonth(
        previous,
      );
    };

  const goNextMonth =
    () => {
      const next =
        new Date(
          calendarMonth.getFullYear(),
          calendarMonth.getMonth() + 1,
          1,
        );

      if (!isBarrenLand) {
        const current =
          new Date(
            todayDate.getFullYear(),
            todayDate.getMonth(),
            1,
          );

        if (
          next >
          current
        ) {
          return;
        }
      }

      setCalendarMonth(
        next,
      );
    };

  const selectToday =
    () => {
      setSowingDate(
        todayKey,
      );

      setCalendarMonth(
        new Date(
          todayDate.getFullYear(),
          todayDate.getMonth(),
          1,
        ),
      );

      setDatePickerVisible(
        false,
      );
    };

  /*
  |--------------------------------------------------------------------------
  | CALENDAR DAYS
  |--------------------------------------------------------------------------
  */

  const calendarDays =
    useMemo(() => {
      const year =
        calendarMonth.getFullYear();

      const month =
        calendarMonth.getMonth();

      const firstDay =
        getFirstDayOfMonth(
          year,
          month,
        );

      const totalDays =
        getDaysInMonth(
          year,
          month,
        );

      const cells = [];

      for (
        let index = 0;
        index < firstDay;
        index += 1
      ) {
        cells.push({
          key:
            `empty-${index}`,
          empty: true,
        });
      }

      for (
        let day = 1;
        day <= totalDays;
        day += 1
      ) {
        cells.push({
          key:
            `day-${day}`,
          day,
          empty: false,
        });
      }

      return cells;
    }, [
      calendarMonth,
    ]);

  /*
  |--------------------------------------------------------------------------
  | VALIDATE
  |--------------------------------------------------------------------------
  */

  const validateForm =
    () => {
      if (!userId) {
        Alert.alert(
          'Login required',
          'We could not find your user account. Please log in again.',
        );

        return false;
      }

      if (
        !Array.isArray(
          farmBoundary,
        ) ||
        farmBoundary.length < 3
      ) {
        Alert.alert(
          'Boundary required',
          'Please go back and mark at least three points on your farm.',
        );

        return false;
      }

      if (
        !farmName.trim()
      ) {
        Alert.alert(
          'Farm name required',
          'Please enter a name for your farm.',
        );

        return false;
      }

      if (
        !cropName.trim() &&
        !isBarrenLand
      ) {
        Alert.alert(
          'Crop required',
          'Please select a crop.',
        );

        return false;
      }

      /*
       * IMPORTANT:
       *
       * Do not allow a crop to be saved
       * without its CropGen image.
       */

      if (
        !isBarrenLand
      ) {
        const image =
          typeof selectedCrop?.cropImage ===
          'string'
            ? selectedCrop.cropImage.trim()
            : '';

        if (!image) {
          Alert.alert(
            'Crop image missing',
            'The selected crop does not contain a crop image. Please select the crop again.',
          );

          return false;
        }
      }

      if (
        !variety.trim() &&
        !isBarrenLand
      ) {
        Alert.alert(
          'Variety required',
          'Please enter the crop variety.',
        );

        return false;
      }

      if (!sowingDate) {
        Alert.alert(
          isBarrenLand
            ? 'Expected sowing date required'
            : 'Sowing date required',
          isBarrenLand
            ? 'Please select the expected sowing date.'
            : 'Please select the sowing date.',
        );

        return false;
      }

      const selectedDate =
        parseDateKey(
          sowingDate,
        );

      if (!selectedDate) {
        Alert.alert(
          'Invalid date',
          'Please select a valid date.',
        );

        return false;
      }

      const selectedDay =
        startOfDay(
          selectedDate,
        );

      if (
        !isBarrenLand &&
        selectedDay >
          todayDate
      ) {
        Alert.alert(
          'Invalid sowing date',
          'For an existing crop, the sowing date cannot be in the future.',
        );

        return false;
      }

      if (
        isBarrenLand &&
        selectedDay <
          todayDate
      ) {
        Alert.alert(
          'Invalid expected date',
          'For barren land, the expected sowing date cannot be in the past.',
        );

        return false;
      }

      const numericAcre =
        Number(
          String(
            acre,
          ).trim(),
        );

      if (
        !Number.isFinite(
          numericAcre,
        ) ||
        numericAcre <= 0
      ) {
        Alert.alert(
          'Invalid area',
          'Please enter a valid farm area in acres.',
        );

        return false;
      }

      if (!irrigation) {
        Alert.alert(
          'Irrigation required',
          'Please select the type of irrigation.',
        );

        return false;
      }

      if (!farmingType) {
        Alert.alert(
          'Farming type required',
          'Please select your farming type.',
        );

        return false;
      }

      return true;
    };

  /*
  |--------------------------------------------------------------------------
  | BOUNDARY
  |--------------------------------------------------------------------------
  */

  const convertBoundaryForBackend =
    () => {
      return farmBoundary
        .map(point => {
          if (
            point &&
            !Array.isArray(
              point,
            ) &&
            typeof point ===
              'object'
          ) {
            const lat =
              Number(
                point.lat,
              );

            const lng =
              Number(
                point.lng,
              );

            if (
              !Number.isFinite(
                lat,
              ) ||
              !Number.isFinite(
                lng,
              )
            ) {
              return null;
            }

            return {
              lat,
              lng,
            };
          }

          if (
            Array.isArray(
              point,
            ) &&
            point.length >= 2
          ) {
            const lng =
              Number(
                point[0],
              );

            const lat =
              Number(
                point[1],
              );

            if (
              !Number.isFinite(
                lat,
              ) ||
              !Number.isFinite(
                lng,
              )
            ) {
              return null;
            }

            return {
              lat,
              lng,
            };
          }

          return null;
        })
        .filter(Boolean);
    };

  /*
  |--------------------------------------------------------------------------
  | SAVE FARM
  |--------------------------------------------------------------------------
  */

  const handleSaveFarm =
    async () => {
      if (
        !validateForm()
      ) {
        return;
      }

      const latlng =
        convertBoundaryForBackend();

      if (
        latlng.length < 3
      ) {
        Alert.alert(
          'Invalid boundary',
          'The farm boundary contains invalid coordinates. Please mark the field again.',
        );

        return;
      }

      /*
       * IMPORTANT:
       *
       * Take crop data directly from
       * selectedCrop, not only cropName.
       */

      const finalCropName =
        typeof selectedCrop?.cropName ===
        'string'
          ? selectedCrop.cropName.trim()
          : cropName.trim();

      const finalCropImage =
        typeof selectedCrop?.cropImage ===
        'string'
          ? selectedCrop.cropImage.trim()
          : '';

      /*
       * Final safety check.
       */

      if (
        !isBarrenLand &&
        !finalCropImage
      ) {
        Alert.alert(
          'Crop image missing',
          'The selected crop does not have a valid CropGen image. Please select the crop again.',
        );

        return;
      }

      /*
       * FINAL PAYLOAD
       */

      const payload = {
        userId,

        latlng,

        /*
         * CropGen canonical crop name.
         */
        cropName:
          finalCropName,

        /*
         * CropGen image URL.
         *
         * THIS is the important field
         * that must reach the Redux slice.
         */
        cropImage:
          finalCropImage,

        variety:
          variety.trim(),

        sowingDate:
          sowingDate.trim(),

        typeOfIrrigation:
          irrigation.trim(),

        farmName:
          farmName.trim(),

        acre:
          Number(
            acre,
          ),

        typeOfFarming:
          farmingType,

        isBarrenLand:
          Boolean(
            isBarrenLand,
          ),
      };

      /*
      |--------------------------------------------------------------------------
      | DEBUG BEFORE REDUX
      |--------------------------------------------------------------------------
      */

      console.log(
        '====================================',
      );

      console.log(
        '[FarmDetails] FINAL SELECTED CROP:',
      );

      console.log(
        JSON.stringify(
          selectedCrop,
          null,
          2,
        ),
      );

      console.log(
        '[FarmDetails] FINAL CROP NAME:',
        finalCropName,
      );

      console.log(
        '[FarmDetails] FINAL CROP IMAGE:',
        finalCropImage,
      );

      console.log(
        '[FarmDetails] FINAL FARM PAYLOAD:',
      );

      console.log(
        JSON.stringify(
          payload,
          null,
          2,
        ),
      );

      console.log(
        '====================================',
      );

      try {
        const result =
          await dispatch(
            addFarmField(
              payload,
            ),
          ).unwrap();

        console.log(
          '[FarmDetails] ADD FARM RESPONSE:',
        );

        console.log(
          JSON.stringify(
            result,
            null,
            2,
          ),
        );

        /*
        |--------------------------------------------------------------------------
        | SAVED FARM
        |--------------------------------------------------------------------------
        */

        const savedFarm =
          result?.farmField ||
          result?.data?.farmField ||
          result?.data ||
          null;

        /*
        |--------------------------------------------------------------------------
        | MERGE THE CROP DATA
        |--------------------------------------------------------------------------
        *
        * Even if the backend response does not
        * contain the image, keep the exact image
        * selected from CropGen for navigation.
        */

        const farmWithCropImage = {
          ...(savedFarm || {}),

          cropName:
            savedFarm?.cropName ||
            finalCropName,

          cropImage:
            savedFarm?.cropImage ||
            finalCropImage,

          variety:
            savedFarm?.variety ||
            variety.trim(),

          sowingDate:
            savedFarm?.sowingDate ||
            sowingDate.trim(),

          fieldName:
            savedFarm?.fieldName ||
            farmName.trim(),

          acre:
            savedFarm?.acre ??
            Number(
              acre,
            ),

          typeOfIrrigation:
            savedFarm?.typeOfIrrigation ||
            irrigation,

          typeOfFarming:
            savedFarm?.typeOfFarming ||
            farmingType,

          isBarrenLand:
            savedFarm?.isBarrenLand ??
            Boolean(
              isBarrenLand,
            ),
        };

        console.log(
          '[FarmDetails] FARM FOR NEXT SCREEN:',
        );

        console.log(
          JSON.stringify(
            farmWithCropImage,
            null,
            2,
          ),
        );

        /*
        |--------------------------------------------------------------------------
        | NAVIGATION
        |--------------------------------------------------------------------------
        */

        navigation.replace(
          'Farmsuccess',
          {
            farmField:
              farmWithCropImage,

            farmBoundary:
              farmWithCropImage?.field ||
              latlng,

            areaHectares:
              Number(
                areaHectares || 0,
              ),

            areaAcres:
              Number(
                acre,
              ),

            perimeterMeters:
              Number(
                perimeterMeters ||
                  0,
              ),

            location,

            cropName:
              finalCropName,

            cropImage:
              finalCropImage,

            sowingDate:
              sowingDate.trim(),

            variety:
              variety.trim(),
          },
        );
      } catch (error) {
        console.log(
          '[FarmDetails] Save error:',
          error,
        );

        const errorMessage =
          typeof error ===
          'string'
            ? error
            : error?.message ||
              reduxError ||
              'Something went wrong while saving your farm.';

        Alert.alert(
          'Could not save farm',
          errorMessage,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          BACKGROUND
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
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
              color={DARK}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerContent
            }
          >
            <Text
              style={
                styles.headerTitle
              }
            >
              Farm details
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              Tell us about this field
            </Text>
          </View>

          <View
            style={styles.stepBadge}
          >
            <Text
              style={
                styles.stepNumber
              }
            >
              2
            </Text>

            <Text
              style={styles.stepTotal}
            >
              /3
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* ========================================================= */}
          {/* BOUNDARY */}
          {/* ========================================================= */}

          <View
            style={
              styles.boundaryCard
            }
          >
            <View
              style={
                styles.boundaryTop
              }
            >
              <View
                style={
                  styles.boundaryIcon
                }
              >
                <Map
                  size={21}
                  color={GREEN}
                  strokeWidth={2.2}
                />
              </View>

              <View
                style={
                  styles.boundaryInfo
                }
              >
                <Text
                  style={
                    styles.boundaryTitle
                  }
                >
                  Field boundary captured
                </Text>

                <View
                  style={
                    styles.locationRow
                  }
                >
                  <MapPin
                    size={12}
                    color="#64748B"
                  />

                  <Text
                    numberOfLines={1}
                    style={
                      styles.locationText
                    }
                  >
                    {locationText}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.changeButton
                }
                onPress={() =>
                  navigation.goBack()
                }
              >
                <Text
                  style={
                    styles.changeText
                  }
                >
                  Edit
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.measurements
              }
            >
              <Measurement
                icon={
                  <Ruler
                    size={15}
                    color={GREEN}
                  />
                }
                label="Area"
                value={`${formattedArea} acres`}
              />

              <Measurement
                icon={
                  <Map
                    size={15}
                    color={GREEN}
                  />
                }
                label="Hectares"
                value={`${formattedHectares} ha`}
              />

              <Measurement
                icon={
                  <Navigation
                    size={15}
                    color={GREEN}
                  />
                }
                label="Perimeter"
                value={`${formattedPerimeter} m`}
              />
            </View>
          </View>

          {/* ========================================================= */}
          {/* BASIC INFORMATION */}
          {/* ========================================================= */}

          <SectionTitle
            icon={
              <Sprout
                size={18}
                color={GREEN}
              />
            }
            title="Basic information"
            subtitle="Give your farm and crop a name"
          />

          <InputField
            label="Farm name"
            placeholder="e.g. Patil Farm"
            value={farmName}
            onChangeText={
              setFarmName
            }
            icon={
              <Tractor
                size={18}
                color="#7A8981"
              />
            }
          />

          {/* ========================================================= */}
          {/* CROP SELECTOR */}
          {/* ========================================================= */}

          <View
            style={
              styles.inputGroup
            }
          >
            <Text
              style={
                styles.inputLabel
              }
            >
              Crop name
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.cropSelector,
                cropModalVisible &&
                  styles.cropSelectorActive,
              ]}
              onPress={() => {
                if (
                  isBarrenLand
                ) {
                  return;
                }

                setCropModalVisible(
                  true,
                );
              }}
            >
              {selectedCrop?.cropImage ? (
                <Image
                  source={{
                    uri:
                      selectedCrop.cropImage,
                  }}
                  style={
                    styles.selectedCropImage
                  }
                />
              ) : (
                <View
                  style={
                    styles.inputIcon
                  }
                >
                  <Leaf
                    size={18}
                    color={GREEN}
                  />
                </View>
              )}

              <View
                style={
                  styles.cropSelectorContent
                }
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.cropSelectorValue,
                    !cropName &&
                      styles.cropSelectorPlaceholder,
                  ]}
                >
                  {cropName ||
                    'Select a crop'}
                </Text>

                {selectedCrop && (
                  <Text
                    style={
                      styles.cropSelectorHint
                    }
                  >
                    CropGen crop catalogue
                  </Text>
                )}
              </View>

              <ChevronDown
                size={19}
                color="#64748B"
                style={
                  cropModalVisible
                    ? {
                        transform: [
                          {
                            rotate:
                              '180deg',
                          },
                        ],
                      }
                    : undefined
                }
              />
            </TouchableOpacity>

            {!cropLoading &&
              cropError && (
                <View
                  style={
                    styles.cropErrorRow
                  }
                >
                  <Text
                    style={
                      styles.cropErrorText
                    }
                  >
                    {cropError}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={
                      0.8
                    }
                    onPress={() => {
                      fetchCrops();
                    }}
                  >
                    <Text
                      style={
                        styles.cropRetryText
                      }
                    >
                      Retry
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            {!cropLoading &&
              !cropError &&
              crops.length > 0 && (
                <Text
                  style={
                    styles.cropAvailableText
                  }
                >
                  {crops.length} crops
                  available
                </Text>
              )}
          </View>

          <InputField
            label="Variety"
            placeholder="e.g. JS 335"
            value={variety}
            onChangeText={
              setVariety
            }
            icon={
              <Sprout
                size={18}
                color="#7A8981"
              />
            }
          />

          {/* ========================================================= */}
          {/* DATE */}
          {/* ========================================================= */}

          <View
            style={
              styles.inputGroup
            }
          >
            <Text
              style={
                styles.inputLabel
              }
            >
              {isBarrenLand
                ? 'Expected sowing date'
                : 'Sowing date'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={
                styles.dateField
              }
              onPress={
                openDatePicker
              }
            >
              <View
                style={
                  styles.inputIcon
                }
              >
                <CalendarDays
                  size={18}
                  color={GREEN}
                />
              </View>

              <View
                style={
                  styles.dateTextWrap
                }
              >
                <Text
                  style={[
                    styles.dateValue,
                    !sowingDate &&
                      styles.datePlaceholder,
                  ]}
                >
                  {sowingDate
                    ? formatDisplayDate(
                        sowingDate,
                      )
                    : isBarrenLand
                    ? 'Select expected date'
                    : 'Select sowing date'}
                </Text>

                {sowingDate && (
                  <Text
                    style={
                      styles.dateRaw
                    }
                  >
                    {sowingDate}
                  </Text>
                )}
              </View>

              <View
                style={
                  styles.calendarButton
                }
              >
                <CalendarDays
                  size={17}
                  color={GREEN}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* ========================================================= */}
          {/* AREA */}
          {/* ========================================================= */}

          <SectionTitle
            icon={
              <Ruler
                size={18}
                color={GREEN}
              />
            }
            title="Farm area"
            subtitle="You can adjust the calculated area"
          />

          <View
            style={
              styles.areaInputWrapper
            }
          >
            <View
              style={
                styles.areaIcon
              }
            >
              <Ruler
                size={18}
                color={GREEN}
              />
            </View>

            <View
              style={
                styles.areaTextWrap
              }
            >
              <Text
                style={
                  styles.areaInputLabel
                }
              >
                Total cultivated area
              </Text>

              <TextInput
                value={String(
                  acre,
                )}
                onChangeText={
                  setAcre
                }
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#A7B1AB"
                style={
                  styles.areaInput
                }
              />
            </View>

            <Text
              style={
                styles.acreUnit
              }
            >
              acres
            </Text>
          </View>

          {/* ========================================================= */}
          {/* IRRIGATION */}
          {/* ========================================================= */}

          <SectionTitle
            icon={
              <Droplets
                size={18}
                color={GREEN}
              />
            }
            title="Irrigation"
            subtitle="How is this field watered?"
          />

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.dropdown,
              showIrrigation &&
                styles.dropdownActive,
            ]}
            onPress={() =>
              setShowIrrigation(
                previous =>
                  !previous,
              )
            }
          >
            <View
              style={
                styles.dropdownLeft
              }
            >
              <View
                style={
                  styles.dropdownIcon
                }
              >
                <Droplets
                  size={18}
                  color={GREEN}
                />
              </View>

              <Text
                style={[
                  styles.dropdownValue,
                  !irrigation &&
                    styles.placeholder,
                ]}
              >
                {irrigation ||
                  'Select irrigation type'}
              </Text>
            </View>

            <ChevronDown
              size={19}
              color="#64748B"
              style={
                showIrrigation
                  ? {
                      transform: [
                        {
                          rotate:
                            '180deg',
                        },
                      ],
                    }
                  : undefined
              }
            />
          </TouchableOpacity>

          {showIrrigation && (
            <View
              style={
                styles.dropdownOptions
              }
            >
              {IRRIGATION_OPTIONS.map(
                option => {
                  const selected =
                    irrigation ===
                    option;

                  return (
                    <TouchableOpacity
                      key={
                        option
                      }
                      activeOpacity={
                        0.75
                      }
                      style={[
                        styles.option,
                        selected &&
                          styles.optionSelected,
                      ]}
                      onPress={() => {
                        setIrrigation(
                          option,
                        );

                        setShowIrrigation(
                          false,
                        );
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {
                          option
                        }
                      </Text>

                      {selected && (
                        <Check
                          size={18}
                          color={
                            GREEN
                          }
                          strokeWidth={
                            3
                          }
                        />
                      )}
                    </TouchableOpacity>
                  );
                },
              )}
            </View>
          )}

          {/* ========================================================= */}
          {/* FARMING TYPE */}
          {/* ========================================================= */}

          <SectionTitle
            icon={
              <Leaf
                size={18}
                color={GREEN}
              />
            }
            title="Type of farming"
            subtitle="Choose the farming method"
          />

          <View
            style={
              styles.farmingOptions
            }
          >
            {FARMING_OPTIONS.map(
              option => {
                const selected =
                  farmingType ===
                  option;

                return (
                  <TouchableOpacity
                    key={
                      option
                    }
                    activeOpacity={
                      0.8
                    }
                    style={[
                      styles.farmingOption,
                      selected &&
                        styles.farmingOptionSelected,
                    ]}
                    onPress={() =>
                      setFarmingType(
                        option,
                      )
                    }
                  >
                    <View
                      style={[
                        styles.radio,
                        selected &&
                          styles.radioSelected,
                      ]}
                    >
                      {selected && (
                        <View
                          style={
                            styles.radioDot
                          }
                        />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.farmingText,
                        selected &&
                          styles.farmingTextSelected,
                      ]}
                    >
                      {
                        option
                      }
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>

          {/* ========================================================= */}
          {/* BARREN LAND */}
          {/* ========================================================= */}

          <View
            style={
              styles.barrenCard
            }
          >
            <View
              style={
                styles.barrenIcon
              }
            >
              <Leaf
                size={18}
                color="#B7791F"
              />
            </View>

            <View
              style={
                styles.barrenContent
              }
            >
              <Text
                style={
                  styles.barrenTitle
                }
              >
                Is this barren land?
              </Text>

              <Text
                style={
                  styles.barrenSubtitle
                }
              >
                Mark this if there is
                currently no standing crop.
              </Text>
            </View>

            <Switch
              value={
                isBarrenLand
              }
              onValueChange={
                value => {
                  setIsBarrenLand(
                    value,
                  );

                  if (value) {
                    setCropName(
                      '',
                    );

                    setSelectedCrop(
                      null,
                    );
                  }

                  if (
                    sowingDate
                  ) {
                    const selected =
                      parseDateKey(
                        sowingDate,
                      );

                    if (
                      selected
                    ) {
                      const day =
                        startOfDay(
                          selected,
                        );

                      if (
                        (!value &&
                          day >
                            todayDate) ||
                        (value &&
                          day <
                            todayDate)
                      ) {
                        setSowingDate(
                          '',
                        );
                      }
                    }
                  }
                }
              }
              trackColor={{
                false:
                  '#D9E0DB',
                true:
                  '#9AD9B0',
              }}
              thumbColor={
                isBarrenLand
                  ? GREEN
                  : '#FFFFFF'
              }
              ios_backgroundColor="#D9E0DB"
            />
          </View>

          {/* ========================================================= */}
          {/* LOCATION */}
          {/* ========================================================= */}

          {location && (
            <View
              style={
                styles.locationCard
              }
            >
              <MapPin
                size={18}
                color={GREEN}
              />

              <View
                style={
                  styles.locationCardText
                }
              >
                <Text
                  style={
                    styles.locationCardTitle
                  }
                >
                  Field location
                </Text>

                <Text
                  style={
                    styles.locationCardValue
                  }
                >
                  {[
                    location.city,
                    location.district,
                    location.state,
                  ]
                    .filter(Boolean)
                    .join(', ') ||
                    'GPS location captured'}
                </Text>
              </View>
            </View>
          )}

          {/* ========================================================= */}
          {/* SAVE */}
          {/* ========================================================= */}

          <TouchableOpacity
            activeOpacity={
              saving ? 1 : 0.88
            }
            disabled={saving}
            style={[
              styles.saveButton,
              saving &&
                styles.saveButtonDisabled,
            ]}
            onPress={
              handleSaveFarm
            }
          >
            {saving ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Saving your farm...
                </Text>
              </>
            ) : (
              <>
                <Check
                  size={21}
                  color="#FFFFFF"
                  strokeWidth={3}
                />

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Save farm
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text
            style={
              styles.bottomNote
            }
          >
            Your farm boundary and details
            will be securely saved to your
            KhetiMaster account.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ============================================================= */}
      {/* CROP MODAL */}
      {/* ============================================================= */}

      <Modal
        visible={
          cropModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() => {
          setCropModalVisible(
            false,
          );
          setCropSearch('');
        }}
      >
        <View
          style={
            styles.cropModalOverlay
          }
        >
          <TouchableOpacity
            activeOpacity={1}
            style={
              styles.cropModalBackdrop
            }
            onPress={() => {
              setCropModalVisible(
                false,
              );
              setCropSearch('');
            }}
          />

          <View
            style={
              styles.cropSheet
            }
          >
            <View
              style={
                styles.dateHandle
              }
            />

            <View
              style={
                styles.cropHeader
              }
            >
              <View
                style={
                  styles.cropHeaderText
                }
              >
                <Text
                  style={
                    styles.cropEyebrow
                  }
                >
                  CROP CATALOGUE
                </Text>

                <Text
                  style={
                    styles.cropTitle
                  }
                >
                  Select your crop
                </Text>

                <Text
                  style={
                    styles.cropSubtitle
                  }
                >
                  Choose from the CropGen crop
                  catalogue.
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.cropClose
                }
                onPress={() => {
                  setCropModalVisible(
                    false,
                  );
                  setCropSearch('');
                }}
              >
                <X
                  size={19}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.cropSearchBox
              }
            >
              <Search
                size={18}
                color="#849189"
              />

              <TextInput
                value={
                  cropSearch
                }
                onChangeText={
                  setCropSearch
                }
                placeholder="Search crops..."
                placeholderTextColor="#A7B1AB"
                style={
                  styles.cropSearchInput
                }
                autoCapitalize="none"
                autoCorrect={false}
              />

              {cropSearch.length >
                0 && (
                <TouchableOpacity
                  activeOpacity={
                    0.7
                  }
                  onPress={() =>
                    setCropSearch(
                      '',
                    )
                  }
                >
                  <X
                    size={17}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              )}
            </View>

            {cropLoading ? (
              <View
                style={
                  styles.cropLoading
                }
              >
                <ActivityIndicator
                  size="small"
                  color={
                    GREEN
                  }
                />

                <Text
                  style={
                    styles.cropLoadingText
                  }
                >
                  Loading crops...
                </Text>
              </View>
            ) : cropError ? (
              <View
                style={
                  styles.cropEmpty
                }
              >
                <Leaf
                  size={30}
                  color="#C5CEC8"
                />

                <Text
                  style={
                    styles.cropEmptyTitle
                  }
                >
                  Unable to load crops
                </Text>

                <Text
                  style={
                    styles.cropEmptyText
                  }
                >
                  {cropError}
                </Text>

                <TouchableOpacity
                  activeOpacity={
                    0.8
                  }
                  style={
                    styles.retryButton
                  }
                  onPress={() => {
                    fetchCrops();
                  }}
                >
                  <Text
                    style={
                      styles.retryButtonText
                    }
                  >
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : filteredCrops.length ===
              0 ? (
              <View
                style={
                  styles.cropEmpty
                }
              >
                <Search
                  size={30}
                  color="#C5CEC8"
                />

                <Text
                  style={
                    styles.cropEmptyTitle
                  }
                >
                  No crops found
                </Text>

                <Text
                  style={
                    styles.cropEmptyText
                  }
                >
                  Try another crop name.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={
                  styles.cropList
                }
              >
                {filteredCrops.map(
                  crop => {
                    const selected =
                      selectedCrop?._id ===
                      crop._id;

                    return (
                      <TouchableOpacity
                        key={
                          String(
                            crop._id,
                          )
                        }
                        activeOpacity={
                          0.8
                        }
                        style={[
                          styles.cropOption,
                          selected &&
                            styles.cropOptionSelected,
                        ]}
                        onPress={() =>
                          handleSelectCrop(
                            crop,
                          )
                        }
                      >
                        {crop.cropImage ? (
                          <Image
                            source={{
                              uri:
                                crop.cropImage,
                            }}
                            style={
                              styles.cropImage
                            }
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={
                              styles.cropImagePlaceholder
                            }
                          >
                            <Leaf
                              size={
                                22
                              }
                              color={
                                GREEN
                              }
                            />
                          </View>
                        )}

                        <View
                          style={
                            styles.cropOptionContent
                          }
                        >
                          <Text
                            style={[
                              styles.cropOptionName,
                              selected &&
                                styles.cropOptionNameSelected,
                            ]}
                          >
                            {
                              crop.cropName
                            }
                          </Text>

                          <Text
                            style={
                              styles.cropOptionSubtext
                            }
                          >
                            CropGen crop
                            catalogue
                          </Text>
                        </View>

                        {selected && (
                          <View
                            style={
                              styles.cropCheck
                            }
                          >
                            <Check
                              size={
                                17
                              }
                              color="#FFFFFF"
                              strokeWidth={
                                3
                              }
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  },
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ============================================================= */}
      {/* DATE MODAL */}
      {/* ============================================================= */}

      <Modal
        visible={
          datePickerVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setDatePickerVisible(
            false,
          )
        }
      >
        <View
          style={
            styles.dateModalOverlay
          }
        >
          <TouchableOpacity
            activeOpacity={1}
            style={
              styles.dateModalBackdrop
            }
            onPress={() =>
              setDatePickerVisible(
                false,
              )
            }
          />

          <View
            style={
              styles.dateSheet
            }
          >
            <View
              style={
                styles.dateHandle
              }
            />

            <View
              style={
                styles.dateHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.dateEyebrow
                  }
                >
                  {isBarrenLand
                    ? 'EXPECTED SOWING'
                    : 'SOWING DATE'}
                </Text>

                <Text
                  style={
                    styles.dateTitle
                  }
                >
                  Select a date
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.dateClose
                }
                onPress={() =>
                  setDatePickerVisible(
                    false,
                  )
                }
              >
                <X
                  size={19}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.selectedDateCard
              }
            >
              <View
                style={
                  styles.selectedDateIcon
                }
              >
                <CalendarDays
                  size={21}
                  color={GREEN}
                />
              </View>

              <View
                style={
                  styles.selectedDateContent
                }
              >
                <Text
                  style={
                    styles.selectedDateLabel
                  }
                >
                  SELECTED DATE
                </Text>

                <Text
                  style={
                    styles.selectedDateValue
                  }
                >
                  {sowingDate
                    ? formatDisplayDate(
                        sowingDate,
                      )
                    : 'No date selected'}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.calendarNavigation
              }
            >
              <TouchableOpacity
                activeOpacity={0.75}
                style={
                  styles.monthArrow
                }
                onPress={
                  goPreviousMonth
                }
              >
                <ChevronLeft
                  size={20}
                  color={
                    isBarrenLand &&
                    calendarMonth.getFullYear() ===
                      todayDate.getFullYear() &&
                    calendarMonth.getMonth() ===
                      todayDate.getMonth()
                      ? '#CBD5D0'
                      : DARK
                  }
                />
              </TouchableOpacity>

              <Text
                style={
                  styles.monthTitle
                }
              >
                {formatMonthYear(
                  calendarMonth,
                )}
              </Text>

              <TouchableOpacity
                activeOpacity={0.75}
                style={
                  styles.monthArrow
                }
                onPress={
                  goNextMonth
                }
              >
                <ChevronRight
                  size={20}
                  color={
                    !isBarrenLand &&
                    calendarMonth.getFullYear() ===
                      todayDate.getFullYear() &&
                    calendarMonth.getMonth() ===
                      todayDate.getMonth()
                      ? '#CBD5D0'
                      : DARK
                  }
                />
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.weekRow
              }
            >
              {[
                'Sun',
                'Mon',
                'Tue',
                'Wed',
                'Thu',
                'Fri',
                'Sat',
              ].map(day => (
                <Text
                  key={day}
                  style={
                    styles.weekDay
                  }
                >
                  {day}
                </Text>
              ))}
            </View>

            <View
              style={
                styles.calendarGrid
              }
            >
              {calendarDays.map(
                cell => {
                  if (
                    cell.empty
                  ) {
                    return (
                      <View
                        key={
                          cell.key
                        }
                        style={
                          styles.calendarCell
                        }
                      />
                    );
                  }

                  const value =
                    makeDateKey(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth(),
                      cell.day,
                    );

                  const selected =
                    value ===
                    sowingDate;

                  const today =
                    value ===
                    todayKey;

                  const disabled =
                    isDateDisabled(
                      cell.day,
                    );

                  return (
                    <TouchableOpacity
                      key={
                        cell.key
                      }
                      activeOpacity={
                        disabled
                          ? 1
                          : 0.7
                      }
                      disabled={
                        disabled
                      }
                      style={
                        styles.calendarCell
                      }
                      onPress={() =>
                        selectDate(
                          cell.day,
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          selected &&
                            styles.calendarDaySelected,
                          disabled &&
                            styles.calendarDayDisabled,
                          today &&
                            !selected &&
                            styles.calendarDayToday,
                        ]}
                      >
                        {
                          cell.day
                        }
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>

            <View
              style={
                styles.dateFooter
              }
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.todayButton
                }
                onPress={
                  selectToday
                }
              >
                <CalendarDays
                  size={17}
                  color={GREEN}
                />

                <Text
                  style={
                    styles.todayButtonText
                  }
                >
                  Today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={
                  styles.doneButton
                }
                onPress={() =>
                  setDatePickerVisible(
                    false,
                  )
                }
              >
                <Check
                  size={18}
                  color="#FFFFFF"
                  strokeWidth={3}
                />

                <Text
                  style={
                    styles.doneButtonText
                  }
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={
                styles.dateHint
              }
            >
              {isBarrenLand
                ? 'Expected sowing date can be today or a future date.'
                : 'Sowing date can be today or an earlier date.'}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/*
|--------------------------------------------------------------------------
| SECTION TITLE
|--------------------------------------------------------------------------
*/

function SectionTitle({
  icon,
  title,
  subtitle,
}) {
  return (
    <View
      style={
        styles.sectionTitle
      }
    >
      <View
        style={
          styles.sectionIcon
        }
      >
        {icon}
      </View>

      <View
        style={
          styles.sectionTitleText
        }
      >
        <Text
          style={
            styles.sectionHeading
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.sectionSubtitle
          }
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| INPUT FIELD
|--------------------------------------------------------------------------
*/

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
}) {
  return (
    <View
      style={
        styles.inputGroup
      }
    >
      <Text
        style={
          styles.inputLabel
        }
      >
        {label}
      </Text>

      <View
        style={
          styles.inputWrapper
        }
      >
        <View
          style={
            styles.inputIcon
          }
        >
          {icon}
        </View>

        <TextInput
          value={value}
          onChangeText={
            onChangeText
          }
          placeholder={
            placeholder
          }
          placeholderTextColor="#A7B1AB"
          style={
            styles.textInput
          }
          autoCapitalize="sentences"
        />
      </View>
    </View>
  );
}

/*
|--------------------------------------------------------------------------
| MEASUREMENT
|--------------------------------------------------------------------------
*/

function Measurement({
  icon,
  label,
  value,
}) {
  return (
    <View
      style={
        styles.measurement
      }
    >
      <View
        style={
          styles.measurementIcon
        }
      >
        {icon}
      </View>

      <View>
        <Text
          style={
            styles.measurementLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.measurementValue
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
| STYLES
|--------------------------------------------------------------------------
*/

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },

    safeArea: {
      flex: 1,
      backgroundColor:
        BACKGROUND,
    },

    header: {
      minHeight: 72,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        BACKGROUND,
    },

    backButton: {
      width: 45,
      height: 45,
      borderRadius: 15,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#EDF1EE',
    },

    headerContent: {
      flex: 1,
      marginLeft: 13,
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: DARK,
    },

    headerSubtitle: {
      marginTop: 3,
      fontSize: 11,
      fontWeight: '600',
      color: MUTED,
    },

    stepBadge: {
      height: 36,
      paddingHorizontal: 12,
      borderRadius: 18,
      backgroundColor: '#E8F8EE',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    stepNumber: {
      fontSize: 13,
      fontWeight: '900',
      color: GREEN,
    },

    stepTotal: {
      fontSize: 11,
      fontWeight: '700',
      color: '#7A9182',
    },

    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 35,
    },

    boundaryCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 22,
      padding: 15,
      borderWidth: 1,
      borderColor: '#E8EEE9',
      shadowColor: '#000',
      shadowOpacity: 0.035,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },

    boundaryTop: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    boundaryIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: '#EAF8EF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    boundaryInfo: {
      flex: 1,
      marginLeft: 11,
    },

    boundaryTitle: {
      fontSize: 13,
      fontWeight: '900',
      color: DARK,
    },

    locationRow: {
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },

    locationText: {
      flex: 1,
      marginLeft: 4,
      fontSize: 10.5,
      fontWeight: '600',
      color: '#7A8981',
    },

    changeButton: {
      paddingHorizontal: 12,
      height: 34,
      borderRadius: 17,
      backgroundColor: '#F2F6F3',
      alignItems: 'center',
      justifyContent: 'center',
    },

    changeText: {
      fontSize: 11,
      fontWeight: '900',
      color: GREEN,
    },

    measurements: {
      marginTop: 14,
      paddingTop: 13,
      borderTopWidth: 1,
      borderTopColor: '#EEF2EF',
      flexDirection: 'row',
    },

    measurement: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },

    measurementIcon: {
      width: 31,
      height: 31,
      borderRadius: 10,
      backgroundColor: '#EFFAF3',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 7,
    },

    measurementLabel: {
      fontSize: 8.5,
      color: '#9AA69F',
      fontWeight: '800',
      textTransform: 'uppercase',
    },

    measurementValue: {
      marginTop: 2,
      fontSize: 11,
      color: DARK,
      fontWeight: '900',
    },

    sectionTitle: {
      marginTop: 25,
      marginBottom: 13,
      flexDirection: 'row',
      alignItems: 'center',
    },

    sectionIcon: {
      width: 37,
      height: 37,
      borderRadius: 12,
      backgroundColor: '#EAF8EF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    sectionTitleText: {
      marginLeft: 10,
      flex: 1,
    },

    sectionHeading: {
      fontSize: 15,
      fontWeight: '900',
      color: DARK,
    },

    sectionSubtitle: {
      marginTop: 2,
      fontSize: 10.5,
      color: MUTED,
      fontWeight: '600',
    },

    inputGroup: {
      marginBottom: 13,
    },

    inputLabel: {
      marginBottom: 7,
      fontSize: 11,
      fontWeight: '800',
      color: '#46544C',
    },

    inputWrapper: {
      minHeight: 57,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 11,
    },

    inputIcon: {
      width: 35,
      height: 35,
      borderRadius: 11,
      backgroundColor: '#F2F6F3',
      alignItems: 'center',
      justifyContent: 'center',
    },

    textInput: {
      flex: 1,
      minHeight: 55,
      paddingHorizontal: 11,
      paddingVertical: 0,
      fontSize: 13,
      fontWeight: '600',
      color: DARK,
    },

    /*
    |--------------------------------------------------------------------------
    | CROP SELECTOR
    |--------------------------------------------------------------------------
    */

    cropSelector: {
      minHeight: 65,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 11,
      flexDirection: 'row',
      alignItems: 'center',
    },

    cropSelectorActive: {
      borderColor: '#A6DDB8',
    },

    selectedCropImage: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: '#EFFAF3',
    },

    cropSelectorContent: {
      flex: 1,
      marginLeft: 10,
      marginRight: 8,
    },

    cropSelectorValue: {
      fontSize: 13,
      fontWeight: '900',
      color: DARK,
      textTransform: 'capitalize',
    },

    cropSelectorPlaceholder: {
      color: '#9AA69F',
      fontWeight: '600',
    },

    cropSelectorHint: {
      marginTop: 3,
      fontSize: 9.5,
      color: '#94A3B8',
      fontWeight: '600',
    },

    cropAvailableText: {
      marginTop: 5,
      marginLeft: 3,
      fontSize: 9.5,
      color: '#8A9890',
      fontWeight: '600',
    },

    cropErrorRow: {
      marginTop: 6,
      paddingHorizontal: 3,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    cropErrorText: {
      flex: 1,
      fontSize: 9.5,
      color: '#C73535',
      fontWeight: '600',
    },

    cropRetryText: {
      marginLeft: 10,
      fontSize: 10,
      color: GREEN,
      fontWeight: '900',
    },

    /*
    |--------------------------------------------------------------------------
    | DATE FIELD
    |--------------------------------------------------------------------------
    */

    dateField: {
      minHeight: 65,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 11,
      flexDirection: 'row',
      alignItems: 'center',
    },

    dateTextWrap: {
      flex: 1,
      marginLeft: 10,
    },

    dateValue: {
      fontSize: 13,
      fontWeight: '900',
      color: DARK,
    },

    datePlaceholder: {
      color: '#9AA69F',
      fontWeight: '600',
    },

    dateRaw: {
      marginTop: 3,
      fontSize: 9.5,
      fontWeight: '600',
      color: '#94A3B8',
    },

    calendarButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: '#EAF8EF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    /*
    |--------------------------------------------------------------------------
    | AREA
    |--------------------------------------------------------------------------
    */

    areaInputWrapper: {
      minHeight: 70,
      borderRadius: 18,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: BORDER,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },

    areaIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: '#EAF8EF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    areaTextWrap: {
      flex: 1,
      marginLeft: 11,
    },

    areaInputLabel: {
      fontSize: 9.5,
      fontWeight: '700',
      color: '#8B9891',
    },

    areaInput: {
      marginTop: 1,
      padding: 0,
      fontSize: 16,
      fontWeight: '900',
      color: DARK,
    },

    acreUnit: {
      fontSize: 12,
      fontWeight: '900',
      color: '#65736B',
      marginRight: 5,
    },

    /*
    |--------------------------------------------------------------------------
    | DROPDOWN
    |--------------------------------------------------------------------------
    */

    dropdown: {
      minHeight: 58,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 11,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    dropdownActive: {
      borderColor: '#A6DDB8',
    },

    dropdownLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    dropdownIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: '#EFFAF3',
      alignItems: 'center',
      justifyContent: 'center',
    },

    dropdownValue: {
      marginLeft: 10,
      fontSize: 13,
      fontWeight: '800',
      color: DARK,
    },

    placeholder: {
      color: '#9AA69F',
      fontWeight: '600',
    },

    dropdownOptions: {
      marginTop: 7,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: BORDER,
      overflow: 'hidden',
    },

    option: {
      minHeight: 48,
      paddingHorizontal: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: '#F0F3F1',
    },

    optionSelected: {
      backgroundColor: '#EFFAF3',
    },

    optionText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: '#4C5A52',
    },

    optionTextSelected: {
      color: GREEN,
      fontWeight: '900',
    },

    /*
    |--------------------------------------------------------------------------
    | FARMING
    |--------------------------------------------------------------------------
    */

    farmingOptions: {
      flexDirection: 'row',
    },

    farmingOption: {
      flex: 1,
      minHeight: 67,
      marginRight: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    farmingOptionSelected: {
      borderColor: '#9BD8AE',
      backgroundColor: '#EFFAF3',
    },

    radio: {
      width: 19,
      height: 19,
      borderRadius: 10,
      borderWidth: 1.7,
      borderColor: '#B8C2BC',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },

    radioSelected: {
      borderColor: GREEN,
    },

    radioDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: GREEN,
    },

    farmingText: {
      fontSize: 10.5,
      fontWeight: '700',
      color: '#647169',
    },

    farmingTextSelected: {
      color: GREEN,
      fontWeight: '900',
    },

    /*
    |--------------------------------------------------------------------------
    | BARREN
    |--------------------------------------------------------------------------
    */

    barrenCard: {
      marginTop: 18,
      minHeight: 76,
      borderRadius: 18,
      backgroundColor: '#FFF9EC',
      borderWidth: 1,
      borderColor: '#F3E7C7',
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },

    barrenIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: '#FFF0C9',
      alignItems: 'center',
      justifyContent: 'center',
    },

    barrenContent: {
      flex: 1,
      marginLeft: 10,
      marginRight: 8,
    },

    barrenTitle: {
      fontSize: 12,
      fontWeight: '900',
      color: DARK,
    },

    barrenSubtitle: {
      marginTop: 3,
      fontSize: 9.5,
      lineHeight: 14,
      color: '#89775A',
      fontWeight: '600',
    },

    /*
    |--------------------------------------------------------------------------
    | LOCATION
    |--------------------------------------------------------------------------
    */

    locationCard: {
      marginTop: 15,
      minHeight: 62,
      paddingHorizontal: 13,
      borderRadius: 16,
      backgroundColor: '#F0F8F3',
      flexDirection: 'row',
      alignItems: 'center',
    },

    locationCardText: {
      marginLeft: 10,
      flex: 1,
    },

    locationCardTitle: {
      fontSize: 10,
      color: '#7A8981',
      fontWeight: '700',
    },

    locationCardValue: {
      marginTop: 3,
      fontSize: 11,
      color: DARK,
      fontWeight: '800',
    },

    /*
    |--------------------------------------------------------------------------
    | SAVE
    |--------------------------------------------------------------------------
    */

    saveButton: {
      marginTop: 24,
      height: 58,
      borderRadius: 18,
      backgroundColor: GREEN,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      shadowColor: GREEN,
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      elevation: 4,
    },

    saveButtonDisabled: {
      backgroundColor: '#8BBF9D',
      shadowOpacity: 0,
      elevation: 0,
    },

    saveButtonText: {
      marginLeft: 9,
      fontSize: 15,
      fontWeight: '900',
      color: '#FFFFFF',
    },

    bottomNote: {
      marginTop: 10,
      paddingHorizontal: 15,
      textAlign: 'center',
      fontSize: 9.5,
      lineHeight: 14,
      color: '#9AA69F',
      fontWeight: '600',
    },

    /*
    |--------------------------------------------------------------------------
    | CROP MODAL
    |--------------------------------------------------------------------------
    */

    cropModalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },

    cropModalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        'rgba(15,23,42,.38)',
    },

    cropSheet: {
      height: '82%',
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom:
        Platform.OS === 'ios'
          ? 28
          : 20,
    },

    cropHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },

    cropHeaderText: {
      flex: 1,
    },

    cropEyebrow: {
      fontSize: 9.5,
      color: '#94A3B8',
      fontWeight: '900',
      letterSpacing: 1.3,
    },

    cropTitle: {
      marginTop: 4,
      fontSize: 23,
      color: DARK,
      fontWeight: '900',
    },

    cropSubtitle: {
      marginTop: 4,
      fontSize: 10.5,
      color: MUTED,
      fontWeight: '600',
    },

    cropClose: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: '#F3F6F4',
      alignItems: 'center',
      justifyContent: 'center',
    },

    cropSearchBox: {
      marginTop: 16,
      minHeight: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: '#F8FAF9',
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
    },

    cropSearchInput: {
      flex: 1,
      marginLeft: 9,
      padding: 0,
      minHeight: 50,
      fontSize: 13,
      fontWeight: '600',
      color: DARK,
    },

    cropList: {
      paddingTop: 12,
      paddingBottom: 25,
    },

    cropOption: {
      minHeight: 68,
      marginBottom: 8,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: '#E8EEE9',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },

    cropOptionSelected: {
      borderColor: '#9BD8AE',
      backgroundColor: '#EFFAF3',
    },

    cropImage: {
      width: 50,
      height: 50,
      borderRadius: 14,
      backgroundColor: '#EFFAF3',
    },

    cropImagePlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 14,
      backgroundColor: '#EFFAF3',
      alignItems: 'center',
      justifyContent: 'center',
    },

    cropOptionContent: {
      flex: 1,
      marginLeft: 11,
    },

    cropOptionName: {
      fontSize: 13,
      fontWeight: '900',
      color: DARK,
      textTransform: 'capitalize',
    },

    cropOptionNameSelected: {
      color: GREEN,
    },

    cropOptionSubtext: {
      marginTop: 3,
      fontSize: 9.5,
      color: '#94A3B8',
      fontWeight: '600',
    },

    cropCheck: {
      width: 28,
      height: 28,
      borderRadius: 10,
      backgroundColor: GREEN,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cropLoading: {
      minHeight: 180,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 10,
    },

    cropLoadingText: {
      fontSize: 12,
      color: MUTED,
      fontWeight: '600',
    },

    cropEmpty: {
      minHeight: 220,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
    },

    cropEmptyTitle: {
      marginTop: 12,
      fontSize: 15,
      fontWeight: '900',
      color: DARK,
    },

    cropEmptyText: {
      marginTop: 5,
      textAlign: 'center',
      fontSize: 11,
      lineHeight: 17,
      color: MUTED,
    },

    retryButton: {
      marginTop: 15,
      height: 42,
      paddingHorizontal: 20,
      borderRadius: 14,
      backgroundColor: '#EAF8EF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    retryButtonText: {
      fontSize: 11,
      color: GREEN,
      fontWeight: '900',
    },

    /*
    |--------------------------------------------------------------------------
    | DATE MODAL
    |--------------------------------------------------------------------------
    */

    dateModalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },

    dateModalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        'rgba(15,23,42,.38)',
    },

    dateSheet: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom:
        Platform.OS === 'ios'
          ? 28
          : 20,
    },

    dateHandle: {
      alignSelf: 'center',
      width: 48,
      height: 5,
      borderRadius: 10,
      backgroundColor: '#E2E8F0',
      marginBottom: 20,
    },

    dateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    dateEyebrow: {
      fontSize: 9.5,
      color: '#94A3B8',
      fontWeight: '900',
      letterSpacing: 1.3,
    },

    dateTitle: {
      marginTop: 4,
      fontSize: 23,
      color: DARK,
      fontWeight: '900',
    },

    dateClose: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: '#F3F6F4',
      alignItems: 'center',
      justifyContent: 'center',
    },

    selectedDateCard: {
      marginTop: 18,
      minHeight: 68,
      borderRadius: 18,
      backgroundColor: '#EFFAF3',
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },

    selectedDateIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: '#DDF7E7',
      alignItems: 'center',
      justifyContent: 'center',
    },

    selectedDateContent: {
      marginLeft: 11,
      flex: 1,
    },

    selectedDateLabel: {
      fontSize: 8.5,
      color: '#789184',
      fontWeight: '900',
      letterSpacing: 1,
    },

    selectedDateValue: {
      marginTop: 3,
      fontSize: 14,
      color: DARK,
      fontWeight: '900',
    },

    calendarNavigation: {
      marginTop: 18,
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    monthArrow: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: '#F3F6F4',
      alignItems: 'center',
      justifyContent: 'center',
    },

    monthTitle: {
      fontSize: 15,
      fontWeight: '900',
      color: DARK,
    },

    weekRow: {
      marginTop: 9,
      flexDirection: 'row',
    },

    weekDay: {
      flex: 1,
      textAlign: 'center',
      fontSize: 10,
      color: '#94A3B8',
      fontWeight: '800',
    },

    calendarGrid: {
      marginTop: 7,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    calendarCell: {
      width: '14.2857%',
      height: 43,
      alignItems: 'center',
      justifyContent: 'center',
    },

    calendarDayText: {
      width: 36,
      height: 36,
      borderRadius: 12,
      textAlign: 'center',
      textAlignVertical: 'center',
      fontSize: 12.5,
      fontWeight: '700',
      color: '#425148',
      overflow: 'hidden',
      paddingTop:
        Platform.OS === 'ios'
          ? 9
          : 0,
    },

    calendarDaySelected: {
      backgroundColor: GREEN,
      color: '#FFFFFF',
      fontWeight: '900',
    },

    calendarDayDisabled: {
      color: '#CBD5D0',
    },

    calendarDayToday: {
      backgroundColor: '#E8F8EE',
      color: GREEN,
      fontWeight: '900',
    },

    dateFooter: {
      marginTop: 12,
      flexDirection: 'row',
      gap: 10,
    },

    todayButton: {
      flex: 1,
      height: 52,
      borderRadius: 15,
      backgroundColor: '#F1F6F3',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 7,
    },

    todayButtonText: {
      fontSize: 13,
      color: GREEN,
      fontWeight: '900',
    },

    doneButton: {
      flex: 1,
      height: 52,
      borderRadius: 15,
      backgroundColor: GREEN,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 7,
    },

    doneButtonText: {
      fontSize: 13,
      color: '#FFFFFF',
      fontWeight: '900',
    },

    dateHint: {
      marginTop: 10,
      textAlign: 'center',
      fontSize: 9.5,
      lineHeight: 14,
      color: '#94A3B8',
      fontWeight: '600',
    },
  });