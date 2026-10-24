import React, {useEffect, useMemo, useRef, useState} from 'react';
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

// card width the design was made for (390pt phone minus the home padding)
const BASE_CARD_WIDTH = 347;

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
  // first guess matches the home screen padding, onLayout corrects it
  const [cardWidth, setCardWidth] = useState(width * 0.89);
  const s = useMemo(() => makeSizes(cardWidth), [cardWidth]);

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
          style={[styles.card, {height: cardWidth / IMAGE_RATIO}]}
          onLayout={e => {
            const w = Math.round(e.nativeEvent.layout.width);
            if (w && Math.abs(w - cardWidth) > 1) setCardWidth(w);
          }}
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

          <View style={[styles.text, s.text]}>
            <Text
              style={[styles.title, s.title]}
              numberOfLines={1}
              adjustsFontSizeToFit>
              Speak to KhetiMaster
            </Text>
            <Text style={[styles.subtitle, s.subtitle]} numberOfLines={1}>
              बोलें और काम तुरंत करें
            </Text>
            <Animated.Text
              style={[styles.example, s.example, {opacity: exampleOpacity}]}
              numberOfLines={1}>
              {EXAMPLES[exampleIndex]}
            </Animated.Text>

            <View style={[styles.button, s.button]}>
              <View style={[styles.micBox, s.mic]}>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.micRing,
                    s.mic,
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
                <View style={[styles.mic, s.mic]}>
                  <Mic size={s.iconSize} color="#FFFFFF" strokeWidth={2.6} />
                </View>
              </View>
              <Text style={[styles.buttonText, s.buttonText]}>Tap to speak</Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

// everything inside the card scales with the card itself, so the text
// always fits the artwork's height and the image is never cropped
const makeSizes = cardWidth => {
  const k = Math.max(0.78, Math.min(cardWidth / BASE_CARD_WIDTH, 1.2));
  const micSize = Math.round(24 * k);
  return {
    iconSize: Math.round(13 * k),
    text: {paddingLeft: 16 * k, paddingVertical: 10 * k},
    title: {fontSize: 15.5 * k},
    subtitle: {marginTop: 2 * k, fontSize: 11.5 * k},
    example: {marginTop: 4 * k, fontSize: 11 * k},
    button: {
      marginTop: 8 * k,
      gap: 7 * k,
      paddingLeft: 4 * k,
      paddingRight: 12 * k,
      paddingVertical: 4 * k,
      borderRadius: 18 * k,
    },
    mic: {width: micSize, height: micSize, borderRadius: micSize / 2},
    buttonText: {fontSize: 11.5 * k},
  };
};

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
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  image: {borderRadius: 22},
  text: {width: '60%'},
  title: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '600',
  },
  example: {
    color: '#BBF7D0',
    fontWeight: '800',
  },
  button: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  micBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micRing: {
    position: 'absolute',
    backgroundColor: '#22C55E',
  },
  mic: {
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {color: '#14532D', fontWeight: '900'},
});
