import Geolocation from '@react-native-community/geolocation';

import requestLocationPermission from './locationPermission';

const getCurrentCoordinates = async () => {
  try {
    // ------------------------------------------
    // STEP 1
    // Permission
    // ------------------------------------------

    const hasPermission =
      await requestLocationPermission();

    if (!hasPermission) {
      console.log(
        '[Location] Permission not available',
      );

      return null;
    }

    console.log(
      '[Location] Permission available',
    );

    // ------------------------------------------
    // STEP 2
    // Get coordinates
    // ------------------------------------------

    return await new Promise(resolve => {
      let resolved = false;

      const finish = value => {
        if (resolved) {
          return;
        }

        resolved = true;
        resolve(value);
      };

      Geolocation.getCurrentPosition(
        position => {
          try {
            const latitude =
              position?.coords?.latitude;

            const longitude =
              position?.coords?.longitude;

            const accuracy =
              position?.coords?.accuracy;

            // ------------------------------------
            // Validate
            // ------------------------------------

            if (
              typeof latitude !== 'number' ||
              typeof longitude !== 'number'
            ) {
              console.log(
                '[Location] Invalid coordinates',
              );

              finish(null);
              return;
            }

            console.log(
              '[Location] Latitude:',
              latitude,
            );

            console.log(
              '[Location] Longitude:',
              longitude,
            );

            console.log(
              '[Location] Accuracy:',
              accuracy,
            );

            finish({
              latitude,
              longitude,
              accuracy:
                typeof accuracy === 'number'
                  ? accuracy
                  : null,
            });
          } catch (error) {
            console.log(
              '[Location] Position processing error:',
              error,
            );

            finish(null);
          }
        },

        error => {
          /*
           * Never throw here.
           *
           * GPS disabled,
           * timeout,
           * unavailable location,
           * permission problems, etc.
           *
           * should simply return null.
           */

          console.log(
            '[Location] GPS error:',
            error,
          );

          finish(null);
        },

        {
          enableHighAccuracy: false,

          timeout: 15000,

          maximumAge: 60000,
        },
      );
    });
  } catch (error) {
    console.log(
      '[Location] Coordinate error:',
      error,
    );

    return null;
  }
};

export default getCurrentCoordinates;