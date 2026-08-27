import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Star, MapPin } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size, Math.min(size * scale, size + 3));
};
const GREEN = '#16A34A';
const DARK = '#172033';
const MUTED = '#7C8596';
const BORDER = '#E7EBED';
export default function AvailableWorkers({
  workers = [],
  onSeeAllPress,
  onWorkerPress,
  onBookPress,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity activeOpacity={0.8} onPress={onSeeAllPress}>
          <Text style={styles.seeAll}>See All ›</Text>
        </TouchableOpacity>
      </View>

      {workers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No workers available</Text>

          <Text style={styles.emptyText}>
            No labourers are currently available for booking.
          </Text>
        </View>
      ) : (
        workers.map(worker => {
          const workerId = worker?._id || worker?.id;
          const workerName =
            worker?.fullName || worker?.name || 'Unnamed Worker';
          const rating = Number(worker?.rating ?? 0);
          const reviews = Number(worker?.totalReviews ?? 0);
          const wage = Number(worker?.expectedWage ?? 0);
          const wageType = worker?.wageType || 'daily';
          const skills =
            Array.isArray(worker?.skills) && worker.skills.length > 0
              ? worker.skills
              : Array.isArray(worker?.preferredWork) &&
                worker.preferredWork.length > 0
              ? worker.preferredWork
              : worker?.labourType
              ? [worker.labourType]
              : [];
          const location = [worker?.village, worker?.district]
            .filter(Boolean)
            .join(', ');
          return (
            <TouchableOpacity
              key={workerId}
              activeOpacity={0.9}
              onPress={() => onWorkerPress?.(worker)}
              style={styles.card}
            >
              {worker?.profileImage ? (
                <Image
                  source={{
                    uri: worker.profileImage,
                  }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>
                    {workerName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.content}>
                <View style={styles.topRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {workerName}
                  </Text>

                  <View style={styles.ratingBox}>
                    <Star size={rf(13)} color="#FACC15" fill="#FACC15" />

                    <Text style={styles.rating}>{rating.toFixed(1)}</Text>

                    <Text style={styles.reviews}>({reviews})</Text>
                  </View>
                </View>

                {location ? (
                  <View style={styles.distanceRow}>
                    <MapPin size={rf(12)} color={MUTED} strokeWidth={2.3} />

                    <Text style={styles.distance} numberOfLines={1}>
                      {location}
                    </Text>
                  </View>
                ) : null}

                <Text style={styles.skills} numberOfLines={1}>
                  Work Types:{' '}
                  {skills.length > 0 ? skills.join(', ') : 'Farm Labour'}
                </Text>

                <View style={styles.bottomRow}>
                  <Text style={styles.price}>
                    ₹ {wage}
                    <Text style={styles.perDay}>
                      {' '}
                      / {wageType === 'hourly' ? 'Hour' : 'Day'}
                    </Text>
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => onBookPress?.(worker)}
                    style={styles.bookBtn}
                  >
                    <Text style={styles.bookText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },
  seeAll: {
    fontSize: rf(13),
    fontWeight: '800',
    color: GREEN,
  },
  card: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
  },
  image: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  placeholderImage: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 27,
    fontWeight: '900',
    color: GREEN,
  },
  content: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    marginRight: 5,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  reviews: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '500',
  },
  distanceRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    flex: 1,
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '600',
  },
  skills: {
    marginTop: 6,
    fontSize: rf(12),
    color: '#5B6575',
    fontWeight: '500',
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },
  perDay: {
    fontSize: rf(11),
    color: MUTED,
    fontWeight: '500',
  },
  bookBtn: {
    paddingHorizontal: 22,
    height: 38,
    borderRadius: 8,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  emptyCard: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  emptyText: {
    marginTop: 5,
    fontSize: rf(12),
    color: MUTED,
    textAlign: 'center',
  },
});
