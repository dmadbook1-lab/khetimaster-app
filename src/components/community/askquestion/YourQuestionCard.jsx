import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {Wheat, Leaf} from 'lucide-react-native';
import {COLORS, rf} from '../theme';
import {COMMUNITY_IMAGES} from '../communityImages';

const IMG = COMMUNITY_IMAGES.community4;

export default function YourQuestionCard({title, tags = []}) {
  return (
    <View style={styles.wrap}>
      <View style={{flex: 1}}>
        <Text style={styles.label}>YOUR QUESTION</Text>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.tagRow}>
          {tags.map(t => {
            const Icon = t.icon;
            return (
              <View key={t.label} style={styles.tag}>
                {Icon && (
                  <Icon size={rf(11)} color={COLORS.DARK_GREEN} strokeWidth={2.3} />
                )}
                <Text style={styles.tagText}>{t.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Image source={IMG} style={styles.img} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: rf(9.5),
    fontWeight: '900',
    color: COLORS.MUTED,
    letterSpacing: 0.5,
  },
  title: {
    marginTop: 4,
    fontSize: rf(13),
    lineHeight: rf(17),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  tagRow: {marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  tag: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {fontSize: rf(10), fontWeight: '900', color: COLORS.DARK_GREEN},
  img: {
    width: 66,
    height: 66,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
});