import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { CalendarDays, Inbox, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

export default function MachineryBookingActions({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('MachineryMyBookings')}
        style={styles.actionCard}
      >
        <View style={[styles.iconBox, { backgroundColor: '#E8F7ED' }]}>
          <CalendarDays size={rf(20)} color={GREEN} strokeWidth={2.2} />
        </View>
        <View style={styles.textFrame}>
          <Text style={styles.cardTitle}>My Bookings</Text>
          <Text style={styles.cardSub}>Track your rentals</Text>
        </View>
        <ChevronRight size={rf(16)} color="#94A3B8" strokeWidth={2.5} />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('MachineryRequests')}
        style={styles.actionCard}
      >
        <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
          <Inbox size={rf(20)} color="#2563EB" strokeWidth={2.2} />
        </View>
        <View style={styles.textFrame}>
          <Text style={styles.cardTitle}>My Requests</Text>
          <Text style={styles.cardSub}>Incoming orders</Text>
        </View>
        <ChevronRight size={rf(16)} color="#94A3B8" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    marginBottom: 4,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textFrame: {
    flex: 1,
    marginLeft: 10,
  },
  cardTitle: {
    fontSize: rf(12),
    fontWeight: '800',
    color: '#1E293B',
  },
  cardSub: {
    fontSize: rf(9),
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
});