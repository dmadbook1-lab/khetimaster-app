import * as Keychain from 'react-native-keychain';

const ACCESS_TOKEN_KEY = 'khetimaster_access_token';
const REFRESH_TOKEN_KEY = 'khetimaster_refresh_token';

// SAVE TOKENS

export const saveTokens = async ({
  accessToken,
  refreshToken,
}) => {
  await Keychain.setGenericPassword(
    ACCESS_TOKEN_KEY,
    accessToken,
    {
      service: ACCESS_TOKEN_KEY,
    },
  );

  await Keychain.setGenericPassword(
    REFRESH_TOKEN_KEY,
    refreshToken,
    {
      service: REFRESH_TOKEN_KEY,
    },
  );
};

// ACCESS TOKEN
export const getAccessToken = async () => {
  const credentials =
    await Keychain.getGenericPassword({
      service: ACCESS_TOKEN_KEY,
    });

  if (!credentials) {
    return null;
  }

  return credentials.password;
};

// REFRESH TOKEN

export const getRefreshToken = async () => {
  const credentials =
    await Keychain.getGenericPassword({
      service: REFRESH_TOKEN_KEY,
    });

  if (!credentials) {
    return null;
  }

  return credentials.password;
};


// CLEAR TOKENS

export const clearTokens = async () => {
  await Keychain.resetGenericPassword({
    service: ACCESS_TOKEN_KEY,
  });

  await Keychain.resetGenericPassword({
    service: REFRESH_TOKEN_KEY,
  });
};