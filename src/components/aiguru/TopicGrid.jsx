import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  COLORS,
  GUTTER,
  CARD_SHADOW,
  FadeInUp,
  PressableScale,
  rf,
} from './theme';

/*
 * Two-column grid of big topic tiles. Tapping a tile sends its question.
 *
 * topics: [{ label, hint, question, Icon, color, tint }]
 */
export default function TopicGrid({ title, topics, onTopicPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.grid}>
        {topics.map(({ label, hint, question, Icon, color, tint }, index) => (
          <FadeInUp key={label} delay={120 + index * 60} style={styles.cell}>
            <PressableScale
              accessibilityLabel={question}
              onPress={() => onTopicPress(question)}
              scaleTo={0.95}
              style={styles.tile}
            >
              <View style={[styles.icon, { backgroundColor: tint }]}>
                <Icon size={rf(22)} color={color} strokeWidth={2.2} />
              </View>
              <Text style={styles.label}>{label}</Text>
              <Text numberOfLines={2} style={styles.hint}>
                {hint}
              </Text>
            </PressableScale>
          </FadeInUp>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: GUTTER,
    paddingTop: 22,
  },
  title: {
    marginBottom: 12,
    fontSize: rf(17),
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  cell: {
    width: '48.3%',
  },
  tile: {
    minHeight: 124,
    padding: 14,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    ...CARD_SHADOW,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 12,
    fontSize: rf(15),
    fontWeight: '800',
    color: COLORS.text,
  },
  hint: {
    marginTop: 2,
    fontSize: rf(11.5),
    lineHeight: rf(15),
    fontWeight: '500',
    color: COLORS.muted,
  },
});
