const getAddressFromCoordinates = async (
  latitude,
  longitude,
) => {
  try {
    // ------------------------------------------
    // Validate
    // ------------------------------------------

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number'
    ) {
      console.log(
        '[Location] Invalid coordinates for geocoding',
      );

      return null;
    }

    // ------------------------------------------
    // Nominatim URL
    // ------------------------------------------

    const url =
      'https://nominatim.openstreetmap.org/reverse' +
      '?format=json' +
      `&lat=${encodeURIComponent(latitude)}` +
      `&lon=${encodeURIComponent(longitude)}` +
      '&zoom=10' +
      '&addressdetails=1';

    console.log(
      '[Location] Reverse geocoding...',
    );

    // ------------------------------------------
    // Request
    // ------------------------------------------

    const response = await fetch(url, {
      method: 'GET',

      headers: {
        Accept: 'application/json',

        'User-Agent':
          'KhetiMaster/1.0',
      },
    });

    // ------------------------------------------
    // HTTP error
    // ------------------------------------------

    if (!response.ok) {
      console.log(
        '[Location] Reverse geocoding HTTP error:',
        response.status,
      );

      return null;
    }

    // ------------------------------------------
    // JSON
    // ------------------------------------------

    const data =
      await response.json();

    const address =
      data?.address;

    if (!address) {
      console.log(
        '[Location] Address not found',
      );

      return null;
    }

    // ------------------------------------------
    // City
    // ------------------------------------------

    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      '';

    // ------------------------------------------
    // District
    // ------------------------------------------

    const district =
      address.state_district ||
      address.district ||
      address.county ||
      '';

    // ------------------------------------------
    // State
    // ------------------------------------------

    const state =
      address.state || '';

    console.log(
      '[Location] City:',
      city,
    );

    console.log(
      '[Location] District:',
      district,
    );

    console.log(
      '[Location] State:',
      state,
    );

    // ------------------------------------------
    // Return
    // ------------------------------------------

    return {
      city,
      district,
      state,

      latitude,
      longitude,
    };
  } catch (error) {
    console.log(
      '[Location] Reverse geocoding error:',
      error,
    );

    return null;
  }
};

export default getAddressFromCoordinates;