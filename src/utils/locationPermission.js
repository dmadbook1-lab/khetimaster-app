import {
  PermissionsAndroid,
  Platform,
} from 'react-native';

const requestLocationPermission = async () => {
  try {
    // ------------------------------------------
    // iOS
    // ------------------------------------------

    if (Platform.OS !== 'android') {
      return true;
    }

    // ------------------------------------------
    // Check existing permissions
    // ------------------------------------------

    const finePermission =
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;

    const coarsePermission =
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;

    const fineGranted =
      await PermissionsAndroid.check(
        finePermission,
      );

    const coarseGranted =
      await PermissionsAndroid.check(
        coarsePermission,
      );

    if (fineGranted || coarseGranted) {
      console.log(
        '[Location] Permission already granted',
      );

      return true;
    }

    // ------------------------------------------
    // Request both
    // ------------------------------------------

    const result =
      await PermissionsAndroid.requestMultiple([
        finePermission,
        coarsePermission,
      ]);

    console.log(
      '[Location] Permission result:',
      result,
    );

    const fineResult =
      result[finePermission];

    const coarseResult =
      result[coarsePermission];

    const hasFine =
      fineResult ===
      PermissionsAndroid.RESULTS.GRANTED;

    const hasCoarse =
      coarseResult ===
      PermissionsAndroid.RESULTS.GRANTED;

    /*
     * Accept either:
     *
     * FINE
     * or
     * COARSE
     *
     * This allows the application to work
     * when Android provides approximate location.
     */

    if (hasFine || hasCoarse) {
      console.log(
        '[Location] Location permission granted',
      );

      return true;
    }

    console.log(
      '[Location] Location permission denied',
    );

    return false;
  } catch (error) {
    console.log(
      '[Location] Permission error:',
      error,
    );

    return false;
  }
};

export default requestLocationPermission;