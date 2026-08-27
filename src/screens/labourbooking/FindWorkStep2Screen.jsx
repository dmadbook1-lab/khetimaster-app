import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLabourFormData } from '../../redux/slices/labourSlice';
const { width } = Dimensions.get('window');
const rf = size => {
  const scale = width / 390;
  return Math.max(size, Math.min(size * scale, size + 3));
};
const GREEN = '#16A34A';
const DARK = '#172033';
const MUTED = '#7C8596';
const WORK_TYPES = [
  {
    id: 'sowing',
    label: 'Sowing',
    image: require('../../assets/labour/sowing.jpg'),
  },
  {
    id: 'harvesting',
    label: 'Harvesting',
    image: require('../../assets/labour/harvesting.jpg'),
  },
  {
    id: 'weeding',
    label: 'Weeding',
    image: require('../../assets/labour/weeding.jpg'),
  },
  {
    id: 'irrigation',
    label: 'Irrigation',
    image: require('../../assets/labour/irrigation.jpg'),
  },
  {
    id: 'gardening',
    label: 'Gardening',
    image: require('../../assets/labour/gardening.jpg'),
  },
  {
    id: 'livestock',
    label: 'Livestock',
    image: require('../../assets/labour/livestock.jpg'),
  },
  {
    id: 'tractor',
    label: 'Tractor Assist',
    image: require('../../assets/labour/tractor.jpg'),
  },
];
export default function FindWorkStep2Screen({ navigation }) {
  const dispatch = useDispatch();
  const savedWorkTypes =
    useSelector(state => state?.labour?.formData?.preferredWork) || [];
  const [selected, setSelected] = useState(
    Array.isArray(savedWorkTypes) ? savedWorkTypes : [],
  );
  const toggleWorkType = id => {
    setSelected(current => {
      const list = Array.isArray(current) ? current : [];
      if (list.includes(id)) {
        return list.filter(item => item !== id);
      }
      return [...list, id];
    });
  };
  const handleNext = () => {
    const selectedList = Array.isArray(selected) ? selected : [];
    if (selectedList.length === 0) {
      Alert.alert(
        'Select Work',
        'Please select at least one type of work you can do.',
      );
      return;
    }
    dispatch(
      setLabourFormData({
        preferredWork: selectedList,
        skills: selectedList,
      }),
    );
    navigation.navigate('FindWorkStep3');
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <ArrowLeft size={rf(20)} color={DARK} strokeWidth={2.4} />
        </TouchableOpacity>

        <Text style={styles.title}>Find Work</Text>

        <Text style={styles.stepText}>Step 2 of 4</Text>
      </View>

      <View style={styles.progressRow}>
        <View style={[styles.progressBar, styles.activeBar]} />

        <View style={[styles.progressBar, styles.activeBar]} />

        <View style={styles.progressBar} />

        <View style={styles.progressBar} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Image
          source={require('../../assets/labour/hero5.png')}
          style={styles.heroImage}
        />

        <Text style={styles.mainTitle}>What work do you do?</Text>

        <Text style={styles.subtitle}>Select all farming work you can do.</Text>

        <View style={styles.notePill}>
          <View style={styles.checkboxSmall}>
            <Check size={rf(11)} color="#FFFFFF" strokeWidth={3} />
          </View>

          <Text style={styles.noteText}>Select one or more</Text>

          <View style={styles.selectedCount}>
            <Text style={styles.selectedCountText}>{selected.length}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {WORK_TYPES.map(work => {
            const active = selected.includes(work.id);
            return (
              <TouchableOpacity
                key={work.id}
                activeOpacity={0.85}
                onPress={() => toggleWorkType(work.id)}
                style={[styles.workCard, active && styles.activeWorkCard]}
              >
                {active && (
                  <View style={styles.checkCircle}>
                    <Check size={rf(12)} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}

                <Image source={work.image} style={styles.workImage} />

                <View style={styles.workLabelWrap}>
                  <Text
                    style={[styles.workLabel, active && styles.activeWorkLabel]}
                  >
                    {work.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert('Other Work', 'Other work type can be added later.')
            }
            style={[styles.workCard, styles.otherCard]}
          >
            <View style={styles.otherIcon}>
              <Plus size={rf(30)} color={DARK} strokeWidth={2.4} />
            </View>

            <Text style={styles.workLabel}>Other</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleNext}
          style={styles.nextBtn}
        >
          <Text style={styles.nextText}>Next</Text>

          <ArrowRight size={rf(17)} color="#FFFFFF" strokeWidth={2.6} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.037,
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },
  stepText: {
    fontSize: rf(12),
    color: MUTED,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: width * 0.037,
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E7EBED',
  },
  activeBar: {
    backgroundColor: GREEN,
  },
  scrollContent: {
    paddingHorizontal: width * 0.037,
    paddingBottom: 25,
  },
  heroImage: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  mainTitle: {
    marginTop: 22,
    fontSize: rf(24),
    fontWeight: '900',
    color: DARK,
  },
  subtitle: {
    marginTop: 6,
    fontSize: rf(14),
    color: MUTED,
    lineHeight: rf(19),
  },
  notePill: {
    marginTop: 14,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxSmall: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: {
    marginLeft: 8,
    fontSize: rf(12),
    fontWeight: '800',
    color: DARK,
  },
  selectedCount: {
    marginLeft: 'auto',
    minWidth: 26,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: 13,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCountText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: GREEN,
  },
  grid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  workCard: {
    width: '47%',
    flexGrow: 1,
    aspectRatio: 1.15,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBED',
    overflow: 'hidden',
    position: 'relative',
  },
  activeWorkCard: {
    borderColor: GREEN,
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  workImage: {
    width: '100%',
    height: '65%',
    resizeMode: 'cover',
  },
  workLabelWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  workLabel: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
  },
  activeWorkLabel: {
    color: GREEN,
  },
  checkCircle: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  otherCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
  },
  otherIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    paddingHorizontal: width * 0.037,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  nextBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
