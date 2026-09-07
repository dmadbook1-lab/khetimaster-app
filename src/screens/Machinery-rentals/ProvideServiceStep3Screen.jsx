import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  ArrowLeft,
  ChevronDown,
  Camera,
  Tag,
  Calendar,
  MapPin,
  Tractor,
  ArrowRight,
  Gauge,
  Fuel,
  Settings2,
  FileText,
  Check,
  Plus,
  X,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const rf = s =>
  Math.max(
    s - 2,
    Math.min((s * width) / 390, s + 2),
  );

/*
|--------------------------------------------------------------------------
| DROPDOWN DATA
|--------------------------------------------------------------------------
*/

const BRANDS = [
  'Mahindra',
  'John Deere',
  'Sonalika',
  'Swaraj',
  'Kubota',
  'New Holland',
  'Massey Ferguson',
  'Other',
];

const YEARS = [
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2019',
  '2018',
  '2017',
  '2016',
  '2015',
];

const ENGINE_UNITS = [
  'HP',
  'kW',
  'CC',
];

const FUEL_TYPES = [
  {
    value: 'diesel',
    label: 'Diesel',
  },
  {
    value: 'petrol',
    label: 'Petrol',
  },
  {
    value: 'electric',
    label: 'Electric',
  },
  {
    value: 'other',
    label: 'Other',
  },
];

const DRIVE_TYPES = [
  '2WD',
  '4WD',
  'AWD',
  'other',
];

const IMPLEMENTS = [
  'Rotavator',
  'Cultivator',
  'Seed Drill',
  'Plough',
  'Trailer',
  'Sprayer',
  'Harvester',
];

/*
|--------------------------------------------------------------------------
| SCREEN
|--------------------------------------------------------------------------
*/

export default function ProvideServiceStep3Screen({
  navigation,
  route,
}) {
  const params = route?.params || {};

  /*
  |--------------------------------------------------------------------------
  | BASIC INFORMATION
  |--------------------------------------------------------------------------
  */
   
  const [ownerName, setOwnerName] = useState(
  params.ownerName || '',
);

  const [name, setName] = useState(
    params.name || '',
  );

  const [category, setCategory] = useState(
    params.category || '',
  );

  const [photo, setPhoto] = useState(
    params.images?.[0] || null,
  );

  const [brand, setBrand] = useState(
    params.brand || '',
  );

  const [model, setModel] = useState(
    params.model || '',
  );

  const [year, setYear] = useState(
    params.modelYear
      ? String(params.modelYear)
      : '2024',
  );

  const [description, setDescription] =
    useState(
      params.description || '',
    );

  /*
  |--------------------------------------------------------------------------
  | ENGINE
  |--------------------------------------------------------------------------
  */

  const [enginePower, setEnginePower] =
    useState(
      params.enginePower?.value !== undefined &&
        params.enginePower?.value !== null
        ? String(params.enginePower.value)
        : '',
    );

  const [engineUnit, setEngineUnit] =
    useState(
      params.enginePower?.unit || 'HP',
    );

  /*
  |--------------------------------------------------------------------------
  | FUEL / DRIVE
  |--------------------------------------------------------------------------
  */

  const [fuelType, setFuelType] =
    useState(
      params.fuelType || 'diesel',
    );

  const [driveType, setDriveType] =
    useState(
      params.driveType || '2WD',
    );

  /*
  |--------------------------------------------------------------------------
  | IMPLEMENTS
  |--------------------------------------------------------------------------
  */

  const [
    supportsImplements,
    setSupportsImplements,
  ] = useState(
    Boolean(
      params.supportsImplements,
    ),
  );

  const [
    supportedImplements,
    setSupportedImplements,
  ] = useState(
    Array.isArray(
      params.supportedImplements,
    )
      ? params.supportedImplements
      : [],
  );

  /*
  |--------------------------------------------------------------------------
  | LOCATION
  |--------------------------------------------------------------------------
  */

  const [state, setState] = useState(
    params.state || '',
  );

  const [district, setDistrict] =
    useState(
      params.district || '',
    );

  const [village, setVillage] =
    useState(
      params.village || '',
    );

  const [address, setAddress] =
    useState(
      params.address || '',
    );

  /*
  |--------------------------------------------------------------------------
  | DROPDOWN
  |--------------------------------------------------------------------------
  */

  const [openDropdown, setOpenDropdown] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | PHOTO
  |--------------------------------------------------------------------------
  |
  | Temporary local preview.
  |
  | Replace this later with image-picker /
  | multipart upload when backend image storage
  | is connected.
  |
  */

  const handlePhoto = () => {
    if (photo) {
      setPhoto(null);
      return;
    }

    setPhoto(
      require('../../assets/machinery/tractor-red.png'),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | IMPLEMENT TOGGLE
  |--------------------------------------------------------------------------
  */

  const toggleImplement = implement => {
    setSupportedImplements(current => {
      if (current.includes(implement)) {
        return current.filter(
          item => item !== implement,
        );
      }

      return [
        ...current,
        implement,
      ];
    });
  };

  /*
  |--------------------------------------------------------------------------
  | DROPDOWN
  |--------------------------------------------------------------------------
  */

  const toggleDropdown = dropdownName => {
    setOpenDropdown(current =>
      current === dropdownName
        ? null
        : dropdownName,
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CONTINUE
  |--------------------------------------------------------------------------
  */

  const handleContinue = () => {
    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */
   if (!ownerName.trim()) {
  Alert.alert(
    'Owner Name',
    'Please enter the machinery owner name.',
  );
  return;
}

    if (!name.trim()) {
      Alert.alert(
        'Machinery Name',
        'Please enter the machinery name.',
      );
      return;
    }

    if (!category.trim()) {
      Alert.alert(
        'Machinery Category',
        'Please select a machinery category.',
      );
      return;
    }

    if (!brand.trim()) {
      Alert.alert(
        'Brand Required',
        'Please select the machinery brand.',
      );
      return;
    }

    if (!model.trim()) {
      Alert.alert(
        'Model Required',
        'Please enter the machinery model.',
      );
      return;
    }

    if (!enginePower.trim()) {
      Alert.alert(
        'Engine Power',
        'Please enter the engine power.',
      );
      return;
    }

    const numericEnginePower =
      Number(enginePower);

    if (
      Number.isNaN(
        numericEnginePower,
      ) ||
      numericEnginePower < 0
    ) {
      Alert.alert(
        'Invalid Engine Power',
        'Please enter a valid engine power.',
      );
      return;
    }

    const numericYear =
      Number(year);

    if (
      Number.isNaN(numericYear) ||
      numericYear < 1900 ||
      numericYear > 2100
    ) {
      Alert.alert(
        'Invalid Model Year',
        'Please select a valid model year.',
      );
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | BACKEND-ALIGNED DATA
    |--------------------------------------------------------------------------
    |
    | These names directly match the Machinery
    | Mongoose schema/controller.
    |
    */

    const machineryData = {
      /*
      |--------------------------------------------------------------------------
      | KEEP PREVIOUS STEP DATA
      |--------------------------------------------------------------------------
      */

      ...params,

      /*
      |--------------------------------------------------------------------------
      | BASIC INFORMATION
      |--------------------------------------------------------------------------
      */
       ownerName:
    ownerName.trim(),

      name: name.trim(),

      category: category.trim(),

      brand: brand.trim(),

      model: model.trim(),

      modelYear: numericYear,

      description:
        description.trim(),

      /*
      |--------------------------------------------------------------------------
      | IMAGES
      |--------------------------------------------------------------------------
      */

      images: photo
        ? [photo]
        : [],

      /*
      |--------------------------------------------------------------------------
      | ENGINE
      |--------------------------------------------------------------------------
      */

      enginePower: {
        value:
          numericEnginePower,

        unit: engineUnit,
      },

      /*
      |--------------------------------------------------------------------------
      | FUEL
      |--------------------------------------------------------------------------
      */

      fuelType,

      /*
      |--------------------------------------------------------------------------
      | DRIVE
      |--------------------------------------------------------------------------
      */

      driveType,

      /*
      |--------------------------------------------------------------------------
      | IMPLEMENTS
      |--------------------------------------------------------------------------
      */

      supportsImplements:
        Boolean(
          supportsImplements,
        ),

      supportedImplements:
        supportsImplements
          ? supportedImplements
          : [],

      /*
      |--------------------------------------------------------------------------
      | LOCATION
      |--------------------------------------------------------------------------
      */

      state:
        state.trim(),

      district:
        district.trim(),

      village:
        village.trim(),

      address:
        address.trim(),
    };

    /*
    |--------------------------------------------------------------------------
    | NAVIGATE TO STEP 4
    |--------------------------------------------------------------------------
    */

    navigation.navigate(
      'ProvideServiceStep4',
      machineryData,
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SELECTED FUEL
  |--------------------------------------------------------------------------
  */

  const selectedFuel =
    FUEL_TYPES.find(
      item =>
        item.value ===
        fuelType,
    );

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <SafeAreaView
      style={styles.safe}
      edges={[
        'top',
        'bottom',
      ]}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />

      {/* =========================================================
          HEADER
      ========================================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
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
            Step 3 of 4
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

            <View
              style={[
                styles.dot,
                styles.dotActive,
              ]}
            />

            <View style={styles.dot} />

          </View>

        </View>

      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }>

        {/* =======================================================
            TITLE
        ======================================================== */}

        <View style={styles.centerWrap}>

          <View style={styles.iconBox}>

            <Tractor
              size={34}
              color="#1B7A2E"
              strokeWidth={2}
            />

          </View>

          <Text style={styles.title}>
            Machinery Details
          </Text>

          <Text style={styles.sub}>
            Add the basic information farmers
            need.
          </Text>

        </View>

        {/* =======================================================
            BASIC INFORMATION
        ======================================================== */}

        <SectionTitle
          Icon={Tag}
          title="Basic Information"
        />

        {/* NAME */}
        <FieldLabel
  title="Owner Name"
  required
/>

<TextInput
  value={ownerName}
  onChangeText={setOwnerName}
  placeholder="Enter machinery owner's name"
  placeholderTextColor="#9CA3AF"
  style={styles.input}
  maxLength={100}
/>

        <FieldLabel
          title="Machinery Name"
          required
        />

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Mahindra 575 DI"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          maxLength={100}
        />

        {/* CATEGORY */}

        <FieldLabel
          title="Category"
          required
        />

        <View
          style={
            styles.readOnlyField
          }>

          <Text
            style={
              styles.readOnlyText
            }>
            {category ||
              'Not selected'}
          </Text>

          <View
            style={
              styles.lockBadge
            }>

            <Check
              size={13}
              color="#1B7A2E"
              strokeWidth={2.5}
            />

          </View>

        </View>

        {/* BRAND */}

        <FieldLabel
          title="Brand"
          required
        />

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() =>
            toggleDropdown('brand')
          }>

          <Text
            style={[
              styles.dropText,
              !brand &&
                styles.placeholderText,
            ]}>

            {brand ||
              'Mahindra, John Deere, etc...'}

          </Text>

          <ChevronDown
            size={18}
            color="#6B7280"
          />

        </TouchableOpacity>

        {openDropdown ===
          'brand' && (
          <DropdownOptions>

            {BRANDS.map(item => (
              <DropdownItem
                key={item}
                label={item}
                active={
                  brand === item
                }
                onPress={() => {
                  setBrand(item);
                  setOpenDropdown(
                    null,
                  );
                }}
              />
            ))}

          </DropdownOptions>
        )}

        {/* MODEL */}

        <FieldLabel
          title="Model"
          required
        />

        <TextInput
          value={model}
          onChangeText={setModel}
          placeholder="e.g. 575 DI"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          maxLength={100}
        />

        {/* YEAR */}

        <FieldLabel
          title="Model Year"
          required
        />

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() =>
            toggleDropdown('year')
          }>

          <View
            style={
              styles.dropdownLeft
            }>

            <Calendar
              size={16}
              color="#6B7280"
            />

            <Text
              style={
                styles.dropText
              }>
              {year}
            </Text>

          </View>

          <ChevronDown
            size={18}
            color="#6B7280"
          />

        </TouchableOpacity>

        {openDropdown ===
          'year' && (
          <DropdownOptions>

            {YEARS.map(item => (
              <DropdownItem
                key={item}
                label={item}
                active={
                  year === item
                }
                onPress={() => {
                  setYear(item);
                  setOpenDropdown(
                    null,
                  );
                }}
              />
            ))}

          </DropdownOptions>
        )}

        {/* DESCRIPTION */}

        <FieldLabel
          title="Description"
          optional
        />

        <TextInput
          value={description}
          onChangeText={
            setDescription
          }
          placeholder="Describe your machinery..."
          placeholderTextColor="#9CA3AF"
          style={[
            styles.input,
            styles.textArea,
          ]}
          multiline
          textAlignVertical="top"
          maxLength={500}
        />

        <Text style={styles.counter}>
          {description.length}/500
        </Text>

        {/* =======================================================
            PHOTO
        ======================================================== */}

        <SectionTitle
          Icon={Camera}
          title="Machinery Photo"
        />

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.uploadBox,
            photo &&
              styles.uploadBoxActive,
          ]}
          onPress={handlePhoto}>

          {photo ? (
            <>

              <Image
                source={
                  typeof photo ===
                  'string'
                    ? {uri: photo}
                    : photo
                }
                style={
                  styles.photoPreview
                }
                resizeMode="contain"
              />

              <View
                style={
                  styles.removePhoto
                }>

                <X
                  size={14}
                  color="#fff"
                  strokeWidth={2.5}
                />

              </View>

              <Text
                style={
                  styles.uploadTitle
                }>
                Photo Added
              </Text>

              <Text
                style={
                  styles.uploadSub
                }>
                Tap to remove
              </Text>

            </>
          ) : (
            <>

              <View
                style={
                  styles.camCircle
                }>

                <Camera
                  size={21}
                  color="#1B7A2E"
                />

              </View>

              <Text
                style={
                  styles.uploadTitle
                }>
                Upload Photo
              </Text>

              <Text
                style={
                  styles.uploadSub
                }>
                Tap to take or choose photo
              </Text>

            </>
          )}

        </TouchableOpacity>

        {/* =======================================================
            ENGINE
        ======================================================== */}

        <SectionTitle
          Icon={Gauge}
          title="Engine Specifications"
        />

        <FieldLabel
          title="Engine Power"
          required
        />

        <View style={styles.powerRow}>

          <TextInput
            value={enginePower}
            onChangeText={
              setEnginePower
            }
            placeholder="e.g. 45"
            placeholderTextColor="#9CA3AF"
            keyboardType="decimal-pad"
            style={[
              styles.input,
              styles.powerInput,
            ]}
          />

          <TouchableOpacity
            style={[
              styles.dropdown,
              styles.unitDropdown,
            ]}
            onPress={() =>
              toggleDropdown(
                'engineUnit',
              )
            }>

            <Text
              style={
                styles.dropText
              }>
              {engineUnit}
            </Text>

            <ChevronDown
              size={16}
              color="#6B7280"
            />

          </TouchableOpacity>

        </View>

        {openDropdown ===
          'engineUnit' && (
          <DropdownOptions>

            {ENGINE_UNITS.map(item => (
              <DropdownItem
                key={item}
                label={item}
                active={
                  engineUnit ===
                  item
                }
                onPress={() => {
                  setEngineUnit(
                    item,
                  );
                  setOpenDropdown(
                    null,
                  );
                }}
              />
            ))}

          </DropdownOptions>
        )}

        {/* =======================================================
            FUEL
        ======================================================== */}

        <FieldLabel
          title="Fuel Type"
          required
        />

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() =>
            toggleDropdown('fuel')
          }>

          <View
            style={
              styles.dropdownLeft
            }>

            <Fuel
              size={16}
              color="#6B7280"
            />

            <Text
              style={
                styles.dropText
              }>
              {selectedFuel?.label}
            </Text>

          </View>

          <ChevronDown
            size={18}
            color="#6B7280"
          />

        </TouchableOpacity>

        {openDropdown ===
          'fuel' && (
          <DropdownOptions>

            {FUEL_TYPES.map(item => (
              <DropdownItem
                key={item.value}
                label={item.label}
                active={
                  fuelType ===
                  item.value
                }
                onPress={() => {
                  setFuelType(
                    item.value,
                  );
                  setOpenDropdown(
                    null,
                  );
                }}
              />
            ))}

          </DropdownOptions>
        )}

        {/* =======================================================
            DRIVE
        ======================================================== */}

        <FieldLabel
          title="Drive Type"
          required
        />

        <View style={styles.choiceRow}>

          {DRIVE_TYPES.map(item => {
            const active =
              driveType === item;

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.choiceBtn,
                  active &&
                    styles.choiceBtnActive,
                ]}
                onPress={() =>
                  setDriveType(item)
                }>

                {active && (
                  <Check
                    size={13}
                    color="#1B7A2E"
                    strokeWidth={2.5}
                  />
                )}

                <Text
                  style={[
                    styles.choiceText,
                    active &&
                      styles.choiceTextActive,
                  ]}>
                  {item}
                </Text>

              </TouchableOpacity>
            );
          })}

        </View>

        {/* =======================================================
            IMPLEMENTS
        ======================================================== */}

        <SectionTitle
          Icon={Settings2}
          title="Supported Implements"
        />

        <Text
          style={
            styles.implementQuestion
          }>
          Does this machinery support
          implements?
        </Text>

        <View style={styles.toggleRow}>

          {/* YES */}

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              supportsImplements &&
                styles.toggleActive,
            ]}
            onPress={() =>
              setSupportsImplements(
                true,
              )
            }>

            <View
              style={[
                styles.radio,
                supportsImplements &&
                  styles.radioActive,
              ]}>

              {supportsImplements && (
                <View
                  style={
                    styles.radioDot
                  }
                />
              )}

            </View>

            <Text
              style={[
                styles.toggleText,
                supportsImplements &&
                  styles.toggleTextActive,
              ]}>
              Yes
            </Text>

          </TouchableOpacity>

          {/* NO */}

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              !supportsImplements &&
                styles.toggleActive,
            ]}
            onPress={() => {
              setSupportsImplements(
                false,
              );

              setSupportedImplements(
                [],
              );
            }}>

            <View
              style={[
                styles.radio,
                !supportsImplements &&
                  styles.radioActive,
              ]}>

              {!supportsImplements && (
                <View
                  style={
                    styles.radioDot
                  }
                />
              )}

            </View>

            <Text
              style={[
                styles.toggleText,
                !supportsImplements &&
                  styles.toggleTextActive,
              ]}>
              No
            </Text>

          </TouchableOpacity>

        </View>

        {/* IMPLEMENT LIST */}

        {supportsImplements && (
          <View
            style={
              styles.implementContainer
            }>

            <Text
              style={
                styles.implementSub
              }>
              Select supported implements
            </Text>

            <View
              style={
                styles.implementWrap
              }>

              {IMPLEMENTS.map(
                item => {
                  const active =
                    supportedImplements.includes(
                      item,
                    );

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.implementChip,
                        active &&
                          styles.implementChipActive,
                      ]}
                      onPress={() =>
                        toggleImplement(
                          item,
                        )
                      }>

                      {active ? (
                        <Check
                          size={13}
                          color="#1B7A2E"
                          strokeWidth={
                            2.5
                          }
                        />
                      ) : (
                        <Plus
                          size={13}
                          color="#6B7280"
                        />
                      )}

                      <Text
                        style={[
                          styles.implementText,
                          active &&
                            styles.implementTextActive,
                        ]}>
                        {item}
                      </Text>

                    </TouchableOpacity>
                  );
                },
              )}

            </View>

          </View>
        )}

        {/* =======================================================
            LOCATION
        ======================================================== */}

        <SectionTitle
          Icon={MapPin}
          title="Machinery Location"
        />

        <Text
          style={
            styles.locationInfo
          }>
          Add the location where the machinery
          is currently available.
        </Text>

        {/* STATE */}

        <FieldLabel
          title="State"
          optional
        />

        <TextInput
          value={state}
          onChangeText={setState}
          placeholder="e.g. Maharashtra"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        {/* DISTRICT */}

        <FieldLabel
          title="District"
          optional
        />

        <TextInput
          value={district}
          onChangeText={
            setDistrict
          }
          placeholder="e.g. Pune"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        {/* VILLAGE */}

        <FieldLabel
          title="Village"
          optional
        />

        <TextInput
          value={village}
          onChangeText={setVillage}
          placeholder="e.g. Hadapsar"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        {/* ADDRESS */}

        <FieldLabel
          title="Address"
          optional
        />

        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter complete address"
          placeholderTextColor="#9CA3AF"
          style={[
            styles.input,
            styles.addressInput,
          ]}
          multiline
          textAlignVertical="top"
        />

        {/* =======================================================
            SUMMARY
        ======================================================== */}

        <View
          style={
            styles.summaryCard
          }>

          <View
            style={
              styles.summaryIcon
            }>

            <Check
              size={16}
              color="#1B7A2E"
              strokeWidth={2.8}
            />

          </View>

          <View
            style={
              styles.summaryText
            }>

            <Text
              style={
                styles.summaryTitle
              }>
              Machinery details ready
            </Text>

            <Text
              style={
                styles.summarySub
              }>
              Pricing and availability will be
              added in the next step.
            </Text>

          </View>

        </View>

        {/* =======================================================
            CONTINUE
        ======================================================== */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={
            styles.primaryBtn
          }
          onPress={
            handleContinue
          }>

          <Text
            style={
              styles.primaryText
            }>
            Continue
          </Text>

          <ArrowRight
            size={18}
            color="#fff"
            strokeWidth={2.5}
          />

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

/*
|--------------------------------------------------------------------------
| SECTION TITLE
|--------------------------------------------------------------------------
*/

const SectionTitle = ({
  Icon,
  title,
}) => (
  <View
    style={
      styles.sectionTitleRow
    }>

    <View
      style={
        styles.sectionIcon
      }>

      <Icon
        size={15}
        color="#1B7A2E"
        strokeWidth={2.2}
      />

    </View>

    <Text
      style={
        styles.sectionTitle
      }>
      {title}
    </Text>

  </View>
);

/*
|--------------------------------------------------------------------------
| FIELD LABEL
|--------------------------------------------------------------------------
*/

const FieldLabel = ({
  title,
  required = false,
  optional = false,
}) => (
  <View
    style={
      styles.fieldLabelRow
    }>

    <Text
      style={
        styles.fieldLabel
      }>
      {title}
    </Text>

    {required && (
      <Text
        style={
          styles.required
        }>
        Required
      </Text>
    )}

    {optional && (
      <Text
        style={
          styles.optional
        }>
        Optional
      </Text>
    )}

  </View>
);

/*
|--------------------------------------------------------------------------
| DROPDOWN OPTIONS
|--------------------------------------------------------------------------
*/

const DropdownOptions = ({
  children,
}) => (
  <View style={styles.options}>
    {children}
  </View>
);

/*
|--------------------------------------------------------------------------
| DROPDOWN ITEM
|--------------------------------------------------------------------------
*/

const DropdownItem = ({
  label,
  active,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.option}
    onPress={onPress}>

    <Text
      style={[
        styles.optionText,
        active &&
          styles.optionTextActive,
      ]}>
      {label}
    </Text>

    {active && (
      <Check
        size={16}
        color="#1B7A2E"
        strokeWidth={2.5}
      />
    )}

  </TouchableOpacity>
);

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /*
  |--------------------------------------------------------------------------
  | HEADER
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | CONTENT
  |--------------------------------------------------------------------------
  */

  content: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    paddingTop: 4,
  },

  /*
  |--------------------------------------------------------------------------
  | TITLE
  |--------------------------------------------------------------------------
  */

  centerWrap: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },

  iconBox: {
    width: 84,
    height: 84,
    borderRadius: 18,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: rf(22),
    fontWeight: '900',
    color: '#111',
    marginTop: 10,
  },

  sub: {
    fontSize: rf(13),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },

  /*
  |--------------------------------------------------------------------------
  | SECTION
  |--------------------------------------------------------------------------
  */

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 12,
  },

  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  sectionTitle: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#111',
  },

  /*
  |--------------------------------------------------------------------------
  | LABEL
  |--------------------------------------------------------------------------
  */

  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
    marginTop: 12,
  },

  fieldLabel: {
    fontSize: rf(12),
    color: '#111',
    fontWeight: '700',
  },

  required: {
    fontSize: rf(9),
    color: '#DC2626',
    fontWeight: '700',
    marginLeft: 7,
  },

  optional: {
    fontSize: rf(9),
    color: '#9CA3AF',
    fontWeight: '600',
    marginLeft: 7,
  },

  /*
  |--------------------------------------------------------------------------
  | INPUT
  |--------------------------------------------------------------------------
  */

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

  textArea: {
    height: 110,
    paddingTop: 14,
    paddingBottom: 14,
  },

  addressInput: {
    height: 90,
    paddingTop: 14,
  },

  counter: {
    fontSize: rf(9),
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },

  /*
  |--------------------------------------------------------------------------
  | READ ONLY
  |--------------------------------------------------------------------------
  */

  readOnlyField: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
  },

  readOnlyText: {
    fontSize: rf(14),
    color: '#111',
    fontWeight: '600',
  },

  lockBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /*
  |--------------------------------------------------------------------------
  | DROPDOWN
  |--------------------------------------------------------------------------
  */

  dropdown: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },

  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  dropText: {
    fontSize: rf(14),
    color: '#111',
    fontWeight: '500',
  },

  placeholderText: {
    color: '#9CA3AF',
  },

  options: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },

  option: {
    minHeight: 46,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  optionText: {
    fontSize: rf(13),
    color: '#111',
  },

  optionTextActive: {
    color: '#1B7A2E',
    fontWeight: '800',
  },

  /*
  |--------------------------------------------------------------------------
  | PHOTO
  |--------------------------------------------------------------------------
  */

  uploadBox: {
    height: 160,
    borderWidth: 1.5,
    borderColor: '#1B7A2E',
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBFEF9',
    position: 'relative',
  },

  uploadBoxActive: {
    borderStyle: 'solid',
    backgroundColor: '#F6FBF3',
  },

  camCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoPreview: {
    width: 145,
    height: 90,
  },

  removePhoto: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadTitle: {
    fontSize: rf(14),
    fontWeight: '800',
    color: '#111',
    marginTop: 8,
  },

  uploadSub: {
    fontSize: rf(11),
    color: '#9CA3AF',
    marginTop: 2,
  },

  /*
  |--------------------------------------------------------------------------
  | ENGINE
  |--------------------------------------------------------------------------
  */

  powerRow: {
    flexDirection: 'row',
    gap: 10,
  },

  powerInput: {
    flex: 1,
  },

  unitDropdown: {
    width: 105,
  },

  /*
  |--------------------------------------------------------------------------
  | DRIVE
  |--------------------------------------------------------------------------
  */

  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  choiceBtn: {
    minWidth: 72,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    backgroundColor: '#fff',
  },

  choiceBtnActive: {
    borderColor: '#1B7A2E',
    backgroundColor: '#EAF6E8',
  },

  choiceText: {
    fontSize: rf(12),
    color: '#6B7280',
    fontWeight: '700',
  },

  choiceTextActive: {
    color: '#1B7A2E',
  },

  /*
  |--------------------------------------------------------------------------
  | IMPLEMENTS
  |--------------------------------------------------------------------------
  */

  implementQuestion: {
    fontSize: rf(12),
    color: '#6B7280',
    marginBottom: 10,
  },

  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },

  toggleBtn: {
    flex: 1,
    height: 46,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  toggleActive: {
    backgroundColor: '#1B7A2E',
    borderColor: '#1B7A2E',
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioActive: {
    borderColor: '#fff',
  },

  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  toggleText: {
    fontWeight: '700',
    color: '#6B7280',
    fontSize: rf(13),
  },

  toggleTextActive: {
    color: '#fff',
  },

  implementContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAF7',
    borderRadius: 14,
  },

  implementSub: {
    fontSize: rf(11),
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 9,
  },

  implementWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  implementChip: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  implementChipActive: {
    backgroundColor: '#EAF6E8',
    borderColor: '#1B7A2E',
  },

  implementText: {
    fontSize: rf(11),
    color: '#6B7280',
    fontWeight: '600',
  },

  implementTextActive: {
    color: '#1B7A2E',
    fontWeight: '800',
  },

  /*
  |--------------------------------------------------------------------------
  | LOCATION
  |--------------------------------------------------------------------------
  */

  locationInfo: {
    fontSize: rf(11),
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 4,
  },

  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F6FBF3',
    borderWidth: 1,
    borderColor: '#DCEED7',
  },

  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryText: {
    flex: 1,
    marginLeft: 10,
  },

  summaryTitle: {
    fontSize: rf(12),
    color: '#111',
    fontWeight: '800',
  },

  summarySub: {
    fontSize: rf(10),
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 14,
  },

  /*
  |--------------------------------------------------------------------------
  | BUTTON
  |--------------------------------------------------------------------------
  */

  primaryBtn: {
    backgroundColor: '#1B7A2E',
    height: 54,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    flexDirection: 'row',
    gap: 8,
  },

  primaryText: {
    color: '#fff',
    fontSize: rf(16),
    fontWeight: '800',
  },
});