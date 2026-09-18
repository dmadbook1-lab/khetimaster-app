import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import getCurrentCoordinates from '../utils/getCurrentCoordinates';

import getAddressFromCoordinates from '../utils/getAddressFromCoordinates';

const LocationContext =
  createContext(null);

export const LocationProvider = ({
  children,
}) => {
  const [location, setLocation] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  // ==========================================
  // FETCH LOCATION
  // ==========================================

  const fetchLocation =
    useCallback(async () => {
      try {
        setLoading(true);

        setError(null);

        console.log(
          '====================================',
        );

        console.log(
          '[Location] Starting location flow',
        );

        console.log(
          '====================================',
        );

        // --------------------------------------
        // 1. Coordinates
        // --------------------------------------

        const coordinates =
          await getCurrentCoordinates();

        if (!coordinates) {
          console.log(
            '[Location] Could not get coordinates',
          );

          setLocation(null);

          setError(
            'Unable to determine location',
          );

          return null;
        }

        console.log(
          '[Location] Coordinates received:',
          coordinates,
        );

        // --------------------------------------
        // 2. Reverse geocoding
        // --------------------------------------

        const address =
          await getAddressFromCoordinates(
            coordinates.latitude,
            coordinates.longitude,
          );

        // --------------------------------------
        // Reverse geocoding failed
        // --------------------------------------

        if (!address) {
          console.log(
            '[Location] Reverse geocoding failed',
          );

          /*
           * Keep coordinates even when
           * address lookup fails.
           */

          const fallback = {
            latitude:
              coordinates.latitude,

            longitude:
              coordinates.longitude,

            accuracy:
              coordinates.accuracy,

            city: '',

            district: '',

            state: '',
          };

          setLocation(fallback);

          setError(
            'Address could not be determined',
          );

          return fallback;
        }

        // --------------------------------------
        // 3. Final location
        // --------------------------------------

        const finalLocation = {
          latitude:
            coordinates.latitude,

          longitude:
            coordinates.longitude,

          accuracy:
            coordinates.accuracy,

          city:
            address.city || '',

          district:
            address.district || '',

          state:
            address.state || '',
        };

        console.log(
          '[Location] Final location:',
          finalLocation,
        );

        // --------------------------------------
        // 4. Save
        // --------------------------------------

        setLocation(
          finalLocation,
        );

        setError(null);

        return finalLocation;
      } catch (error) {
        console.log(
          '[Location] Location flow error:',
          error,
        );

        setLocation(null);

        setError(
          error?.message ||
            'Unable to determine location',
        );

        return null;
      } finally {
        setLoading(false);

        console.log(
          '[Location] Location flow finished',
        );
      }
    }, []);

  // ==========================================
  // INITIAL LOCATION
  // ==========================================

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // ==========================================
  // PROVIDER
  // ==========================================

  return (
    <LocationContext.Provider
      value={{
        location,

        loading,

        error,

        refreshLocation:
          fetchLocation,
      }}>

      {children}

    </LocationContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const useLocation = () => {
  const context =
    useContext(LocationContext);

  if (!context) {
    throw new Error(
      'useLocation must be used inside LocationProvider',
    );
  }

  return context;
};