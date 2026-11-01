import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, GUTTER, FadeInUp, PressableScale, rf } from './theme';

const DEFAULT_QUESTIONS = [
  'Will my crop need irrigation?',
  'Any disease risk this week?',
  'What fertilizer should I apply?',
];

/* One scrolling row of quick follow-up questions. */
export default function SuggestedQuestions({
  questions = DEFAULT_QUESTIONS,
  onQuestionPress,
}) {
  return (
    <FadeInUp delay={120} style={styles.wrap}>
      <Text style={styles.title}>Ask next</Text>
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
