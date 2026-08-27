import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Check,
  Ruler,
  MapPin,
  Wheat,
  Sprout,
  Droplets,
  CloudRain,
  Waves,
  Sun,
  Tractor,
  Leaf,
} from 'lucide-react-native';

const {width, height} = Dimensions.get('window');

const GREEN = '#159447';
const DARK = '#111827';
const GREY = '#6B7280';

const isSmall = width < 360;
const isShort = height < 700;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 3, Math.min(size * scale, size + 2));
};

const crops = [
  {name: 'Wheat', Icon: Wheat},
  {name: 'Soybean', Icon: Sprout},
  {name: 'Cotton', Icon: Leaf},
  {name: 'Tomato', Icon: Sprout},
  {name: 'Maize', Icon: Wheat},
];

const irrigationOptions = [
  {
    key: 'drip',
    title: 'Drip Irrigation',
    sub: 'Water-efficient',
    Icon: Droplets,
  },
  {
    key: 'sprinkler',
    title: 'Sprinkler',
    sub: 'Overhead spray',
    Icon: CloudRain,
  },
  {
    key: 'flood',
    title: 'Flood Irrigation',
    sub: 'Surface flow',
    Icon: Waves,
  },
  {
    key: 'rainfed',
    title: 'Rainfed',
    sub: 'Natural rainfall',
    Icon: Sun,
  },
];

export default function FarmDetailsScreen({navigation}) {
  const [unit, setUnit] = useState('Acres');
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [irrigation, setIrrigation] = useState('drip');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color={DARK} />
          </TouchableOpacity>

          <View style={styles.logoPill}>
            <Image
              source={require('../../assets/images/logoo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>Farm Details</Text>
          <Text style={styles.progressStep}>Step 2 of 2</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

      <View style={styles.titleWrap}>
  <Text style={styles.title}>
    Tell Us About{'\n'}
    <Text style={styles.greenText}>Your Farm 🌾</Text>
  </Text>
</View>

        <Text style={styles.subtitle}>
          Add basic farm details to start monitoring your crops.
        </Text>

        <Text style={styles.label}>Farm Name</Text>
        <View style={styles.inputBox}>
          <Tractor size={20} color={GREEN} />
          <TextInput
            placeholder="e.g. Patil Farm"
            placeholderTextColor="#7B8495"
            style={styles.input}
          />
        </View>

        <Text style={styles.label}>Crop Type</Text>
        <TouchableOpacity style={styles.inputBox} activeOpacity={0.85}>
          <Wheat size={20} color={GREEN} />
          <Text style={styles.placeholder}>Select crop type</Text>
          <ChevronDown size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.chipsWrap}>
          {crops.map(({name, Icon}) => {
            const active = selectedCrop === name;

            return (
              <TouchableOpacity
                key={name}
                onPress={() => setSelectedCrop(name)}
                style={[styles.chip, active && styles.activeChip]}>
                <Icon size={15} color={active ? GREEN : GREY} />
                <Text style={[styles.chipText, active && styles.activeChipText]}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Farm Area</Text>
        <View style={styles.areaRow}>
          <View style={styles.areaInput}>
            <Ruler size={18} color="#9CA3AF" />
            <TextInput
              placeholder="Enter area"
              placeholderTextColor="#7B8495"
              style={styles.areaTextInput}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.unitSwitch}>
            {['Acres', 'Hectares'].map(item => (
              <TouchableOpacity
                key={item}
                onPress={() => setUnit(item)}
                style={[styles.unitBtn, unit === item && styles.unitBtnActive]}>
                <Text style={[styles.unitText, unit === item && styles.unitTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.label}>Irrigation Type</Text>
        <View style={styles.irrigationGrid}>
          {irrigationOptions.map(({key, title, sub, Icon}) => {
            const active = irrigation === key;

            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.85}
                onPress={() => setIrrigation(key)}
                style={[styles.irrigationCard, active && styles.irrigationActive]}>
                {active && (
                  <View style={styles.checkCircle}>
                    <Check size={15} color="#FFFFFF" strokeWidth={4} />
                  </View>
                )}

                <View style={[styles.irrigationIconBox, active && styles.irrigationIconBoxActive]}>
                  <Icon size={24} color={active ? GREEN : '#6B7280'} />
                </View>

                <Text style={styles.irrigationTitle}>{title}</Text>
                <Text style={styles.irrigationSub}>{sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.noteBox}>
          <MapPin size={18} color="#DC2626" />
          <Text style={styles.noteText}>
            Next, we’ll mark your farm boundary on the map.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('FarmMappingScreen')}>
          <LinearGradient
            colors={['#12833B', '#2ECC71']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.button}>
            <Text style={styles.buttonText}>Continue to Mapping</Text>
            <ArrowRight size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const cardWidth = (width - (isSmall ? 40 : 44)) / 2;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#FFFFFF'},
  scrollContent: {
    paddingHorizontal: isSmall ? 14 : 16,
    paddingBottom: 112,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoPill: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: isSmall ? 112 : 132,
    height: 30,
  },
  headerSpace: {width: 42},
  progressTop: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: rf(14),
    color: '#9CA3AF',
    fontWeight: '800',
  },
  progressStep: {
    fontSize: rf(13),
    color: '#0F8A3D',
    fontWeight: '900',
  },
  progressTrack: {
    marginTop: 10,
    height: 7,
    borderRadius: 10,
    backgroundColor: '#F0F1F3',
    overflow: 'hidden',
  },
  progressFill: {
    width: '75%',
    height: '100%',
    backgroundColor: GREEN,
  },
  titleWrap: {
    marginTop: isShort ? 24 : 30,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  greenText: {
  color: GREEN,
  fontWeight: '900',
},
  title: {
    fontSize: isSmall ? 29 : 32,
    lineHeight: isSmall ? 36 : 40,
    color: DARK,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  titleIcon: {
    marginLeft: -24,
    marginBottom: 7,
  },
  subtitle: {
    marginTop: 12,
    fontSize: rf(16),
    lineHeight: rf(22),
    color: GREY,
    maxWidth: '92%',
  },
  label: {
    marginTop: 28,
    marginBottom: 10,
    fontSize: rf(15),
    color: DARK,
    fontWeight: '900',
  },
  inputBox: {
    height: isSmall ? 56 : 60,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E0E5EC',
    backgroundColor: '#FAFBFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  input: {
    flex: 1,
    marginLeft: 14,
    fontSize: rf(16),
    color: DARK,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    marginLeft: 14,
    fontSize: rf(16),
    color: GREY,
    fontWeight: '600',
  },
  chipsWrap: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  chip: {
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E5EC',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeChip: {
    borderColor: GREEN,
    backgroundColor: '#EDFFF3',
  },
  chipText: {
    fontSize: rf(14),
    color: '#374151',
    fontWeight: '800',
  },
  activeChipText: {
    color: DARK,
  },
  areaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  areaInput: {
    flex: 1.15,
    height: isSmall ? 56 : 60,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E0E5EC',
    backgroundColor: '#FAFBFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  areaTextInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: rf(15.5),
    color: DARK,
    fontWeight: '600',
  },
  unitSwitch: {
    flex: 1,
    height: isSmall ? 56 : 60,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E0E5EC',
    backgroundColor: '#FAFBFC',
    flexDirection: 'row',
    padding: 4,
  },
  unitBtn: {
    flex: 1,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitBtnActive: {
    backgroundColor: GREEN,
  },
  unitText: {
    fontSize: rf(13),
    color: GREY,
    fontWeight: '800',
  },
  unitTextActive: {
    color: '#FFFFFF',
  },
  irrigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  irrigationCard: {
    width: cardWidth,
    minHeight: isSmall ? 120 : 128,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E0E5EC',
    backgroundColor: '#FAFBFC',
    padding: isSmall ? 14 : 16,
    justifyContent: 'center',
  },
  irrigationActive: {
    borderColor: GREEN,
    backgroundColor: '#EEFFF5',
  },
  checkCircle: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  irrigationIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  irrigationIconBoxActive: {
    backgroundColor: '#DFF8E8',
  },
  irrigationTitle: {
    fontSize: rf(15),
    color: DARK,
    fontWeight: '900',
  },
  irrigationSub: {
    marginTop: 3,
    fontSize: rf(12),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  noteBox: {
    marginTop: 34,
    minHeight: 72,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFBFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: rf(15),
    lineHeight: rf(21),
    color: GREY,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: isSmall ? 14 : 16,
    paddingTop: 20,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F2F4',
  },
  button: {
    height: 62,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  buttonText: {
    fontSize: rf(19),
    color: '#FFFFFF',
    fontWeight: '900',
  },
});