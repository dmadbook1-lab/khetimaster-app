import React from 'react';
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  ChevronRight,
  CloudRain,
  Droplets,
  LocateFixed,
  MapPin,
  RefreshCw,
  SprayCan,
  Sun,
  Wind,
} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';

import useLocalWeather from '../weather/useLocalWeather';
import AnimatedWeatherArt from '../weather/AnimatedWeatherArt';
import {artKindFor} from '../weather/WeatherArt';
import {Skeleton} from '../weather/WeatherParts';
import {
  formatTemp,
  round,
  sprayAdvice,
  windDirection,
} from '../../utils/weatherFormat';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

const DARK = '#0F172A';
const TEXT = '#334155';
const MUTED = '#64748B';
const GREEN = '#15803D';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const TIP_TONE = {
  good: {color: '#15803D', bg: '#DCFCE7'},
  caution: {color: '#B45309', bg: '#FEF3C7'},
  avoid: {color: '#B91C1C', bg: '#FEE2E2'},
};

const todayText = () => {
  const now = new Date();
  return `${WEEKDAYS[now.getDay()]}, ${now.getDate()} ${
    MONTHS[now.getMonth()]
  }`;
};

/*
 * Today's weather on the landscape card: animated illustration,
 * temperature, a farm tip and a frosted row of key numbers over the
 * hills. Tapping opens the Weather screen.
 */
export default function WeatherCard() {
  const navigation = useNavigation();
  const {data, status, error, place, locationLoading, locationMissing, refresh} =
    useLocalWeather();

  const current = data?.current;
  const today = data?.days?.[0];

  /* LOADING: shapes only, no text */

  if (
    !current &&
    (locationLoading ||
      (!locationMissing && (status === 'loading' || status === 'idle')))
  ) {
    return (
      <View style={[styles.wrap, styles.plain]}>
        <View style={styles.skelTop}>
          <Skeleton style={styles.skelPill} />
          <Skeleton style={styles.skelDot} />
        </View>
        <View style={styles.skelMiddle}>
          <Skeleton style={styles.skelArt} />
          <View style={styles.flex}>
            <Skeleton style={styles.skelTemp} />
            <Skeleton style={styles.skelLine} />
          </View>
        </View>
        <Skeleton style={styles.skelBar} />
      </View>
    );
  }

  /* NO LOCATION / ERROR */

  if (!current) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={refresh}
        style={[styles.wrap, styles.plain, styles.messageCard]}>
        <View style={styles.messageIcon}>
          {locationMissing ? (
            <LocateFixed size={22} color={GREEN} />
          ) : (
            <RefreshCw size={20} color={GREEN} />
          )}
        </View>
        <View style={styles.flex}>
          <Text style={styles.messageTitle}>
            {locationMissing ? 'Turn on location' : 'Weather not available'}
          </Text>
          <Text style={styles.messageText} numberOfLines={2}>
            {locationMissing
              ? 'Tap to see the weather for your farm'
              : error || 'Tap to try again'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  /* WEATHER */

  const tip = sprayAdvice(today);
  const tone = TIP_TONE[tip.tone] || TIP_TONE.good;

  const stats = [
    {
      Icon: Droplets,
      color: '#2563EB',
      value: `${round(current.humidity) ?? '--'}%`,
      label: 'Humidity',
    },
    {
      Icon: Wind,
      color: '#0EA5E9',
      value: `${round(current.windspeed) ?? '--'} km/h`,
      label: windDirection(current.winddir) || 'Wind',
    },
    {
      Icon: CloudRain,
      color: '#0891B2',
      value: `${round(today?.precipprob) ?? 0}%`,
      label: 'Rain',
    },
    {
      Icon: Sun,
      color: '#F59E0B',
      value: String(round(current.uvindex) ?? 0),
      label: 'UV',
    },
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.93}
      onPress={() => navigation.navigate('Weather')}
      style={styles.wrap}
      accessibilityRole="button"
      accessibilityLabel="Open weather">
      <ImageBackground
        source={require('../../assets/weather/hero.png')}
        style={styles.card}
        imageStyle={styles.image}
        resizeMode="cover">
        {/* white over the sky so the text reads; hills stay visible */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.97)',
            'rgba(255,255,255,0.88)',
            'rgba(255,255,255,0.35)',
            'rgba(255,255,255,0)',
          ]}
          locations={[0, 0.45, 0.75, 1]}
          start={{x: 0, y: 0.5}}
          end={{x: 1, y: 0.5}}
          style={StyleSheet.absoluteFill}
        />

        {/* TOP */}
        <View style={styles.topRow}>
          <View style={styles.placeRow}>
            <View style={styles.liveDot} />
            <MapPin size={12} color={GREEN} />
            <Text style={styles.place} numberOfLines={1}>
              {place}
            </Text>
            <Text style={styles.date}>· {todayText()}</Text>
          </View>
          <View style={styles.open}>
            <ChevronRight size={16} color={GREEN} strokeWidth={2.6} />
          </View>
        </View>

        {/* NOW */}
        <View style={styles.nowRow}>
          <View style={styles.artBubble}>
            <AnimatedWeatherArt
              kind={artKindFor(current.icon, current.conditions)}
              size={60}
            />
          </View>
          <View style={styles.flex}>
            <View style={styles.tempRow}>
              <Text style={styles.temp}>{round(current.temp) ?? '--'}</Text>
              <Text style={styles.tempUnit}>°C</Text>
              <View style={styles.tempSide}>
                <Text style={styles.condition} numberOfLines={1}>
                  {current.conditions}
                </Text>
                <Text style={styles.highLow} numberOfLines={1}>
                  H {formatTemp(today?.tempmax)} · L{' '}
                  {formatTemp(today?.tempmin)}
                </Text>
              </View>
            </View>
            <View style={[styles.tip, {backgroundColor: tone.bg}]}>
              <SprayCan size={12} color={tone.color} />
              <Text
                style={[styles.tipText, {color: tone.color}]}
                numberOfLines={1}>
                {tip.title}
              </Text>
            </View>
          </View>
        </View>

        {/* STATS over the hills */}
        <View style={styles.stats}>
          {stats.map(({Icon, color, value, label}, index) => (
            <React.Fragment key={label}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.stat}>
                <View style={[styles.statIcon, {backgroundColor: `${color}1A`}]}>
                  <Icon size={13} color={color} strokeWidth={2.5} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.statValue} numberOfLines={1}>
                    {value}
                  </Text>
                  <Text style={styles.statLabel} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              </View>
            </React.Fragment>
          ))}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  wrap: {
    marginTop: 22,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 14,
    backgroundColor: '#E6F2FA',
  },
  image: {borderRadius: 24},

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  placeRow: {flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5},
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 2,
  },
  place: {flexShrink: 1, fontSize: rf(12.5), fontWeight: '900', color: DARK},
  date: {fontSize: rf(11.5), fontWeight: '700', color: MUTED},
  open: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  artBubble: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  tempRow: {flexDirection: 'row', alignItems: 'center'},
  temp: {
    fontSize: rf(42),
    lineHeight: rf(48),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -2,
  },
  tempUnit: {
    alignSelf: 'flex-start',
    marginTop: 6,
    fontSize: rf(15),
    fontWeight: '800',
    color: TEXT,
  },
  tempSide: {flex: 1, marginLeft: 10},
  condition: {fontSize: rf(14), fontWeight: '900', color: DARK},
  highLow: {fontSize: rf(11.5), fontWeight: '700', color: MUTED, marginTop: 1},
  tip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    maxWidth: '100%',
  },
  tipText: {fontSize: rf(11), fontWeight: '800', flexShrink: 1},

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 3,
  },
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {fontSize: rf(11.5), fontWeight: '900', color: DARK},
  statLabel: {fontSize: rf(9), fontWeight: '700', color: MUTED},
  divider: {width: 1, height: 26, backgroundColor: '#E2E8F0'},

  plain: {padding: 14, backgroundColor: '#FFFFFF'},
  skelTop: {flexDirection: 'row', justifyContent: 'space-between'},
  skelPill: {width: 150, height: 14, borderRadius: 7},
  skelDot: {width: 30, height: 30, borderRadius: 15},
  skelMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  skelArt: {width: 74, height: 74, borderRadius: 37},
  skelTemp: {width: 130, height: 40, borderRadius: 12},
  skelLine: {width: '60%', height: 14, borderRadius: 7, marginTop: 8},
  skelBar: {height: 48, borderRadius: 18, marginTop: 14},

  messageCard: {flexDirection: 'row', alignItems: 'center', gap: 12},
  messageIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageTitle: {fontSize: rf(14.5), color: '#111827', fontWeight: '900'},
  messageText: {
    marginTop: 2,
    fontSize: rf(12),
    color: '#475569',
    fontWeight: '600',
  },
});
