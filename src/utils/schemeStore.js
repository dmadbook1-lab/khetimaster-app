import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import {useTranslation} from 'react-i18next';
import {getSchemesApi, getSchemeStatsApi} from '../api/schemeApi';
import {GOV_SCHEMES, setSchemes} from '../data/govSchemes';

const CACHE_KEY = 'khetimaster_gov_schemes_v2_'; // + language
const STATS_KEY = 'khetimaster_gov_stats_v1';
const REFRESH_MS = 60 * 60 * 1000; // re-fetch at most hourly

// The server translates into these; other app languages show English text.
const serverLang = () => {
  const l = String(i18n.language || 'en').slice(0, 2);
  return l === 'hi' || l === 'mr' ? l : 'en';
};

const hydrated = new Set();
const lastFetch = {};
let inflight = null;
const listeners = new Set();
const notify = () => listeners.forEach(fn => fn(v => v + 1));

// Order of precedence: bundled list -> cached API copy -> fresh API copy.
const hydrate = async lang => {
  if (hydrated.has(lang)) {
    return;
  }
  hydrated.add(lang);
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY + lang);
    if (raw) {
      setSchemes(JSON.parse(raw));
      notify();
    }
  } catch (e) {
    // cache is optional
  }
};

export const refreshSchemes = async (force = false) => {
  const lang = serverLang();
  await hydrate(lang);
  if (inflight) {
    return inflight;
  }
  if (!force && Date.now() - (lastFetch[lang] || 0) < REFRESH_MS) {
    return null;
  }
  inflight = (async () => {
    try {
      const res = await getSchemesApi(lang);
      if (res?.success && Array.isArray(res.data) && res.data.length) {
        setSchemes(res.data);
        lastFetch[lang] = Date.now();
        AsyncStorage.setItem(CACHE_KEY + lang, JSON.stringify(res.data)).catch(
          () => {},
        );
        notify();
      }
    } catch (e) {
      // offline / server down: keep whatever list we already have
    } finally {
      inflight = null;
    }
  })();
  return inflight;
};

// Call once per scheme screen: triggers a refresh (again whenever the app
// language changes) and re-renders when the list changes. Returns the list.
export const useSchemes = () => {
  const {i18n: inst} = useTranslation();
  const [, force] = useState(0);
  useEffect(() => {
    listeners.add(force);
    return () => {
      listeners.delete(force);
    };
  }, []);
  useEffect(() => {
    refreshSchemes(true);
  }, [inst.language]);
  return GOV_SCHEMES;
};

// Live catalogue statistics from the server (cached for offline).
export const useSchemeStats = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STATS_KEY);
        if (raw && alive) {
          setStats(JSON.parse(raw));
        }
      } catch (e) {}
      try {
        const res = await getSchemeStatsApi();
        if (alive && res?.success) {
          setStats(res.data);
          AsyncStorage.setItem(STATS_KEY, JSON.stringify(res.data)).catch(
            () => {},
          );
        }
      } catch (e) {}
    })();
    return () => {
      alive = false;
    };
  }, []);
  return stats;
};
