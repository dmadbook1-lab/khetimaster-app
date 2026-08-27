import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
const guide = [
  {
    title: 'Dosage',
    text: 'Apply 100 kg per hectare as basal dose. For top dressing, use 50 kg/hectare after 30 days of sowing.',
  },
  {
    title: 'Application Method',
    text: 'Broadcast evenly or apply in furrows near root zone. Mix with moist soil for best absorption.',
  },
  {
    title: 'Best Crop Stage',
    text: 'Vegetative & early reproductive stages. Apply before irrigation for maximum effectiveness.',
  },
  {
    title: 'Safety Instructions',
    text: 'Store in a cool, dry place. Wear gloves during handling. Keep away from direct sunlight.',
  },
];
export default function ApplicationGuide() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Application Guide</Text>

      <View style={styles.list}>
        {guide.map((item, index) => (
          <View key={index} style={styles.row}>
            <View style={styles.numberCircle}>
              <Text style={styles.number}>{index + 1}</Text>
            </View>

            <View style={styles.textBox}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.text}</Text>
            </View>

            <ChevronRight size={20} color="#CBD5E1" />
          </View>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  list: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
  },
  row: {
    paddingVertical: 18,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  number: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  desc: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '600',
    color: '#64748B',
  },
});
