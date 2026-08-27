import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {BadgeCheck, ChevronRight} from 'lucide-react-native';

const {width} = Dimensions.get('window');

export default function AIRecommendedCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.badge}>● AI RECOMMENDED</Text>

      <Text style={styles.title}>Recommended for Your Farm</Text>

      <Text style={styles.desc}>
        This fertilizer is best suited for your Soybean crop during the
        vegetative stage. Apply 100 kg/hectare for optimal yield improvement.
      </Text>

      <View style={styles.bottom}>
        <View style={styles.progressBox}>
          <Text style={styles.confidence}>Confidence</Text>
          <View style={styles.track}>
            <View style={styles.fill} />
          </View>
        </View>

        <Text style={styles.percent}>92%</Text>

        <View style={styles.learnRow}>
          <Text style={styles.learn}>Learn More</Text>
          <ChevronRight size={14} color="#FFFFFF" />
        </View>
      </View>

      <BadgeCheck
        size={92}
        color="rgba(255,255,255,0.10)"
        strokeWidth={1.5}
        style={styles.bgIcon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 30,
    marginHorizontal: width * 0.045,
    borderRadius: 18,
    backgroundColor: '#16A34A',
    padding: 20,
    overflow: 'hidden',
  },

  badge: {
    fontSize: 10,
    color: '#DCFCE7',
    fontWeight: '900',
  },

  title: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  desc: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  bottom: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  progressBox: {
    flex: 1,
  },

  confidence: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DCFCE7',
  },

  track: {
    marginTop: 6,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },

  fill: {
    width: '92%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },

  percent: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  learnRow: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  learn: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  bgIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});