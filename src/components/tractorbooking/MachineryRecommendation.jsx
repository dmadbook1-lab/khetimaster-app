import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Sparkles,
  Eye,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function MachineryRecommendation({
  onViewPress,
}) {
  return (
    <LinearGradient
      colors={['#0F9C43', '#21C55D']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.card}>
      <View style={styles.decorCircle} />

      <View style={styles.badge}>
        <Sparkles
          size={rf(11)}
          color="#FFFFFF"
          strokeWidth={2.4}
        />

        <Text style={styles.badgeText}>
          AI Recommended Machinery
        </Text>
      </View>

      <Text style={styles.title}>
        Best Match for Patil Farm
      </Text>

      <Text style={styles.description}>
        Based on your Soybean farm (2.34 Acres), a 45 HP
        tractor with a cultivator is recommended for optimal
        field preparation.
      </Text>

      <View style={styles.statsRow}>
        <RecommendationStat
          label="Est. Time"
          value="3.5 Hours"
        />

        <RecommendationStat
          label="Est. Cost"
          value="₹2,300"
        />

        <RecommendationStat
          label="HP Needed"
          value="45 HP"
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onViewPress}
        style={styles.viewButton}>
        <Eye
          size={rf(18)}
          color="#FFFFFF"
          strokeWidth={2.4}
        />

        <Text style={styles.viewButtonText}>
          View Recommendation
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

function RecommendationStat({label, value}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 291,
    marginTop: 21,
    borderRadius: 15,
    paddingHorizontal: 21,
    paddingTop: 21,
    paddingBottom: 20,
    overflow: 'hidden',
  },

  decorCircle: {
    position: 'absolute',
    width: 135,
    height: 135,
    borderRadius: 68,
    right: -37,
    top: -42,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  badge: {
    alignSelf: 'flex-start',
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 11,
    backgroundColor: 'rgba(0,92,39,0.44)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  badgeText: {
    fontSize: rf(8),
    fontWeight: '800',
    color: '#FFFFFF',
  },

  title: {
    marginTop: 15,
    fontSize: rf(19),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  description: {
    marginTop: 9,
    fontSize: rf(12),
    lineHeight: rf(19),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.90)',
  },

  statsRow: {
    marginTop: 17,
    flexDirection: 'row',
    gap: 8,
  },

  statCard: {
    flex: 1,
    height: 51,
    borderRadius: 8,
    paddingHorizontal: 9,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },

  statLabel: {
    fontSize: rf(8),
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '600',
  },

  statValue: {
    marginTop: 4,
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  viewButton: {
    height: 43,
    marginTop: 16,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.50)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  viewButtonText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});