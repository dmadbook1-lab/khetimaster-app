import {useCallback, useState} from 'react';
import {Alert, Linking} from 'react-native';
import i18n from 'i18next';
import {useFocusEffect} from '@react-navigation/native';
import {loadGovProfile, loadApplications} from './govStorage';
import {useSchemes} from './schemeStore';
import {checkAllSchemes, isProfileEmpty} from './schemeEligibility';

// Reloads the saved eligibility profile and tracked applications every time
// the screen gains focus, so results stay fresh after edits elsewhere.
export const useGovData = () => {
  useSchemes(); // keeps the scheme list fresh and re-renders on update
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [p, apps] = await Promise.all([
          loadGovProfile(),
          loadApplications(),
        ]);
        if (!active) {
          return;
        }
        setProfile(p);
        setApplications(apps);
        setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const hasProfile = !!profile && !isProfileEmpty(profile);
  const results = hasProfile ? checkAllSchemes(profile) : [];
  const statusOf = id => results.find(r => r.scheme.id === id)?.status;

  return {profile, applications, loading, hasProfile, results, statusOf};
};

export const openOfficialSite = async url => {
  try {
    await Linking.openURL(url);
  } catch (e) {
    Alert.alert(i18n.t('govUi.couldNotOpen'), i18n.t('govUi.visitInBrowser', {url}));
  }
};
