import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Navigation } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { refreshAccessToken, getMe } from '../../redux/slices/authSlice';
import { getRefreshToken } from '../../utils/tokenStorage';
const { width, height } = Dimensions.get('window');
const GREEN = '#138A3D';
const ORANGE = '#F97316';
const isSmallWidth = width < 360;
const isMediumWidth = width >= 360 && width < 390;
const isSmallHeight = height < 700;
const isVerySmallHeight = height < 640;
const responsiveFont = size => {
  const scale = width / 390;
  const newSize = size * scale;
  return Math.max(size - 3, Math.min(newSize, size + 2));
};
export default function SplashScreen({ navigation }) {
  const dispatch = useDispatch();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const heroFloat = useRef(new Animated.Value(0)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let isMounted = true;
    let floatLoop;
    let pulseLoop;
    const initializeApp = async () => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 75,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 1,
          duration: 2300,
          useNativeDriver: false,
        }),
      ]).start();
      floatLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(heroFloat, {
            toValue: -8,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(heroFloat, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ]),
      );
      floatLoop.start();
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulse, {
            toValue: 1.08,
            duration: 850,
            useNativeDriver: true,
          }),
          Animated.timing(iconPulse, {
            toValue: 1,
            duration: 850,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.start();
      const splashDelay = new Promise(resolve => {
        setTimeout(resolve, 2700);
      });
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          await splashDelay;
          if (!isMounted) {
            return;
          }
          navigation.replace('Onboarding');
          return;
        }
        const refreshResult = await dispatch(refreshAccessToken());
        if (refreshAccessToken.fulfilled.match(refreshResult)) {
          const meResult = await dispatch(getMe());
          if (getMe.fulfilled.match(meResult)) {
            const user = meResult.payload?.user;
            const profileCompleted = user?.profileCompleted === true;
            await splashDelay;
            if (!isMounted) {
              return;
            }
            if (profileCompleted) {
              navigation.replace('Home');
              return;
            }
            navigation.replace('ProfileSetup');
            return;
          }
        }
        await splashDelay;
        if (!isMounted) {
          return;
        }
        navigation.replace('Onboarding');
      } catch (error) {
        console.log(
          'Splash authentication error:',
          error?.response?.data || error?.message || error,
        );
        await splashDelay;
        if (!isMounted) {
          return;
        }
        navigation.replace('Onboarding');
      }
    };
    initializeApp();
    return () => {
      isMounted = false;
      if (floatLoop) {
        floatLoop.stop();
      }
      if (pulseLoop) {
        pulseLoop.stop();
      }
    };
  }, [
    dispatch,
    fade,
    slide,
    progress,
    logoScale,
    heroFloat,
    iconPulse,
    navigation,
  ]);
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View
        style={[
          styles.container,
          {
            opacity: fade,
            transform: [
              {
                translateY: slide,
              },
            ],
          },
        ]}
      >
        {}

        <Animated.Image
          source={require('../../assets/images/logoo.png')}
          style={[
            styles.topLogo,
            {
              transform: [
                {
                  scale: logoScale,
                },
              ],
            },
          ]}
          resizeMode="contain"
        />

        {}

        <Animated.View
          style={[
            styles.heroCard,
            {
              transform: [
                {
                  translateY: heroFloat,
                },
              ],
            },
          ]}
        >
          <Image
            source={require('../../assets/images/splash.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </Animated.View>

        {}

        <View style={styles.brandWrap}>
          {}

          <View style={styles.brandRow}>
            <Animated.View
              style={[
                styles.circleIcon,
                {
                  transform: [
                    {
                      scale: iconPulse,
                    },
                  ],
                },
              ]}
            >
              <Navigation
                size={isSmallWidth ? 22 : 27}
                color="#FFFFFF"
                fill="#FFFFFF"
              />
            </Animated.View>

            <Text style={styles.brandText} numberOfLines={1}>
              Kheti
              <Text style={styles.orange}>Master</Text>
            </Text>
          </View>

          {}

          <View style={styles.dividerRow}>
            <View style={styles.line} />

            <View style={styles.orangeDot} />

            <View style={styles.line} />
          </View>

          {}

          <Text style={styles.tagline} numberOfLines={1} adjustsFontSizeToFit>
            Smart Farming Partner
          </Text>

          {}

          <Text
            style={styles.subTagline}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            AI POWERED SMART AGRICULTURE
          </Text>

          {}

          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
const logoWidth = isSmallWidth ? width * 0.54 : width * 0.62;
const logoHeight = isSmallHeight ? 72 : 92;
const heroHeight = isVerySmallHeight
  ? height * 0.34
  : isSmallHeight
  ? height * 0.39
  : height * 0.45;
const brandPaddingTop = isVerySmallHeight ? 22 : isSmallHeight ? 28 : 42;
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: isSmallWidth ? 14 : 0,
  },
  topLogo: {
    width: logoWidth,
    height: logoHeight,
    marginTop: isSmallHeight ? 2 : 8,
  },
  heroCard: {
    width: isSmallWidth ? '94%' : '92%',
    height: heroHeight,
    marginTop: isSmallHeight ? 4 : 8,
    overflow: 'hidden',
    borderRadius: isSmallWidth ? 24 : 30,
    backgroundColor: '#F3FFF7',
    shadowColor: GREEN,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  brandWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: brandPaddingTop,
    paddingHorizontal: isSmallWidth ? 10 : 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  circleIcon: {
    width: isSmallWidth ? 48 : 58,
    height: isSmallWidth ? 48 : 58,
    borderRadius: isSmallWidth ? 24 : 29,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: isSmallWidth ? 9 : 12,
    shadowColor: GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 6,
  },
  brandText: {
    fontSize: isSmallWidth ? 27 : isMediumWidth ? 31 : responsiveFont(34),
    fontWeight: '800',
    color: GREEN,
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  orange: {
    color: ORANGE,
  },
  dividerRow: {
    marginTop: isSmallHeight ? 16 : 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallWidth ? 10 : 13,
  },
  line: {
    width: isSmallWidth ? 48 : 62,
    height: 1.5,
    backgroundColor: '#BDF3CF',
  },
  orangeDot: {
    width: isSmallWidth ? 9 : 10,
    height: isSmallWidth ? 9 : 10,
    borderRadius: 5,
    backgroundColor: ORANGE,
  },
  tagline: {
    marginTop: isSmallHeight ? 16 : 22,
    fontSize: isSmallWidth ? 18 : isMediumWidth ? 20 : responsiveFont(22),
    lineHeight: isSmallWidth ? 24 : 30,
    fontWeight: '700',
    color: GREEN,
    textAlign: 'center',
    maxWidth: '94%',
  },
  subTagline: {
    marginTop: isSmallHeight ? 11 : 16,
    fontSize: isSmallWidth ? 10 : responsiveFont(12),
    fontWeight: '700',
    letterSpacing: isSmallWidth ? 2.1 : 3.4,
    color: '#A0A8B5',
    textAlign: 'center',
    maxWidth: '94%',
  },
  progressTrack: {
    marginTop: isSmallHeight ? 24 : 34,
    width: isSmallWidth ? 180 : 220,
    height: 8,
    borderRadius: 20,
    backgroundColor: '#E5F4EA',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 20,
    backgroundColor: GREEN,
  },
});
