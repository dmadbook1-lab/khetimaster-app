import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Mic} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

const ASSISTANT_IMAGE = require('../../assets/assistant/assistantt.png');

// the artwork is 2103 x 748; the card keeps that shape so nothing is cut
const IMAGE_RATIO = 2103 / 748;

const EXAMPLES = [
  '“Pyaz ka bhav batao”',
  '“Mujhe labour chahiye”',
  '“Tractor chahiye”',
  '“Pashu doctor”',
  '“Sell my crop”',
];

/*
 * Home screen entry to the voice assistant: the assistant artwork with
 * the text on a darker gradient on the left, a pulsing "Tap to speak"
 * button and example phrases that change every few seconds.
 */
export default function VoiceAssistantCard({onPress}) {
  const press = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const exampleOpacity = useRef(new Animated.Value(1)).current;
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // rotate the example phrase with a short fade
  useEffect(() => {
    let fadeIn;
    const timer = setInterval(() => {
      Animated.timing(exampleOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(({finished}) => {
        if (!finished) return;
        setExampleIndex(index => (index + 1) % EXAMPLES.length);
        fadeIn = Animated.timing(exampleOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        });
        fadeIn.start();
      });
    }, 2800);

    return () => {
      clearInterval(timer);
      fadeIn?.stop();
    };
  }, [exampleOpacity]);

  const pressTo = toValue =>
    Animated.spring(press, {
      toValue,
      friction: 6,
      tension: 180,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={[styles.wrap, {transform: [{scale: press}]}]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Speak to KhetiMaster"
        activeOpacity={1}
        onPressIn={() => pressTo(0.97)}
        onPressOut={() => pressTo(1)}
        onPress={onPress}>
        <ImageBackground
          source={ASSISTANT_IMAGE}
          resizeMode="cover"
          style={styles.card}
          imageStyle={styles.image}>
          {/* darker on the left so the text reads, clear on the right */}
          <LinearGradient
            pointerEvents="none"
            colors={[
              'rgba(4,40,20,0.88)',
              'rgba(4,40,20,0.6)',
              'rgba(4,40,20,0)',
            ]}
            locations={[0, 0.38, 0.62]}
            start={{x: 0, y: 0.5}}
            end={{x: 1, y: 0.5}}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.text}>
            <Text style={styles.title} numberOfLines={1}>
              Speak to KhetiMaster
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              बोलें और काम तुरंत करें
            </Text>
            <Animated.Text
              style={[styles.example, {opacity: exampleOpacity}]}
              numberOfLines={1}>
              {EXAMPLES[exampleIndex]}
            </Animated.Text>

            <View style={styles.button}>
              <View style={styles.micBox}>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.micRing,
                    {
                      opacity: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 0],
                      }),
                      transform: [
                        {
                          scale: pulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.8],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <View style={styles.mic}>
                  <Mic size={13} color="#FFFFFF" strokeWidth={2.6} />
                </View>
              </View>
              <Text style={styles.buttonText}>Tap to speak</Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 18,
    borderRadius: 22,
    backgroundColor: '#0E3B22',
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 7},
    elevation: 6,
  },
  card: {
    width: '100%',
    aspectRatio: IMAGE_RATIO,
    minHeight: 124,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  image: {borderRadius: 22},
  text: {width: '58%', paddingLeft: 16, paddingVertical: 12},
  title: {
    fontSize: rf(15.5),
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 2,
    fontSize: rf(11.5),
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '600',
  },
  example: {
    marginTop: 4,
    fontSize: rf(11),
    color: '#BBF7D0',
    fontWeight: '800',
  },
  button: {
    marginTop: 9,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 4,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  micBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22C55E',
  },
  mic: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {fontSize: rf(11.5), color: '#14532D', fontWeight: '900'},
});
