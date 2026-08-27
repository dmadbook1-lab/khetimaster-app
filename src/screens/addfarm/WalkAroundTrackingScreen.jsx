import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Polyline, Polygon } from 'react-native-svg';
import { Check, CircleHelp, Pause, X } from 'lucide-react-native';
const { width, height } = Dimensions.get('window');
const GREEN = '#22C55E';
const DARK = '#111827';
const ORANGE = '#F97316';
const isSmall = width < 360;
const isShort = height < 700;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const mapHeight = isShort ? height * 0.46 : height * 0.49;
const farmPoints = [
  [0.25, 0.3],
  [0.29, 0.19],
  [0.43, 0.135],
  [0.59, 0.17],
  [0.7, 0.28],
  [0.62, 0.39],
  [0.43, 0.43],
  [0.28, 0.38],
];
const ProgressRing = () => {
  const size = isSmall ? 90 : 104;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circle = 2 * Math.PI * radius;
  const progress = 0.45;
  const offset = circle - circle * progress;
  return (
    <View style={styles.progressRingWrap}>
      <Svg width={size} height={size}>
        <Circle
          stroke="rgba(255,255,255,0.28)"
          fill="transparent"
          strokeWidth={stroke}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />

        <Circle
          stroke={GREEN}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={`${circle} ${circle}`}
          strokeDashoffset={offset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.ringTextBox}>
        <Text style={styles.ringPercent}>45%</Text>
        <Text style={styles.ringDone}>DONE</Text>
      </View>
    </View>
  );
};
const StaticFarmMap = () => {
  const svgHeight = mapHeight;
  const polygonPoints = farmPoints
    .map(([x, y]) => `${width * x},${svgHeight * y}`)
    .join(' ');
  const walkedPoints = farmPoints
    .slice(0, 5)
    .map(([x, y]) => `${width * x},${svgHeight * y}`)
    .join(' ');
  const remainingPoints = farmPoints
    .slice(4)
    .concat([farmPoints[0]])
    .map(([x, y]) => `${width * x},${svgHeight * y}`)
    .join(' ');
  return (
    <View style={styles.mapWrap}>
      <ImageBackground
        source={require('../../assets/images/farm-satellite.png')}
        style={styles.mapImage}
        resizeMode="cover"
      >
        <View style={styles.mapOverlay} />

        <View style={styles.gpsBar}>
          <View style={styles.gpsLeft}>
            <View style={styles.greenDot} />
            <Text style={styles.gpsActive}>GPS ACTIVE</Text>
          </View>

          <View style={styles.accuracyPill}>
            <X size={11} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.accuracyText}>±2.1m</Text>
          </View>

          <Text style={styles.satText}>✣ Sat. OK</Text>
        </View>

        <Svg
          width={width}
          height={svgHeight}
          style={styles.trajectorySvg}
          viewBox={`0 0 ${width} ${svgHeight}`}
        >
          <Polygon
            points={polygonPoints}
            fill="rgba(34,197,94,0.14)"
            stroke="transparent"
          />

          <Polyline
            points={walkedPoints}
            fill="none"
            stroke={GREEN}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <Polyline
            points={remainingPoints}
            fill="none"
            stroke={GREEN}
            strokeWidth="3"
            strokeDasharray="6 8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {farmPoints.map(([x, y], index) => (
            <Circle
              key={index}
              cx={width * x}
              cy={svgHeight * y}
              r="5.5"
              fill={GREEN}
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          ))}

          <Circle
            cx={width * 0.7}
            cy={svgHeight * 0.28}
            r="24"
            fill="rgba(249,115,22,0.22)"
            stroke={ORANGE}
            strokeWidth="2"
          />

          <Circle
            cx={width * 0.7}
            cy={svgHeight * 0.28}
            r="8"
            fill={ORANGE}
            stroke="#FFFFFF"
            strokeWidth="3"
          />
        </Svg>

        <View style={styles.ringCenter}>
          <ProgressRing />
        </View>

        <View style={styles.completedPill}>
          <Text style={styles.completedText}>Boundary Completed</Text>
        </View>
      </ImageBackground>
    </View>
  );
};
export default function WalkAroundTrackingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      <View style={styles.container}>
        <StaticFarmMap />

        <View style={styles.bottomSheet}>
          <View style={styles.dragHandle} />

          <View style={styles.titleRow}>
            <View style={styles.orangeDot} />
            <Text style={styles.sheetTitle}>Great! You're halfway done.</Text>
          </View>

          <Text style={styles.sheetSubtitle}>
            Keep walking around the edge of your{'\n'}farm.
          </Text>

          <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>Boundary progress</Text>
            <Text style={styles.progressValue}>45% complete</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>

          <TouchableOpacity activeOpacity={0.85} style={styles.pauseButton}>
            <View style={styles.pauseIconCircle}>
              <Pause size={22} color={DARK} strokeWidth={2.7} />
            </View>
            <Text style={styles.pauseText}>Pause</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.finishButton}
            onPress={() => navigation.navigate('ReviewFarmScreen')}
          >
            <View style={styles.finishIconCircle}>
              <Check size={22} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={styles.finishText}>Finish Mapping</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.75} style={styles.gpsIssueRow}>
            <CircleHelp size={18} color="#9CA3AF" strokeWidth={2.2} />
            <Text style={styles.gpsIssueText}>Having GPS Issues?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111827',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mapWrap: {
    height: mapHeight,
    width: '100%',
    backgroundColor: '#10230B',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
  gpsBar: {
    position: 'absolute',
    top: height * 0.025,
    left: width * 0.04,
    right: width * 0.04,
    height: 34,
    borderRadius: 18,
    backgroundColor: 'rgba(15,23,42,0.86)',
    paddingHorizontal: width * 0.035,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  gpsLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  gpsActive: {
    fontSize: rf(12),
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.35,
  },
  accuracyPill: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 10,
  },
  accuracyText: {
    fontSize: rf(11),
    color: '#FFFFFF',
    fontWeight: '900',
  },
  satText: {
    fontSize: rf(11),
    color: '#FFFFFF',
    fontWeight: '800',
  },
  trajectorySvg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  ringCenter: {
    position: 'absolute',
    top: mapHeight * 0.455,
    left: width * 0.34,
    width: width * 0.32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  progressRingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTextBox: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringPercent: {
    fontSize: rf(22),
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  ringDone: {
    marginTop: -2,
    fontSize: rf(9),
    color: '#FFFFFF',
    fontWeight: '800',
  },
  completedPill: {
    position: 'absolute',
    top: mapHeight * 0.68,
    alignSelf: 'center',
    height: 38,
    paddingHorizontal: 19,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,42,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 16,
  },
  completedText: {
    fontSize: rf(12),
    color: '#FFFFFF',
    fontWeight: '900',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: isShort ? height * 0.54 : height * 0.555,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width * 0.073,
    paddingTop: 16,
    paddingBottom: 24,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#EEF2F7',
    marginBottom: isShort ? 24 : 30,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orangeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ORANGE,
    marginRight: 9,
  },
  sheetTitle: {
    flex: 1,
    fontSize: rf(20),
    lineHeight: rf(27),
    color: DARK,
    fontWeight: '900',
    letterSpacing: -0.35,
  },
  sheetSubtitle: {
    marginTop: 12,
    fontSize: rf(16),
    lineHeight: rf(25),
    color: '#667085',
    fontWeight: '600',
  },
  progressTextRow: {
    marginTop: isShort ? 26 : 34,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: rf(14),
    color: '#9CA3AF',
    fontWeight: '800',
  },
  progressValue: {
    fontSize: rf(14),
    color: '#15803D',
    fontWeight: '900',
  },
  progressTrack: {
    marginTop: 14,
    height: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressFill: {
    width: '45%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: GREEN,
  },
  pauseButton: {
    marginTop: isShort ? 26 : 32,
    height: isSmall ? 56 : 58,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  pauseIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseText: {
    fontSize: rf(20),
    color: DARK,
    fontWeight: '900',
  },
  finishButton: {
    marginTop: 20,
    height: isSmall ? 60 : 64,
    borderRadius: 15,
    backgroundColor: '#16883E',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 14,
    shadowColor: '#16A34A',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },
  finishIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishText: {
    fontSize: rf(19),
    color: '#FFFFFF',
    fontWeight: '900',
  },
  gpsIssueRow: {
    marginTop: isShort ? 22 : 28,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gpsIssueText: {
    fontSize: rf(14),
    color: '#9CA3AF',
    fontWeight: '800',
  },
});
