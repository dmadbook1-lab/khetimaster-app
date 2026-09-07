import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  ArrowLeft,
  Check,
  Tractor,
  ArrowRight,
  ChevronRight,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const rf = s =>
  Math.max(s - 2, Math.min((s * width) / 390, s + 2));

/*
|--------------------------------------------------------------------------
| MACHINERY CATEGORIES
|--------------------------------------------------------------------------
|
| These values are what will eventually be sent as:
|
| category: selectedCategory
|
*/

const MACHINERY = [
  {
    id: 'tractor',
    label: 'Tractor',
    category: 'Tractor',
    image: require('../../assets/machinery/tractor-red.png'),
  },

  {
    id: 'rotavator',
    label: 'Rotavator',
    category: 'Rotavator',
    image: require('../../assets/machinery/rotavator-blue.png'),
  },

  {
    id: 'cultivator',
    label: 'Cultivator',
    category: 'Cultivator',
    image: null,
  },

  {
    id: 'harvester',
    label: 'Harvester',
    category: 'Harvester',
    image: null,
  },

  {
    id: 'trolley',
    label: 'Trolley',
    category: 'Trolley',
    image: null,
  },

  {
    id: 'seedrill',
    label: 'Seed Drill',
    category: 'Seed Drill',
    image: null,
  },

  {
    id: 'sprayer',
    label: 'Sprayer',
    category: 'Sprayer',
    image: null,
  },

  {
    id: 'other',
    label: 'Other',
    category: 'Other',
    image: null,
  },
];

export default function ProvideServiceStep2Screen({
  navigation,
  route,
}) {
  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [selected, setSelected] = useState(
    route?.params?.categoryId || 'tractor',
  );

  const [machineryName, setMachineryName] =
    useState(
      route?.params?.name || '',
    );

  /*
  |--------------------------------------------------------------------------
  | SELECT CATEGORY
  |--------------------------------------------------------------------------
  */

  const selectedMachine =
    MACHINERY.find(
      item => item.id === selected,
    );

  /*
  |--------------------------------------------------------------------------
  | CONTINUE
  |--------------------------------------------------------------------------
  */

  const handleContinue = () => {
    /*
    |--------------------------------------------------------------------------
    | BACKEND MAPPING
    |--------------------------------------------------------------------------
    |
    | name     -> Machinery.name
    | category -> Machinery.category
    |
    */

    const category =
      selectedMachine?.category || '';

    /*
    |--------------------------------------------------------------------------
    | DEFAULT NAME
    |--------------------------------------------------------------------------
    |
    | If the user doesn't enter a name, we still
    | provide a meaningful name.
    |
    */

    const finalName =
      machineryName.trim() ||
      selectedMachine?.label ||
      'Farm Machinery';

    /*
    |--------------------------------------------------------------------------
    | PASS DATA TO STEP 3
    |--------------------------------------------------------------------------
    */

    navigation.navigate(
      'ProvideServiceStep3',
      {
        ...(route?.params || {}),

        name: finalName,

        category,

        categoryId: selected,

        machineType: selected,
      },
    );
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'bottom']}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />

      {/* =========================================================
          HEADER
      ========================================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>

          <ArrowLeft
            size={20}
            color="#111"
            strokeWidth={2.2}
          />

        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Provide Service
        </Text>

        <View style={styles.stepWrap}>

          <Text style={styles.stepText}>
            Step 2 of 4
          </Text>

          <View style={styles.progressRow}>

            <View
              style={[
                styles.dot,
                styles.dotActive,
              ]}
            />

            <View
              style={[
                styles.dot,
                styles.dotActive,
              ]}
            />

            <View style={styles.dot} />

            <View style={styles.dot} />

          </View>

        </View>

      </View>

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* =======================================================
            TITLE
        ======================================================== */}

        <View style={styles.titleRow}>

          <View style={styles.titleImageBox}>

            {selectedMachine?.image ? (
              <Image
                source={selectedMachine.image}
                style={styles.smallThumb}
                resizeMode="contain"
              />
            ) : (
              <Tractor
                size={34}
                color="#1B7A2E"
                strokeWidth={2}
              />
            )}

          </View>

          <View style={styles.titleTextWrap}>

            <Text style={styles.mainTitle}>
              Which machinery{'\n'}
              do you want to list?
            </Text>

            <Text style={styles.mainSub}>
              Select the machinery you own.
            </Text>

          </View>

        </View>

        {/* =======================================================
            MACHINERY NAME
        ======================================================== */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Machinery Name
          </Text>

          <Text style={styles.optionalText}>
            Optional
          </Text>

        </View>

        <TextInput
          value={machineryName}
          onChangeText={setMachineryName}
          placeholder="e.g. My Mahindra Tractor"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          maxLength={100}
        />

        <Text style={styles.helperText}>
          Give your machinery a name so farmers can
          easily identify it.
        </Text>

        {/* =======================================================
            DIVIDER
        ======================================================== */}

        <View style={styles.divider} />

        {/* =======================================================
            CATEGORY
        ======================================================== */}

        <View style={styles.categoryHeader}>

          <View>

            <Text style={styles.categoryTitle}>
              Machinery Category
            </Text>

            <Text style={styles.categorySub}>
              Select the type of machinery you own.
            </Text>

          </View>

          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>
              Required
            </Text>
          </View>

        </View>

        {/* =======================================================
            GRID
        ======================================================== */}

        <View style={styles.grid}>

          {MACHINERY.map(item => {

            const active =
              selected === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() =>
                  setSelected(item.id)
                }
                style={[
                  styles.gridCard,
                  active &&
                    styles.gridCardActive,
                ]}>

                {/* CHECK */}
                {active && (
                  <View style={styles.check}>

                    <Check
                      size={12}
                      color="#fff"
                      strokeWidth={3}
                    />

                  </View>
                )}

                {/* IMAGE */}
                <View style={styles.imgWrap}>

                  {item.image ? (
                    <Image
                      source={item.image}
                      style={styles.gridImg}
                      resizeMode="contain"
                    />
                  ) : (
                    <View
                      style={[
                        styles.placeholderIcon,
                        active &&
                          styles.placeholderIconActive,
                      ]}>

                      <Tractor
                        size={34}
                        color={
                          active
                            ? '#1B7A2E'
                            : '#9CA3AF'
                        }
                        strokeWidth={1.8}
                      />

                    </View>
                  )}

                </View>

                {/* LABEL */}
                <Text
                  style={[
                    styles.gridLabel,
                    active &&
                      styles.gridLabelActive,
                  ]}>

                  {item.label}

                </Text>

              </TouchableOpacity>
            );
          })}

        </View>

        {/* =======================================================
            SELECTED CATEGORY SUMMARY
        ======================================================== */}

        <View style={styles.selectedSummary}>

          <View style={styles.summaryIcon}>

            <Check
              size={15}
              color="#1B7A2E"
              strokeWidth={2.8}
            />

          </View>

          <View style={styles.summaryTextWrap}>

            <Text style={styles.summaryLabel}>
              Selected machinery
            </Text>

            <Text style={styles.summaryValue}>
              {selectedMachine?.label}
            </Text>

          </View>

          <ChevronRight
            size={18}
            color="#9CA3AF"
          />

        </View>

        {/* =======================================================
            CONTINUE
        ======================================================== */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.primaryBtn}
          onPress={handleContinue}>

          <Text style={styles.primaryText}>
            Continue
          </Text>

          <ArrowRight
            size={18}
            color="#fff"
            strokeWidth={2.5}
          />

        </TouchableOpacity>

        <View style={{height: 40}} />

      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================================
   STYLES
========================================================================= */

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* -----------------------------------------------------------------------
     HEADER
  ----------------------------------------------------------------------- */

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

  /* -----------------------------------------------------------------------
     CONTENT
  ----------------------------------------------------------------------- */

  content: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    paddingTop: 4,
  },

  /* -----------------------------------------------------------------------
     TITLE
  ----------------------------------------------------------------------- */

  titleRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 8,
  },

  titleImageBox: {
    width: 88,
    height: 66,
    borderRadius: 12,
    backgroundColor: '#F6FBF3',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  smallThumb: {
    width: 82,
    height: 62,
  },

  titleTextWrap: {
    flex: 1,
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

  /* -----------------------------------------------------------------------
     MACHINERY NAME
  ----------------------------------------------------------------------- */

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: rf(13),
    fontWeight: '800',
    color: '#111',
  },

  optionalText: {
    fontSize: rf(10),
    color: '#9CA3AF',
    fontWeight: '600',
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#111',
    fontSize: rf(14),
    backgroundColor: '#fff',
  },

  helperText: {
    fontSize: rf(10),
    color: '#9CA3AF',
    marginTop: 6,
    lineHeight: 15,
  },

  /* -----------------------------------------------------------------------
     DIVIDER
  ----------------------------------------------------------------------- */

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 18,
  },

  /* -----------------------------------------------------------------------
     CATEGORY HEADER
  ----------------------------------------------------------------------- */

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  categoryTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#111',
  },

  categorySub: {
    fontSize: rf(11),
    color: '#6B7280',
    marginTop: 3,
  },

  requiredBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },

  requiredText: {
    fontSize: rf(9),
    color: '#92400E',
    fontWeight: '800',
  },

  /* -----------------------------------------------------------------------
     GRID
  ----------------------------------------------------------------------- */

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
    zIndex: 2,
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

  placeholderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderIconActive: {
    backgroundColor: '#EAF6E8',
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

  /* -----------------------------------------------------------------------
     SELECTED SUMMARY
  ----------------------------------------------------------------------- */

  selectedSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    marginTop: 18,
    backgroundColor: '#FAFAFA',
  },

  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryTextWrap: {
    flex: 1,
    marginLeft: 10,
  },

  summaryLabel: {
    fontSize: rf(10),
    color: '#9CA3AF',
    fontWeight: '600',
  },

  summaryValue: {
    fontSize: rf(13),
    color: '#111',
    fontWeight: '800',
    marginTop: 2,
  },

  /* -----------------------------------------------------------------------
     BUTTON
  ----------------------------------------------------------------------- */

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