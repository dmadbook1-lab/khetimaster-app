import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { COLORS, rf } from '../theme';
export default function AIAssistBanner() {
  return (
    <LinearGradient
      colors={['#22A957', '#158B3D']}
      start={{
        x: 0,
        y: 0,
      }}
      end={{
        x: 1,
        y: 1,
      }}
      style={styles.wrap}
    >
      <View style={styles.iconBox}>
        <Sparkles size={rf(16)} color="#FFFFFF" strokeWidth={2.4} />
      </View>
      <View
        style={{
          flex: 1,
        }}
      >
        <Text style={styles.title}>AI Guru will assist you</Text>
        <Text style={styles.sub}>
          Our AI Guru will suggest answers instantly after you post.
        </Text>
      </View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  wrap: {
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: rf(12.5),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sub: {
    marginTop: 3,
    fontSize: rf(10.5),
    lineHeight: rf(14),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },
});
