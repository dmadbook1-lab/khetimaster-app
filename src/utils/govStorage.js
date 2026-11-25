import AsyncStorage from '@react-native-async-storage/async-storage';
import {EMPTY_PROFILE} from './schemeEligibility';

const PROFILE_KEY = 'khetimaster_gov_profile_v1';
const APPLICATIONS_KEY = 'khetimaster_gov_applications_v1';

export const APPLICATION_STATUS = {
  APPLIED: 'applied',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const readJson = async (key, fallback) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const loadGovProfile = async () => {
  const saved = await readJson(PROFILE_KEY, null);
  return saved ? {...EMPTY_PROFILE, ...saved} : null;
};

export const saveGovProfile = profile =>
  AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

export const loadApplications = () => readJson(APPLICATIONS_KEY, []);

const saveApplications = list =>
  AsyncStorage.setItem(APPLICATIONS_KEY, JSON.stringify(list));

// Government portals have no public status API, so the farmer records and
// updates the status of each application themselves.
export const upsertApplication = async ({
  schemeId,
  status = APPLICATION_STATUS.APPLIED,
  referenceNo = '',
  notes = '',
}) => {
  const list = await loadApplications();
  const now = new Date().toISOString();
  const idx = list.findIndex(a => a.schemeId === schemeId);
  if (idx >= 0) {
    list[idx] = {...list[idx], status, referenceNo, notes, updatedAt: now};
  } else {
    list.unshift({
      schemeId,
      status,
      referenceNo,
      notes,
      appliedAt: now,
      updatedAt: now,
    });
  }
  await saveApplications(list);
  return list;
};

export const removeApplication = async schemeId => {
  const list = (await loadApplications()).filter(a => a.schemeId !== schemeId);
  await saveApplications(list);
  return list;
};
