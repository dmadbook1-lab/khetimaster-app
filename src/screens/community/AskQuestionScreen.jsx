import React, { useCallback, useState } from 'react';
import { View, StyleSheet, StatusBar, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../components/community/theme';
import Step1AskQuestion from '../../components/community/askquestion/steps/Step1AskQuestion';
import Step2AIReview from '../../components/community/askquestion/steps/Step2AIReview';
import Step3Success from '../../components/community/askquestion/steps/Step3Success';
const TOTAL_STEPS = 3;
export default function AskQuestionScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: 'Why are my cotton leaves turning yellow?',
    description: '',
    crop: 'Cotton',
    stage: 'Flowering',
    categories: ['Disease', 'Crop Care'],
    location: 'Nagpur, Maharashtra',
    visibility: 'Public',
  });
  const updateField = (key, value) =>
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  const exitFlow = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);
  const handleBack = useCallback(() => {
    if (step === 3) {
      exitFlow();
      return true;
    }
    if (step > 1) {
      setStep(step - 1);
      return true;
    }
    exitFlow();
    return true;
  }, [step, exitFlow]);
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => sub.remove();
    }, [handleBack]),
  );
  const goNext = () => step < TOTAL_STEPS && setStep(step + 1);
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {step === 1 && (
        <Step1AskQuestion
          step={step}
          totalSteps={TOTAL_STEPS}
          formData={formData}
          updateField={updateField}
          onBack={handleBack}
          onContinue={goNext}
        />
      )}

      {step === 2 && (
        <Step2AIReview
          step={step}
          totalSteps={TOTAL_STEPS}
          formData={formData}
          onBack={handleBack}
          onPost={goNext}
        />
      )}

      {step === 3 && (
        <Step3Success
          onViewDiscussion={exitFlow}
          onBackToCommunity={exitFlow}
        />
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.PAGE_BG,
  },
});
