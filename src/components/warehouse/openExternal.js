import { Alert, Linking } from 'react-native';
import i18n from 'i18next';

export const openExternal = url =>
  Linking.openURL(url).catch(() =>
    Alert.alert(i18n.t('openExternal.couldNotOpen'), i18n.t('openExternal.noAppOnThisPhone')),
  );
