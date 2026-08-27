import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MachineryCard from './MachineryCard';
const { width } = Dimensions.get('window');
const GREEN = '#16883E';
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
export default function AvailableMachinery({
  machines,
  onSeeAllPress,
  onMachinePress,
  onBookPress,
  onFavouritePress,
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Near You</Text>

        <TouchableOpacity activeOpacity={0.8} onPress={onSeeAllPress}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {machines.map(machine => (
        <MachineryCard
          key={machine.id}
          machine={machine}
          onPress={onMachinePress}
          onBookPress={onBookPress}
          onFavouritePress={onFavouritePress}
        />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
  },
  header: {
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#121A2B',
  },
  seeAll: {
    fontSize: rf(11),
    fontWeight: '900',
    color: GREEN,
  },
});
