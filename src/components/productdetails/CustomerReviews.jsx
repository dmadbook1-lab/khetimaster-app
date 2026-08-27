import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Star } from 'lucide-react-native';
export default function CustomerReviews() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Customer Reviews</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>

      <View style={styles.ratingBlock}>
        <View>
          <Text style={styles.bigRating}>4.8</Text>
          <Text style={styles.stars}>★★★★★</Text>
          <Text style={styles.reviewCount}>1,240 Reviews</Text>
        </View>

        <View style={styles.bars}>
          {[82, 12, 4, 1, 1].map((value, index) => (
            <View key={index} style={styles.barRow}>
              <Text style={styles.barLabel}>{5 - index}</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${value}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.percent}>{value}%</Text>
            </View>
          ))}
        </View>
      </View>

      <ReviewCard
        name="Ramesh Patel"
        location="Maharashtra"
        time="2 weeks ago"
        text="Excellent product! My soybean yield increased by 20% after using this. Delivery was on time and packaging was perfect. Highly recommend to all farmers."
      />

      <ReviewCard
        name="Sukhdev Singh"
        location="Punjab"
        time="1 month ago"
        text="Good quality fertilizer. The AI recommendation was accurate for my wheat crop. Quick delivery and reasonable price compared to local market."
      />
    </View>
  );
}
function ReviewCard({ name, location, time, text }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.userRow}>
        <Image
          source={require('../../assets/bazar/product3.jpg')}
          style={styles.avatar}
        />

        <View
          style={{
            flex: 1,
          }}
        >
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.location}>
            {location} • {time}
          </Text>
        </View>

        <Text style={styles.reviewStars}>★★★★★</Text>
      </View>

      <Text style={styles.reviewText}>“{text}”</Text>

      <View style={styles.verified}>
        <Text style={styles.verifiedText}>● Verified Purchase</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 34,
    paddingTop: 22,
    borderTopWidth: 8,
    borderTopColor: '#F8FAFC',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '900',
    color: '#16A34A',
  },
  ratingBlock: {
    marginTop: 20,
    flexDirection: 'row',
  },
  bigRating: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111827',
  },
  stars: {
    marginTop: 4,
    color: '#FBBF24',
    fontSize: 12,
  },
  reviewCount: {
    marginTop: 4,
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  bars: {
    flex: 1,
    marginLeft: 24,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  barLabel: {
    width: 12,
    fontSize: 9,
    color: '#64748B',
  },
  track: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  percent: {
    width: 26,
    fontSize: 9,
    color: '#64748B',
  },
  reviewCard: {
    marginTop: 24,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  location: {
    marginTop: 2,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  reviewStars: {
    color: '#FBBF24',
    fontSize: 12,
  },
  reviewText: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    color: '#475467',
    fontWeight: '600',
  },
  verified: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#16A34A',
  },
});
