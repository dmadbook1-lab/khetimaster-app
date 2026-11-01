import { Linking, Platform } from 'react-native';
import { version } from '../../package.json';

export const APP_VERSION = version;

export const ANDROID_PACKAGE = 'com.khetimaster';

/*
 * Fill these in when they exist. Menu items that need one stay hidden while
 * it is empty, so the app never shows a link that goes nowhere.
 */
export const IOS_APP_STORE_ID = '';
export const SUPPORT_EMAIL = '';
export const SUPPORT_PHONE = '';
export const TERMS_URL = '';

export const canRateApp =
  Platform.OS === 'android' || Boolean(IOS_APP_STORE_ID);

export const openStoreListing = async () => {
  if (Platform.OS === 'android') {
    try {
      await Linking.openURL(`market://details?id=${ANDROID_PACKAGE}`);
    } catch {
      await Linking.openURL(
        `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`,
      );
    }
    return;
  }

  if (IOS_APP_STORE_ID) {
    await Linking.openURL(
      `itms-apps://apps.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`,
    );
  }
};

export const emailSupport = () =>
  SUPPORT_EMAIL
    ? Linking.openURL(
        `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
          `KhetiMaster help (v${APP_VERSION})`,
        )}`,
      )
    : null;

export const callSupport = () =>
  SUPPORT_PHONE ? Linking.openURL(`tel:${SUPPORT_PHONE}`) : null;

export const openTerms = () => (TERMS_URL ? Linking.openURL(TERMS_URL) : null);
