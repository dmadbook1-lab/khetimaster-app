import React from 'react';
import {View, Text, ImageBackground, TouchableOpacity, StyleSheet} from 'react-native';
import {Info, ChevronRight} from 'lucide-react-native';

export default function FarmAIRecommendation() {
  return (
    <ImageBackground
      source={require('../../assets/images/advisory.png')}
      style={styles.card}
      imageStyle={styles.image}>
      <View style={styles.overlay} />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.infoCircle}>
            <Info size={17} color="#16883E" strokeWidth={3} />
          </View>

          <Text style={styles.title}>Today’s AI{'\n'}Recommendation</Text>
        </View>

        <Text style={styles.desc}>
          Irrigation may be required within the next 2 days due to decreasing
          soil moisture.
        </Text>

        <TouchableOpacity activeOpacity={0.85} style={styles.button}>
          <Text style={styles.buttonText}>View Advisory</Text>
          <ChevronRight size={17} color="#166534" strokeWidth={2.6} />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 206,
    marginTop: 32,
    borderRadius: 28,
    overflow: 'hidden',
  },

  image: {
    borderRadius: 28,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,83,45,0.58)',
  },

  content: {
    padding: 20,
    width: '68%',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  infoCircle: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '900',
  },

  desc: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },

  button: {
    marginTop: 18,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 17,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  buttonText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '900',
  },
});