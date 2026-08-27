import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Lightbulb,
  MessageSquareText,
  ArrowUpRight,
} from 'lucide-react-native';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const DARK = '#202020';
const MUTED = '#8B95A5';
const BORDER = '#E9EDF1';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const DEFAULT_QUESTIONS = [
  'Will my crop need irrigation?',
  'Any disease risk this week?',
  'What fertilizer should I apply?',
  'Weather forecast for my farm?',
  'Current mandi prices?',
];
export default function SuggestedQuestions({
  questions = DEFAULT_QUESTIONS,
  onQuestionPress,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Lightbulb size={rf(15)} color={MUTED} strokeWidth={2.2} />

        <Text style={styles.headerText}>SUGGESTED</Text>
      </View>

      <View style={styles.questions}>
        {questions.map(question => (
          <TouchableOpacity
            key={question}
            activeOpacity={0.82}
            onPress={() => onQuestionPress(question)}
            style={styles.questionButton}
          >
            <MessageSquareText size={rf(15)} color={DARK} strokeWidth={2.1} />

            <Text numberOfLines={1} style={styles.questionText}>
              {question}
            </Text>

            <ArrowUpRight size={rf(15)} color={GREEN} strokeWidth={2.2} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: width * 0.037,
    paddingTop: 8,
    paddingBottom: 15,
  },
  header: {
    marginLeft: 5,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: MUTED,
    letterSpacing: 0.8,
  },
  questions: {
    gap: 8,
  },
  questionButton: {
    minHeight: 43,
    borderRadius: 22,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.035,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },
  questionText: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: rf(12),
    fontWeight: '700',
    color: DARK,
  },
});
