import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Users, Tractor, ShoppingBag, ChevronRight } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const activities = [
  {
    Icon: Users,
    title: 'Labour Booking',
    desc: '2 Workers booked for tomorrow',
    time: 'Today, 10:30 AM',
    status: 'Confirmed',
    color: '#16A34A',
    bg: '#ECFDF5',
  },
  {
    Icon: Tractor,
    title: 'Tractor Booking',
    desc: 'Sonalika DI 745 for 2 days',
    time: 'Tomorrow, 08:00 AM',
    status: 'Upcoming',
    color: '#F97316',
    bg: '#FFF7ED',
  },
  {
    Icon: ShoppingBag,
    title: 'Product Order',
    desc: 'Order delivered successfully',
    time: '14 Jun 2026',
    status: 'Delivered',
    color: '#16A34A',
    bg: '#ECFDF5',
  },
];
export default function BazaarRecentActivity() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        <View style={styles.viewRow}>
          <Text style={styles.viewAll}>View All</Text>
          <ChevronRight size={16} color="#16883E" strokeWidth={2.6} />
        </View>
      </View>

      <View style={styles.list}>
        {activities.map((item, index) => {
          const Icon = item.Icon;
          return (
            <View key={index} style={styles.card}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: item.bg,
                  },
                ]}
              >
                <Icon size={22} color={item.color} strokeWidth={2.4} />
              </View>

              <View style={styles.textBox}>
                <View style={styles.topRow}>
                  <Text numberOfLines={1} style={styles.title}>
                    {item.title}
                  </Text>

                  <View
                    style={[
                      styles.status,
                      {
                        backgroundColor: item.bg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: item.color,
                        },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text numberOfLines={1} style={styles.desc}>
                  {item.desc}
                </Text>

                <Text style={styles.time}>{item.time}</Text>
              </View>

              <ChevronRight size={23} color="#CBD5E1" strokeWidth={2.2} />
            </View>
          );
        })}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 28,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: rf(20),
    color: '#111827',
    fontWeight: '900',
    letterSpacing: -0.35,
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAll: {
    fontSize: rf(12),
    color: '#16883E',
    fontWeight: '900',
  },
  list: {
    marginTop: 18,
    gap: 12,
  },
  card: {
    minHeight: 78,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  textBox: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: rf(13),
    color: '#111827',
    fontWeight: '900',
  },
  status: {
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 9,
    justifyContent: 'center',
    marginLeft: 8,
  },
  statusText: {
    fontSize: rf(8),
    fontWeight: '900',
  },
  desc: {
    marginTop: 4,
    fontSize: rf(11),
    color: '#667085',
    fontWeight: '700',
  },
  time: {
    marginTop: 4,
    fontSize: rf(9),
    color: '#98A2B3',
    fontWeight: '700',
  },
});
