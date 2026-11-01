import React, {useCallback, useEffect, useRef} from 'react';

import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import {AlertCircle, RefreshCw, Sparkles} from 'lucide-react-native';

import {
  fetchFarmAdvisory,
  fetchFieldConditions,
  regenerateFarmAdvisory,
  resetAdvisory,
  updateActivityProgress,
} from '../../redux/slices/advisorySlice';

import AdvisoryPulseCard from './AdvisoryPulseCard';
import AdvisoryGeneratingCard from './AdvisoryGeneratingCard';
import GrowthJourneyCard from './GrowthJourneyCard';
import ActivityPlanCard from './ActivityPlanCard';
import NutrientBalanceCard from './NutrientBalanceCard';
import SoilPulseCard from './SoilPulseCard';
import {COLORS} from './advisoryTheme';
import useAppLanguage from '../../translation/useAppLanguage';

const POLL_INTERVAL_MS = 6000;
const MAX_POLLS = 30;

/*
|--------------------------------------------------------------------------
| FARM ADVISORY SECTION
|--------------------------------------------------------------------------
|
| Everything CropGen shows on its farm-details screen that comes from
| the smart advisory: crop health, plant growth activity (BBCH), NPK and
| fertilizer, soil moisture / temperature, and today's activities.
|
*/

export default function FarmAdvisorySection({farm, language: languageProp}) {
  // advisory is generated in the app language unless a caller overrides it
  const appLanguage = useAppLanguage();
  const language = languageProp || appLanguage;
  const dispatch = useDispatch();
  const fieldId = farm?._id;

  const {
    advisory,
    generating,
    loading,
    error,
    fetchedAt,
    conditions,
    conditionsLoading,
    progressSaving,
  } = useSelector(state => state.advisory);

  const pollsRef = useRef(0);

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    if (!fieldId) {
      return undefined;
    }

    pollsRef.current = 0;

    dispatch(fetchFarmAdvisory({fieldId, language}));
    dispatch(fetchFieldConditions({fieldId}));

    return () => {
      dispatch(resetAdvisory());
    };
  }, [dispatch, fieldId, language]);

  /* ---------------- POLL WHILE GENERATING ---------------- */

  useEffect(() => {
    if (!fieldId || !generating || pollsRef.current >= MAX_POLLS) {
      return undefined;
    }

    const timer = setTimeout(() => {
      pollsRef.current += 1;
      dispatch(fetchFarmAdvisory({fieldId, language}));
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [dispatch, fieldId, language, generating, fetchedAt]);

  /* ---------------- HANDLERS ---------------- */

  const handleRefresh = useCallback(() => {
    if (!fieldId) return;

    pollsRef.current = 0;

    dispatch(regenerateFarmAdvisory({fieldId, language})).then(() => {
      dispatch(fetchFarmAdvisory({fieldId, language}));
    });

    dispatch(fetchFieldConditions({fieldId}));
  }, [dispatch, fieldId, language]);

  const handleProgress = useCallback(
    (activityType, progress) => {
      if (!advisory?._id) return;

      dispatch(
        updateActivityProgress({
          advisoryId: advisory._id,
          activityType,
          progress,
        }),
      );
    },
    [dispatch, advisory?._id],
  );

  if (!fieldId) {
    return null;
  }

  const isBarren = Boolean(farm?.isBarrenLand);

  return (
    <View>
      <View style={styles.sectionHeading}>
        <View style={styles.eyebrowRow}>
          <Sparkles size={14} color={COLORS.green} strokeWidth={2.5} />

          <Text style={styles.eyebrow}>SMART ADVISORY</Text>
        </View>

        <Text style={styles.sectionTitle}>
          {isBarren ? 'Pre-sowing Guidance' : 'Crop Intelligence'}
        </Text>

        <Text style={styles.sectionSubtitle}>
          Growth stage, nutrients, soil and today's tasks — built from weather,
          satellite and agronomy data for this field.
        </Text>
      </View>

      {/* ====================================================
          ADVISORY
      ==================================================== */}

      {!advisory && (generating || loading) ? (
        <AdvisoryGeneratingCard />
      ) : null}

      {!advisory && !generating && !loading && error ? (
        <View style={styles.errorCard}>
          <AlertCircle size={20} color="#B42318" />

          <View style={styles.errorBody}>
            <Text style={styles.errorTitle}>Advisory unavailable</Text>

            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity onPress={handleRefresh} style={styles.retry}>
              <RefreshCw size={13} color={COLORS.green} strokeWidth={2.5} />

              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {advisory ? (
        <AdvisoryPulseCard
          advisory={advisory}
          farm={farm}
          generating={generating}
          onRefresh={handleRefresh}
        />
      ) : null}

      {advisory ? (
        <NutrientBalanceCard
          npkManagement={advisory.npkManagement}
          farmAcre={farm?.acre}
        />
      ) : null}

      <SoilPulseCard conditions={conditions} loading={conditionsLoading} />

      {advisory ? (
        <>
          <ActivityPlanCard
            activities={advisory.activitiesToDo || []}
            progressSaving={progressSaving}
            onProgress={handleProgress}
          />

          <GrowthJourneyCard
            growth={advisory.plantGrowthActivity}
            isBarren={isBarren}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeading: {
    marginTop: 25,
    marginBottom: 2,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  eyebrow: {
    color: COLORS.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginLeft: 5,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  errorCard: {
    flexDirection: 'row',
    marginTop: 14,
    padding: 14,
    borderRadius: 17,
    backgroundColor: '#FFF7F7',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  errorBody: {
    flex: 1,
    marginLeft: 10,
  },

  errorTitle: {
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '900',
  },

  errorText: {
    color: '#B42318',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  retryText: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 5,
  },
});
