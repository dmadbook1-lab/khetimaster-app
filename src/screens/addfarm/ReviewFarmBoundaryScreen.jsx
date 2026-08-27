import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Polygon } from 'react-native-svg';
import {
  ArrowLeft,
  Share2,
  Plus,
  Minus,
  BookOpen,
  Database,
  Expand,
  MapPin,
  Navigation,
  ShieldCheck,
  Pencil,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react-native';
const { width, height } = Dimensions.get('window');
const GREEN = '#16883E';
const LIGHT_GREEN = '#ECFDF5';
const BORDER_GREEN = '#BBF7D0';
const DARK = '#111827';
const MUTED = '#64748B';
const ORANGE = '#F97316';
const isSmall = width < 360;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function ReviewFarmBoundaryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.circleBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={rf(22)} color="#1F2937" strokeWidth={2.3} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.brandText}>KHETIMASTER</Text>
            <Text style={styles.title}>Review Farm Boundary</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.circleBtn}>
            <Share2 size={rf(21)} color={GREEN} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        <View style={styles.mapCard}>
          <ImageBackground
            source={require('../../assets/images/farm-satellite.png')}
            style={styles.mapImage}
            resizeMode="cover"
          >
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Polygon
                points="96,52 198,18 318,56 350,158 286,214 158,214 82,158"
                fill="rgba(34,197,94,0.14)"
                stroke="#22C55E"
                strokeWidth="4"
                strokeLinejoin="round"
              />

              {[
                [96, 52],
                [198, 18],
                [318, 56],
                [350, 158],
                [286, 214],
                [158, 214],
                [82, 158],
              ].map(([cx, cy], index) => (
                <Circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill="#22C55E"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                />
              ))}

              <Circle
                cx="214"
                cy="122"
                r="10"
                fill="transparent"
                stroke="#FFFFFF"
                strokeWidth="4"
              />
            </Svg>

            <View style={styles.zoomControls}>
              <TouchableOpacity activeOpacity={0.8} style={styles.zoomBtn}>
                <Plus size={rf(25)} color={GREEN} strokeWidth={2.6} />
              </TouchableOpacity>
              <View style={styles.zoomDivider} />
              <TouchableOpacity activeOpacity={0.8} style={styles.zoomBtn}>
                <Minus size={rf(25)} color={GREEN} strokeWidth={2.6} />
              </TouchableOpacity>
            </View>

            <View style={styles.accuracyPill}>
              <View style={styles.orangeDot} />
              <Text style={styles.accuracyText}>GPS Accuracy — Excellent</Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.farmHeader}>
            <View style={styles.mainIconCircle}>
              <BookOpen size={rf(27)} color="#FFFFFF" strokeWidth={2.3} />
            </View>

            <View style={styles.farmNameWrap}>
              <Text style={styles.label}>Farm Name</Text>
              <Text style={styles.farmName}>Patil Farm</Text>
            </View>

            <View style={styles.activePill}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <InfoItem Icon={Database} label="Crop" value="Soybean" />
            <InfoItem Icon={Expand} label="Area" value="2.34 Acres" />
            <InfoItem Icon={MapPin} label="Boundary Points" value="42 Points" />
            <InfoItem
              Icon={Navigation}
              label="Method"
              value={'GPS Walk\nTrace'}
            />
          </View>
        </View>

        <View style={styles.accuracyCard}>
          <View style={styles.accuracyIcon}>
            <ShieldCheck size={rf(28)} color="#FFFFFF" strokeWidth={2.4} />
          </View>

          <View style={styles.accuracyContent}>
            <View style={styles.accuracyTitleRow}>
              <Text style={styles.accuracyTitle}>Excellent Accuracy</Text>
              <View style={styles.greenTinyDot} />
            </View>
            <Text style={styles.accuracyDesc}>
              Your farm boundary was captured{'\n'}
              successfully and is ready for satellite{'\n'}
              monitoring.
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <ActionCard Icon={Pencil} title="Edit Boundary" />
          <ActionCard Icon={RotateCcw} title="Remap Farm" />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.confirmButton}
          onPress={() => navigation.navigate('SmartFarmScreen')}
        >
          <CheckCircle2 size={rf(22)} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.confirmText}>Confirm Farm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.backTracking}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backTrackingText}>← Back to Tracking</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const InfoItem = ({ Icon, label, value }) => {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIconCircle}>
        <Icon size={rf(20)} color={GREEN} strokeWidth={2.3} />
      </View>

      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
};
const ActionCard = ({ Icon, title }) => {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.actionCard}>
      <View style={styles.actionIconCircle}>
        <Icon size={rf(22)} color={ORANGE} strokeWidth={2.4} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: width * 0.055,
    paddingBottom: 34,
  },
  header: {
    height: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  brandText: {
    fontSize: rf(10),
    color: '#94A3B8',
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: {
    marginTop: 3,
    fontSize: rf(20),
    color: DARK,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  mapCard: {
    height: height * 0.315,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#D1FAE5',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  zoomControls: {
    position: 'absolute',
    top: 16,
    right: 17,
    width: 44,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },
  zoomBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  accuracyPill: {
    position: 'absolute',
    left: 18,
    bottom: 16,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },
  orangeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ORANGE,
    marginRight: 8,
  },
  accuracyText: {
    fontSize: rf(12),
    color: '#475569',
    fontWeight: '900',
  },
  detailsCard: {
    marginTop: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER_GREEN,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width * 0.06,
    paddingVertical: 24,
  },
  farmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmNameWrap: {
    flex: 1,
    marginLeft: 16,
  },
  label: {
    fontSize: rf(11),
    color: '#94A3B8',
    fontWeight: '800',
  },
  farmName: {
    marginTop: 4,
    fontSize: rf(20),
    color: DARK,
    fontWeight: '900',
    letterSpacing: -0.35,
  },
  activePill: {
    height: 32,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeText: {
    fontSize: rf(12),
    color: GREEN,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 24,
  },
  infoItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: rf(10.5),
    color: '#94A3B8',
    fontWeight: '800',
  },
  infoValue: {
    marginTop: 4,
    fontSize: rf(14.5),
    lineHeight: rf(19),
    color: DARK,
    fontWeight: '900',
  },
  accuracyCard: {
    marginTop: 24,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#86EFAC',
    backgroundColor: '#ECFDF5',
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  accuracyIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyContent: {
    flex: 1,
    marginLeft: 16,
  },
  accuracyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accuracyTitle: {
    fontSize: rf(15),
    color: GREEN,
    fontWeight: '900',
  },
  greenTinyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginLeft: 10,
    backgroundColor: GREEN,
  },
  accuracyDesc: {
    marginTop: 8,
    fontSize: rf(12.5),
    lineHeight: rf(20),
    color: '#475569',
    fontWeight: '600',
  },
  actionRow: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    height: 106,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER_GREEN,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: rf(13),
    color: DARK,
    fontWeight: '900',
  },
  confirmButton: {
    marginTop: 32,
    height: 68,
    borderRadius: 16,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#16A34A',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },
  confirmText: {
    fontSize: rf(19),
    color: '#FFFFFF',
    fontWeight: '900',
  },
  backTracking: {
    marginTop: 24,
    alignSelf: 'center',
  },
  backTrackingText: {
    fontSize: rf(15),
    color: MUTED,
    fontWeight: '900',
  },
});
