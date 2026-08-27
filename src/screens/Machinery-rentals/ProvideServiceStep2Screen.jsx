import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Tractor, ArrowRight } from 'lucide-react-native';
const { width } = Dimensions.get('window');
const rf = s => Math.max(s - 2, Math.min((s * width) / 390, s + 2));
const MACHINERY = [
  {
    id: 'tractor',
    label: 'Tractor',
    img: require('../../assets/machinery/tractor-red.png'),
  },
  {
    id: 'rotavator',
    label: 'Rotavator',
    img: require('../../assets/machinery/rotavator-blue.png'),
  },
  {
    id: 'cultivator',
    label: 'Cultivator',
    img: null,
  },
  {
    id: 'harvester',
    label: 'Harvester',
    img: null,
  },
  {
    id: 'trolley',
    label: 'Trolley',
    img: null,
  },
  {
    id: 'seedrill',
    label: 'Seed Drill',
    img: null,
  },
  {
    id: 'sprayer',
    label: 'Sprayer',
    img: null,
  },
  {
    id: 'other',
    label: 'Other',
    img: null,
  },
];
export default function ProvideServiceStep2Screen({ navigation }) {
  const [selected, setSelected] = useState('tractor');
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provide Service</Text>
        <View style={styles.stepWrap}>
          <Text style={styles.stepText}>Step 2 of 4</Text>
          <View style={styles.progressRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Image
            source={require('../../assets/machinery/tractor-red.png')}
            style={styles.smallThumb}
          />
          <View
            style={{
              flex: 1,
            }}
          >
            <Text style={styles.mainTitle}>
              Which machinery{'\n'}do you want to list?
            </Text>
            <Text style={styles.mainSub}>Select machinery you own.</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.grid}>
          {MACHINERY.map(item => {
            const active = selected === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => setSelected(item.id)}
                style={[styles.gridCard, active && styles.gridCardActive]}
              >
                {active && (
                  <View style={styles.check}>
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </View>
                )}
                <View style={styles.imgWrap}>
                  {item.img ? (
                    <Image
                      source={item.img}
                      style={styles.gridImg}
                      resizeMode="contain"
                    />
                  ) : (
                    <Tractor size={36} color="#9CA3AF" />
                  )}
                </View>
                <Text
                  style={[styles.gridLabel, active && styles.gridLabelActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() =>
            navigation.navigate('ProvideServiceStep3', {
              machineType: selected,
            })
          }
        >
          <Text style={styles.primaryText}>Continue</Text>
          <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <View
          style={{
            height: 40,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: rf(18),
    fontWeight: '800',
    color: '#111',
  },
  stepWrap: {
    alignItems: 'flex-end',
  },
  stepText: {
    fontSize: rf(11),
    color: '#888',
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 4,
  },
  dot: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E8E8E8',
  },
  dotActive: {
    backgroundColor: '#1B7A2E',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  titleRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  smallThumb: {
    width: 88,
    height: 66,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
  },
  mainTitle: {
    fontSize: rf(18),
    fontWeight: '900',
    color: '#111',
    lineHeight: 22,
  },
  mainSub: {
    fontSize: rf(12),
    color: '#6B7280',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: (width - 44) / 2,
    height: 134,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#F1F1F1',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  gridCardActive: {
    borderColor: '#1B7A2E',
    backgroundColor: '#F6FBF3',
  },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1B7A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridImg: {
    width: '90%',
    height: 70,
  },
  gridLabel: {
    fontSize: rf(14),
    fontWeight: '700',
    color: '#111',
    marginTop: 6,
  },
  gridLabelActive: {
    color: '#1B7A2E',
  },
  primaryBtn: {
    backgroundColor: '#1B7A2E',
    height: 54,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    flexDirection: 'row',
    gap: 8,
  },
  primaryText: {
    color: '#fff',
    fontSize: rf(16),
    fontWeight: '800',
  },
});
