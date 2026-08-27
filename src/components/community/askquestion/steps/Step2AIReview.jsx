import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Wheat, Leaf, Send, Search } from 'lucide-react-native';
import StepHeader from '../StepHeader';
import AnalyzingCard from '../AnalyzingCard';
import YourQuestionCard from '../YourQuestionCard';
import SimilarQuestionCard from '../SimilarQuestionCard';
import AIDiagnosisCard from '../AIDiagnosisCard';
import ImproveQuestionCard from '../ImproveQuestionCard';
import FooterBar from '../FooterBar';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import { COLORS, rf, PAGE_PADDING } from '../../theme';
const SIMILAR = [
  {
    id: 's1',
    title: 'Wheat leaves yellowing from tips — nitrogen or water stress?',
    match: 89,
    replies: 14,
    expertAnswer: true,
  },
  {
    id: 's2',
    title: 'Yellow tip burn on wheat after urea application',
    match: 74,
    replies: 7,
    expertAnswer: false,
  },
  {
    id: 's3',
    title: 'Early leaf spot symptoms on my wheat crop in Punjab',
    match: 61,
    replies: 21,
    expertAnswer: true,
  },
];
export default function Step2AIReview({
  step,
  totalSteps,
  formData,
  onBack,
  onPost,
}) {
  return (
    <View style={styles.flex}>
      <StepHeader
        title="AI Review"
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {}
        <AnalyzingCard progress={72} />

        {}
        <View
          style={{
            marginTop: 12,
          }}
        >
          <YourQuestionCard
            title="Why are my wheat leaves turning yellow at the tips?"
            tags={[
              {
                label: 'Wheat',
                icon: Wheat,
              },
              {
                label: 'Plant Health',
                icon: Leaf,
              },
            ]}
          />
        </View>

        {}
        <View style={styles.similarHeader}>
          <View style={styles.similarTitleWrap}>
            <View style={styles.bar} />
            <Text style={styles.similarTitle}>Similar Questions Found</Text>
          </View>
          <View style={styles.resultPill}>
            <Text style={styles.resultText}>3 results</Text>
          </View>
        </View>

        {SIMILAR.map(item => (
          <SimilarQuestionCard key={item.id} item={item} />
        ))}

        {}
        <View
          style={{
            marginTop: 4,
          }}
        >
          <AIDiagnosisCard onViewAdvice={() => {}} />
        </View>

        {}
        <View
          style={{
            marginTop: 12,
          }}
        >
          <ImproveQuestionCard
            original="Why are my wheat leaves turning yellow at the tips?"
            improved="My wheat crop (Punjab, Rabi season) has yellowing at leaf tips starting from older leaves upward. Soil test shows pH 7.2. Applied urea 3 weeks ago. Could this be nitrogen deficiency or early leaf spot?"
            onUse={() => {}}
          />
        </View>
      </ScrollView>

      <FooterBar>
        <PrimaryButton label="Post Question" icon={Send} onPress={onPost} />
        <SecondaryButton label="View Similar Questions" icon={Search} />
      </FooterBar>
    </View>
  );
}
const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.PAGE_BG,
  },
  scroll: {
    padding: PAGE_PADDING,
    paddingBottom: 30,
  },
  similarHeader: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  similarTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: COLORS.ORANGE,
  },
  similarTitle: {
    fontSize: rf(13.5),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  resultPill: {
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  resultText: {
    fontSize: rf(9.5),
    fontWeight: '900',
    color: COLORS.MUTED,
  },
});
