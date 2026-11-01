import { useTranslation } from 'react-i18next';
import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, GUTTER, FadeInUp, PressableScale, rf } from './theme';

const DEFAULT_QUESTION_KEYS = [
  'aiGuru.q_irrigation',
  'aiGuru.q_disease_risk',
  'aiGuru.q_fertilizer',
];

/* One scrolling row of quick follow-up questions. */
export default function SuggestedQuestions({
  questions,
  onQuestionPress,
}) {
  const { t } = useTranslation();
  questions = questions || DEFAULT_QUESTION_KEYS.map(key => t(key));
  return (
    <FadeInUp delay={120} style={styles.wrap}>
      <Text style={styles.title}>{t('aiGuru.ask_next')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.row}
      >
        {questions.map(question => (
          <PressableScale
            key={question}
            onPress={() => onQuestionPress(question)}
            style={styles.chip}
          >
            <Text style={styles.chipText}>{question}</Text>
          </PressableScale>
        ))}
      </ScrollView>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
    marginBottom: 8,
  },
  title: {
    marginHorizontal: GUTTER,
    marginBottom: 8,
    fontSize: rf(12),
    fontWeight: '700',
    color: COLORS.muted,
  },
  row: {
    paddingHorizontal: GUTTER,
    gap: 8,
  },
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.greenBorder,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: rf(13),
    fontWeight: '600',
    color: COLORS.greenDark,
  },
});
