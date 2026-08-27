import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
export default function SatelliteMapCard({ farm }) {
  return (
    <View style={styles.card}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.patchOne} />
      <View style={styles.patchTwo} />

      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE • NDVI</Text>
      </View>

      <View style={styles.compass}>
        <Text style={styles.compassText}>N{'\n'}A</Text>
      </View>

      <View style={styles.boundary}>
        <View style={styles.farmLabel}>
          <Text style={styles.farmLabelText}>{farm.title || 'Patil Farm'}</Text>
        </View>
      </View>

      <View style={styles.scaleLine} />
      <Text style={styles.scaleText}>500m</Text>

      <View style={styles.zoomBox}>
        <TouchableOpacity activeOpacity={0.85} style={styles.zoomBtn}>
          <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.85} style={styles.zoomBtn}>
          <Minus size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    height: 306,
    borderRadius: 22,
    backgroundColor: '#064E2E',
    overflow: 'hidden',
    shadowColor: '#064E2E',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },
  glowOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: 'rgba(34,197,94,0.18)',
    top: 70,
    left: 58,
  },
  glowTwo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(22,163,74,0.12)',
    right: -40,
    bottom: -50,
  },
  patchOne: {
    position: 'absolute',
    left: 34,
    top: 22,
    width: 130,
    height: 84,
    borderRadius: 8,
    backgroundColor: 'rgba(20,184,166,0.14)',
    transform: [
      {
        rotate: '12deg',
      },
    ],
  },
  patchTwo: {
    position: 'absolute',
    right: 52,
    bottom: 36,
    width: 152,
    height: 90,
    borderRadius: 8,
    backgroundColor: 'rgba(20,184,166,0.13)',
    transform: [
      {
        rotate: '-7deg',
      },
    ],
  },
  liveBadge: {
    position: 'absolute',
    top: 18,
    left: 18,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#BBF7D0',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  compass: {
    position: 'absolute',
    right: 18,
    top: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassText: {
    fontSize: 10,
    lineHeight: 11,
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
  },
  boundary: {
    position: 'absolute',
    left: '27%',
    top: 90,
    width: '48%',
    height: 126,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4ADE80',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOpacity: 0.5,
    shadowRadius: 18,
  },
  farmLabel: {
    height: 24,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'center',
  },
  farmLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  scaleLine: {
    position: 'absolute',
    left: 16,
    bottom: 35,
    width: 96,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  scaleText: {
    position: 'absolute',
    left: 16,
    bottom: 18,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  zoomBox: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 8,
  },
  zoomBtn: {
    width: 41,
    height: 41,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
