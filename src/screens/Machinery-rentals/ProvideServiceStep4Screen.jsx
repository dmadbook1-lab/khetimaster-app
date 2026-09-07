import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  ArrowLeft,
  ChevronDown,
  Clock,
  CalendarDays,
  Gauge,
  Fuel,
  Settings2,
  MapPin,
  FileText,
  Tractor,
  Check,
  Rocket,
  Plus,
  X,
} from 'lucide-react-native';

import {useDispatch, useSelector} from 'react-redux';

import {createMachinery} from '../../redux/slices/machinerySlice';

const {width} = Dimensions.get('window');

const rf = s =>
  Math.max(
    s - 2,
    Math.min((s * width) / 390, s + 2),
  );

/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

const POWER_UNITS = ['HP', 'kW', 'CC'];

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
  'Trailer',
  'Plough',
  'Sprayer',
  'Harvester',
  'Other',
];

const CUSTOM_UNITS = [
  'hour',
  'day',
  'job',
  'acre',
  'custom',
];

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function ProvideServiceStep4Screen({
  navigation,
  route,
}) {
  const dispatch = useDispatch();

  const {
    isCreating,
    error: machineryError,
  } = useSelector(
    state => state.machinery || {},
  );

  const params = route?.params || {};

  /*
  |--------------------------------------------------------------------------
  | STEP 3 DATA
  |--------------------------------------------------------------------------
  */

  const machineType =
    params.machineType || 'tractor';

  const category = useMemo(() => {
    const categoryMap = {
      tractor: 'Tractor',
      rotavator: 'Rotavator',
      cultivator: 'Cultivator',
      harvester: 'Harvester',
      trolley: 'Trolley',
      seedrill: 'Seed Drill',
      sprayer: 'Sprayer',
      other: 'Other',
    };

    return (
      params.category ||
      categoryMap[machineType] ||
      'Other'
    );
  }, [machineType, params.category]);

  /*
  |--------------------------------------------------------------------------
  | BASIC DETAILS
  |--------------------------------------------------------------------------
  */

  // Added Owner Name received from Step 3 params
  const [ownerName, setOwnerName] = useState(
    params.ownerName || '',
  );

  const [name, setName] = useState(
    params.name || category,
  );

  const [model, setModel] = useState(
    params.model || '',
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
      params.enginePower?.value
        ? String(params.enginePower.value)
        : '',
    );

  const [enginePowerUnit, setEnginePowerUnit] =
    useState(
      params.enginePower?.unit || 'HP',
    );

  const [showPowerUnit, setShowPowerUnit] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | FUEL
  |--------------------------------------------------------------------------
  */

  const [fuelType, setFuelType] =
    useState(
      params.fuelType || 'diesel',
    );

  const [showFuel, setShowFuel] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | DRIVE
  |--------------------------------------------------------------------------
  */

  const [driveType, setDriveType] =
    useState(
      params.driveType || '2WD',
    );

  const [showDrive, setShowDrive] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | IMPLEMENTS
  |--------------------------------------------------------------------------
  */

  const [
    supportsImplements,
    setSupportsImplements,
  ] = useState(
    params.supportsImplements ??
      false,
  );

  const [
    supportedImplements,
    setSupportedImplements,
  ] = useState(
    params.supportedImplements || [],
  );

  /*
  |--------------------------------------------------------------------------
  | AVAILABILITY
  |--------------------------------------------------------------------------
  */

  const [availability, setAvailability] =
    useState(
      params.availability ||
        'available',
    );

  /*
  |--------------------------------------------------------------------------
  | PRICING
  |--------------------------------------------------------------------------
  */

  const [hourlyPrice, setHourlyPrice] =
    useState(
      params.pricing?.hourly
        ? String(
            params.pricing.hourly,
          )
        : '',
    );

  const [dailyPrice, setDailyPrice] =
    useState(
      params.pricing?.daily
        ? String(
            params.pricing.daily,
          )
        : '',
    );

  const [customPricing, setCustomPricing] =
    useState(
      params.pricing?.custom || [],
    );

  /*
  |--------------------------------------------------------------------------
  | LOCATION
  |--------------------------------------------------------------------------
  */

  const [state, setState] =
    useState(params.state || '');

  const [district, setDistrict] =
    useState(params.district || '');

  const [village, setVillage] =
    useState(params.village || '');

  const [address, setAddress] =
    useState(params.address || '');

  /*
  |--------------------------------------------------------------------------
  | OWNER NOTES
  |--------------------------------------------------------------------------
  */

  const [ownerNotes, setOwnerNotes] =
    useState(
      params.ownerNotes || '',
    );

  /*
  |--------------------------------------------------------------------------
  | DROPDOWNS
  |--------------------------------------------------------------------------
  */

  const [showCustomUnit, setShowCustomUnit] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | CUSTOM PRICING
  |--------------------------------------------------------------------------
  */

  const addCustomPricing = () => {
    setCustomPricing(prev => [
      ...prev,
      {
        name: '',
        amount: '',
        unit: 'custom',
      },
    ]);
  };

  const removeCustomPricing = index => {
    setCustomPricing(prev =>
      prev.filter(
        (_, i) => i !== index,
      ),
    );
  };

  const updateCustomPricing = (
    index,
    field,
    value,
  ) => {
    setCustomPricing(prev =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  /*
  |--------------------------------------------------------------------------
  | IMPLEMENT TOGGLE
  |--------------------------------------------------------------------------
  */

  const toggleImplement =
    implement => {
      setSupportedImplements(
        prev => {
          if (
            prev.includes(
              implement,
            )
          ) {
            return prev.filter(
              item =>
                item !== implement,
            );
          }

          return [
            ...prev,
            implement,
          ];
        },
      );
    };

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    if (!ownerName.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the machinery owner name.',
      );
      return false;
    }

    if (!name.trim()) {
      Alert.alert(
        'Missing Information',
        'Please enter the machinery name.',
      );
      return false;
    }

    if (
      hourlyPrice.trim() === '' &&
      dailyPrice.trim() === '' &&
      customPricing.length === 0
    ) {
      Alert.alert(
        'Missing Pricing',
        'Please enter at least one rental price.',
      );
      return false;
    }

    for (
      let i = 0;
      i < customPricing.length;
      i++
    ) {
      const item =
        customPricing[i];

      if (
        !item.name ||
        !item.name.trim()
      ) {
        Alert.alert(
          'Custom Pricing',
          `Please enter a name for Custom Option ${
            i + 1
          }.`,
        );
        return false;
      }

      if (
        item.amount === '' ||
        Number(item.amount) < 0 ||
        Number.isNaN(
          Number(item.amount),
        )
      ) {
        Alert.alert(
          'Custom Pricing',
          `Please enter a valid amount for Custom Option ${
            i + 1
          }.`,
        );
        return false;
      }
    }

    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE BACKEND PAYLOAD
  |--------------------------------------------------------------------------
  */

  const createPayload = () => {
    return {
      ownerName: ownerName.trim(),

      name: name.trim(),

      category,

      brand: params.brand || '',

      model: model.trim(),

      modelYear: params.modelYear
        ? Number(params.modelYear)
        : params.year
        ? Number(params.year)
        : null,

      description:
        description.trim(),

      images:
        Array.isArray(params.images)
          ? params.images
          : [],

      enginePower: {
        value:
          enginePower.trim() === ''
            ? 0
            : Number(enginePower),

        unit: enginePowerUnit,
      },

      fuelType,

      driveType,

      supportsImplements,

      supportedImplements:
        supportsImplements
          ? supportedImplements
          : [],

      availability,

      availableFrom:
        params.availableFrom ||
        null,

      availableUntil:
        params.availableUntil ||
        null,

      state: state.trim(),

      district:
        district.trim(),

      village:
        village.trim(),

      address:
        address.trim(),

      pricing: {
        hourly:
          hourlyPrice.trim() === ''
            ? 0
            : Number(hourlyPrice),

        daily:
          dailyPrice.trim() === ''
            ? 0
            : Number(dailyPrice),

        custom:
          customPricing.map(
            item => ({
              name:
                item.name.trim(),

              amount:
                Number(
                  item.amount,
                ),

              unit: item.unit,
            }),
          ),
      },

      ownerNotes:
        ownerNotes.trim(),

      isActive: true,
    };
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT TO BACKEND
  |--------------------------------------------------------------------------
  */

  const handleContinue = async () => {
    if (isCreating) {
      return;
    }

    const valid =
      validateForm();

    if (!valid) {
      return;
    }

    const payload =
      createPayload();

    try {
      const result =
        await dispatch(
          createMachinery(
            payload,
          ),
        ).unwrap();

      const createdMachinery =
        result?.machinery ||
        null;

      navigation.replace(
        'ProvideServiceSuccess',
        {
          machinery:
            createdMachinery,
        },
      );
    } catch (error) {
      Alert.alert(
        'Unable to Start Service',
        typeof error === 'string'
          ? error
          : machineryError ||
              'Something went wrong while creating your machinery listing.',
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={[
        'top',
        'bottom',
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          style={styles.backBtn}
          disabled={isCreating}
        >
          <ArrowLeft
            size={20}
            color="#111"
            strokeWidth={2.2}
          />
        </TouchableOpacity>

        <Text
          style={
            styles.headerTitle
          }
        >
          Provide Service
        </Text>

        <View
          style={
            styles.stepWrap
          }
        >
          <Text
            style={
              styles.stepText
            }
          >
            Step 4 of 4
          </Text>

          <View
            style={
              styles.progressRow
            }
          >
            {[1, 2, 3, 4].map(
              item => (
                <View
                  key={item}
                  style={[
                    styles.dot,
                    styles.dotActive,
                  ]}
                />
              ),
            )}
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={
            styles.centerWrap
          }
        >
          <View
            style={styles.iconBox}
          >
            <Tractor
              size={32}
              color="#1B7A2E"
              strokeWidth={2}
            />
          </View>

          <Text
            style={styles.title}
          >
            Complete Machinery Details
          </Text>

          <Text
            style={styles.sub}
          >
            Add the remaining details required to
            list your machinery.
          </Text>
        </View>

        <SectionTitle
          icon={FileText}
          title="Basic Information"
        />

        {/* OWNER NAME INPUT */}
        <FieldLabel
          text="Owner Name"
        />

        <TextInput
          value={ownerName}
          onChangeText={setOwnerName}
          placeholder="Enter machinery owner's name"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <FieldLabel
          text="Machinery Name"
        />

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Mahindra Tractor"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <View
          style={styles.infoCard}
        >
          <View
            style={
              styles.infoIcon
            }
          >
            <Tractor
              size={18}
              color="#1B7A2E"
            />
          </View>

          <View
            style={{flex: 1}}
          >
            <Text
              style={
                styles.infoTitle
              }
            >
              Category
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              {category}
            </Text>
          </View>
        </View>

        <FieldLabel text="Model" />

        <TextInput
          value={model}
          onChangeText={setModel}
          placeholder="e.g. 575 DI"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <FieldLabel text="Brand" />

        <View
          style={
            styles.readOnlyInput
          }
        >
          <Text
            style={[
              styles.readOnlyText,
              !params.brand && {
                color:
                  '#9CA3AF',
              },
            ]}
          >
            {params.brand ||
              'Not selected'}
          </Text>
        </View>

        <FieldLabel
          text="Model Year"
        />

        <View
          style={
            styles.readOnlyInput
          }
        >
          <Text
            style={
              styles.readOnlyText
            }
          >
            {params.modelYear ||
              params.year ||
              'Not selected'}
          </Text>
        </View>

        <FieldLabel
          text="Description"
        />

        <TextInput
          value={description}
          onChangeText={
            setDescription
          }
          placeholder="Describe your machinery..."
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          style={[
            styles.input,
            styles.textArea,
          ]}
        />

        <SectionTitle
          icon={Gauge}
          title="Engine Specifications"
        />

        <FieldLabel
          text="Engine Power"
        />

        <View
          style={
            styles.powerRow
          }
        >
          <TextInput
            value={enginePower}
            onChangeText={
              setEnginePower
            }
            placeholder="e.g. 50"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            style={[
              styles.input,
              styles.powerInput,
            ]}
          />

          <View
            style={
              styles.dropdownContainer
            }
          >
            <TouchableOpacity
              style={
                styles.dropdown
              }
              onPress={() =>
                setShowPowerUnit(
                  !showPowerUnit,
                )
              }
            >
              <Text
                style={
                  styles.dropText
                }
              >
                {
                  enginePowerUnit
                }
              </Text>

              <ChevronDown
                size={18}
                color="#6B7280"
              />
            </TouchableOpacity>

            {showPowerUnit && (
              <View
                style={
                  styles.dropdownOptions
                }
              >
                {POWER_UNITS.map(
                  unit => (
                    <TouchableOpacity
                      key={unit}
                      style={
                        styles.option
                      }
                      onPress={() => {
                        setEnginePowerUnit(
                          unit,
                        );
                        setShowPowerUnit(
                          false,
                        );
                      }}
                    >
                      <Text
                        style={
                          styles.optionText
                        }
                      >
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            )}
          </View>
        </View>

        <FieldLabel
          text="Fuel Type"
        />

        <View
          style={
            styles.dropdownContainerFull
          }
        >
          <TouchableOpacity
            style={
              styles.dropdown
            }
            onPress={() =>
              setShowFuel(
                !showFuel,
              )
            }
          >
            <View
              style={
                styles.dropdownLeft
              }
            >
              <Fuel
                size={17}
                color="#6B7280"
              />

              <Text
                style={
                  styles.dropText
                }
              >
                {
                  FUEL_TYPES.find(
                    item =>
                      item.value ===
                      fuelType,
                  )?.label
                }
              </Text>
            </View>

            <ChevronDown
              size={18}
              color="#6B7280"
            />
          </TouchableOpacity>

          {showFuel && (
            <View
              style={
                styles.dropdownOptions
              }
            >
              {FUEL_TYPES.map(
                item => (
                  <TouchableOpacity
                    key={
                      item.value
                    }
                    style={
                      styles.option
                    }
                    onPress={() => {
                      setFuelType(
                        item.value,
                      );
                      setShowFuel(
                        false,
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.optionText
                      }
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          )}
        </View>

        <FieldLabel
          text="Drive Type"
        />

        <View
          style={
            styles.dropdownContainerFull
          }
        >
          <TouchableOpacity
            style={
              styles.dropdown
            }
            onPress={() =>
              setShowDrive(
                !showDrive,
              )
            }
          >
            <View
              style={
                styles.dropdownLeft
              }
            >
              <Settings2
                size={17}
                color="#6B7280"
              />

              <Text
                style={
                  styles.dropText
                }
              >
                {driveType}
              </Text>
            </View>

            <ChevronDown
              size={18}
              color="#6B7280"
            />
          </TouchableOpacity>

          {showDrive && (
            <View
              style={
                styles.dropdownOptions
              }
            >
              {DRIVE_TYPES.map(
                type => (
                  <TouchableOpacity
                    key={type}
                    style={
                      styles.option
                    }
                    onPress={() => {
                      setDriveType(
                        type,
                      );
                      setShowDrive(
                        false,
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.optionText
                      }
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          )}
        </View>

        <SectionTitle
          icon={Settings2}
          title="Supported Implements"
        />

        <Text
          style={
            styles.helperText
          }
        >
          Does this machinery support
          additional implements?
        </Text>

        <View
          style={
            styles.toggleRow
          }
        >
          <TouchableOpacity
            onPress={() =>
              setSupportsImplements(
                true,
              )
            }
            style={[
              styles.toggleBtn,
              supportsImplements &&
                styles.toggleActive,
            ]}
          >
            <View
              style={[
                styles.radio,
                supportsImplements &&
                  styles.radioActive,
              ]}
            >
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
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSupportsImplements(
                false,
              );
              setSupportedImplements(
                [],
              );
            }}
            style={[
              styles.toggleBtn,
              !supportsImplements &&
                styles.toggleActive,
            ]}
          >
            <View
              style={[
                styles.radio,
                !supportsImplements &&
                  styles.radioActive,
              ]}
            >
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
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>

        {supportsImplements && (
          <View
            style={
              styles.implementsWrap
            }
          >
            {IMPLEMENTS.map(
              implement => {
                const active =
                  supportedImplements.includes(
                    implement,
                  );

                return (
                  <TouchableOpacity
                    key={
                      implement
                    }
                    onPress={() =>
                      toggleImplement(
                        implement,
                      )
                    }
                    style={[
                      styles.implementChip,
                      active &&
                        styles.implementChipActive,
                    ]}
                  >
                    {active && (
                      <Check
                        size={13}
                        color="#fff"
                        strokeWidth={
                          3
                        }
                      />
                    )}

                    <Text
                      style={[
                        styles.implementText,
                        active &&
                          styles.implementTextActive,
                      ]}
                    >
                      {
                        implement
                      }
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        )}

        <SectionTitle
          icon={CalendarDays}
          title="Availability"
        />

        <View
          style={
            styles.availabilityRow
          }
        >
          <AvailabilityButton
            title="Available"
            active={
              availability ===
              'available'
            }
            onPress={() =>
              setAvailability(
                'available',
              )
            }
          />

          <AvailabilityButton
            title="Unavailable"
            active={
              availability ===
              'unavailable'
            }
            onPress={() =>
              setAvailability(
                'unavailable',
              )
            }
          />

          <AvailabilityButton
            title="Busy"
            active={
              availability ===
              'busy'
            }
            onPress={() =>
              setAvailability(
                'busy',
              )
            }
          />
        </View>

        <SectionTitle
          icon={Clock}
          title="Rental Pricing"
        />

        <Text
          style={
            styles.helperText
          }
        >
          Add the prices you want to charge
          farmers.
        </Text>

        <PriceInput
          icon={Clock}
          label="Per Hour"
          value={hourlyPrice}
          onChangeText={
            setHourlyPrice
          }
          placeholder="500"
        />

        <PriceInput
          icon={CalendarDays}
          label="Per Day"
          value={dailyPrice}
          onChangeText={
            setDailyPrice
          }
          placeholder="3500"
        />

        <View
          style={
            styles.customHeader
          }
        >
          <Text
            style={
              styles.customTitle
            }
          >
            Custom Pricing
          </Text>

          <TouchableOpacity
            onPress={
              addCustomPricing
            }
            style={
              styles.addBtn
            }
          >
            <Plus
              size={15}
              color="#1B7A2E"
            />

            <Text
              style={
                styles.addText
              }
            >
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {customPricing.map(
          (item, index) => (
            <View
              key={index}
              style={
                styles.customCard
              }
            >
              <View
                style={
                  styles.customCardHeader
                }
              >
                <Text
                  style={
                    styles.customCardTitle
                  }
                >
                  Custom Option{' '}
                  {index + 1}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    removeCustomPricing(
                      index,
                    )
                  }
                >
                  <X
                    size={18}
                    color="#DC2626"
                  />
                </TouchableOpacity>
              </View>

              <TextInput
                value={item.name}
                onChangeText={value =>
                  updateCustomPricing(
                    index,
                    'name',
                    value,
                  )
                }
                placeholder="e.g. With Rotavator"
                placeholderTextColor="#9CA3AF"
                style={
                  styles.input
                }
              />

              <View
                style={
                  styles.customPriceRow
                }
              >
                <TextInput
                  value={String(
                    item.amount,
                  )}
                  onChangeText={value =>
                    updateCustomPricing(
                      index,
                      'amount',
                      value,
                    )
                  }
                  placeholder="Amount"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    {
                      flex: 1,
                    },
                  ]}
                />

                <View
                  style={
                    styles.unitContainer
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.unitDropdown
                    }
                    onPress={() =>
                      setShowCustomUnit(
                        showCustomUnit ===
                          index
                          ? null
                          : index,
                      )
                    }
                  >
                    <Text
                      style={
                        styles.dropText
                      }
                    >
                      {
                        item.unit
                      }
                    </Text>

                    <ChevronDown
                      size={16}
                      color="#6B7280"
                    />
                  </TouchableOpacity>

                  {showCustomUnit ===
                    index && (
                    <View
                      style={
                        styles.customUnitOptions
                      }
                    >
                      {CUSTOM_UNITS.map(
                        unit => (
                          <TouchableOpacity
                            key={
                              unit
                            }
                            style={
                              styles.option
                            }
                            onPress={() => {
                              updateCustomPricing(
                                index,
                                'unit',
                                unit,
                              );

                              setShowCustomUnit(
                                null,
                              );
                            }}
                          >
                            <Text
                              style={
                                styles.optionText
                              }
                            >
                              {
                                unit
                              }
                            </Text>
                          </TouchableOpacity>
                        ),
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>
          ),
        )}

        <SectionTitle
          icon={MapPin}
          title="Machinery Location"
        />

        <FieldLabel text="State" />

        <TextInput
          value={state}
          onChangeText={setState}
          placeholder="e.g. Maharashtra"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <FieldLabel
          text="District"
        />

        <TextInput
          value={district}
          onChangeText={setDistrict}
          placeholder="e.g. Pune"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <FieldLabel
          text="Village"
        />

        <TextInput
          value={village}
          onChangeText={setVillage}
          placeholder="e.g. Khed"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <FieldLabel
          text="Address"
        />

        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter complete address"
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          style={[
            styles.input,
            styles.addressInput,
          ]}
        />

        <SectionTitle
          icon={FileText}
          title="Owner Notes"
        />

        <TextInput
          value={ownerNotes}
          onChangeText={
            setOwnerNotes
          }
          placeholder="Add any additional information for farmers..."
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          style={[
            styles.input,
            styles.notesInput,
          ]}
        />

        <View
          style={
            styles.summaryCard
          }
        >
          <View
            style={
              styles.summaryIcon
            }
          >
            <Check
              size={18}
              color="#1B7A2E"
              strokeWidth={3}
            />
          </View>

          <View
            style={{flex: 1}}
          >
            <Text
              style={
                styles.summaryTitle
              }
            >
              Ready to list
            </Text>

            <Text
              style={
                styles.summarySub
              }
            >
              Your machinery details will be
              submitted for listing.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={isCreating}
          style={[
            styles.primaryBtn,
            isCreating &&
              styles.primaryBtnDisabled,
          ]}
          onPress={
            handleContinue
          }
        >
          {isCreating ? (
            <>
              <ActivityIndicator
                size="small"
                color="#fff"
              />

              <Text
                style={
                  styles.primaryText
                }
              >
                Creating Listing...
              </Text>
            </>
          ) : (
            <>
              <Rocket
                size={18}
                color="#fff"
                strokeWidth={2.3}
              />

              <Text
                style={
                  styles.primaryText
                }
              >
                Start Service
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text
          style={styles.note}
        >
          Your machinery listing will be
          created with the details above.
        </Text>

        <View
          style={{height: 50}}
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
  icon: Icon,
  title,
}) => (
  <View
    style={styles.sectionTitle}
  >
    <View
      style={styles.sectionIcon}
    >
      <Icon
        size={16}
        color="#1B7A2E"
        strokeWidth={2.2}
      />
    </View>

    <Text
      style={styles.sectionText}
    >
      {title}
    </Text>
  </View>
);

/*
|--------------------------------------------------------------------------
| FIELD LABEL
|--------------------------------------------------------------------------
*/

const FieldLabel = ({text}) => (
  <Text style={styles.label}>
    {text}
  </Text>
);

/*
|--------------------------------------------------------------------------
| PRICE INPUT
|--------------------------------------------------------------------------
*/

const PriceInput = ({
  icon: Icon,
  label,
  value,
  onChangeText,
  placeholder,
}) => (
  <View
    style={styles.priceCard}
  >
    <View
      style={styles.priceLeft}
    >
      <View
        style={styles.priceIcon}
      >
        <Icon
          size={17}
          color="#1B7A2E"
        />
      </View>

      <Text
        style={styles.priceLabel}
      >
        {label}
      </Text>
    </View>

    <View
      style={styles.priceInputWrap}
    >
      <Text style={styles.rupee}>
        ₹
      </Text>

      <TextInput
        value={value}
        onChangeText={
          onChangeText
        }
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType="numeric"
        style={
          styles.priceInput
        }
      />
    </View>
  </View>
);

/*
|--------------------------------------------------------------------------
| AVAILABILITY BUTTON
|--------------------------------------------------------------------------
*/

const AvailabilityButton = ({
  title,
  active,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.availabilityBtn,
      active &&
        styles.availabilityBtnActive,
    ]}
  >
    {active && (
      <Check
        size={13}
        color="#fff"
        strokeWidth={3}
      />
    )}

    <Text
      style={[
        styles.availabilityText,
        active &&
          styles.availabilityTextActive,
      ]}
    >
      {title}
    </Text>
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
    borderColor: '#EEEEEE',
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

  centerWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },

  iconBox: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: rf(21),
    fontWeight: '900',
    color: '#111',
    marginTop: 12,
    textAlign: 'center',
  },

  sub: {
    fontSize: rf(12),
    color: '#6B7280',
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  },

  sectionText: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#111',
  },

  label: {
    fontSize: rf(13),
    fontWeight: '700',
    color: '#111',
    marginTop: 12,
    marginBottom: 7,
  },

  helperText: {
    fontSize: rf(12),
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 10,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    color: '#111',
    fontSize: rf(14),
  },

  textArea: {
    height: 100,
    paddingTop: 13,
  },

  addressInput: {
    height: 82,
    paddingTop: 13,
  },

  notesInput: {
    height: 100,
    paddingTop: 13,
  },

  readOnlyInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },

  readOnlyText: {
    fontSize: rf(14),
    color: '#111',
    fontWeight: '500',
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    backgroundColor: '#F9FCF7',
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoTitle: {
    fontSize: rf(11),
    color: '#6B7280',
  },

  infoValue: {
    fontSize: rf(14),
    color: '#111',
    fontWeight: '800',
    marginTop: 2,
  },

  powerRow: {
    flexDirection: 'row',
    gap: 10,
  },

  powerInput: {
    flex: 1,
  },

  dropdownContainer: {
    width: 105,
    position: 'relative',
    zIndex: 30,
  },

  dropdownContainerFull: {
    position: 'relative',
    zIndex: 20,
  },

  dropdown: {
    height: 50,
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
    fontWeight: '600',
  },

  dropdownOptions: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 100,
    elevation: 5,
  },

  option: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  optionText: {
    fontSize: rf(13),
    color: '#111',
  },

  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },

  toggleBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  toggleActive: {
    backgroundColor: '#1B7A2E',
    borderColor: '#1B7A2E',
  },

  radio: {
    width: 17,
    height: 17,
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
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  toggleText: {
    fontSize: rf(13),
    fontWeight: '700',
    color: '#6B7280',
  },

  toggleTextActive: {
    color: '#fff',
  },

  implementsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },

  implementChip: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
  },

  implementChipActive: {
    backgroundColor: '#1B7A2E',
    borderColor: '#1B7A2E',
  },

  implementText: {
    fontSize: rf(12),
    fontWeight: '600',
    color: '#374151',
  },

  implementTextActive: {
    color: '#fff',
  },

  availabilityRow: {
    flexDirection: 'row',
    gap: 8,
  },

  availabilityBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },

  availabilityBtnActive: {
    backgroundColor: '#1B7A2E',
    borderColor: '#1B7A2E',
  },

  availabilityText: {
    fontSize: rf(12),
    color: '#6B7280',
    fontWeight: '700',
  },

  availabilityTextActive: {
    color: '#fff',
  },

  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    marginTop: 9,
    backgroundColor: '#fff',
  },

  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  priceIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  priceLabel: {
    fontSize: rf(13),
    fontWeight: '700',
    color: '#111',
  },

  priceInputWrap: {
    width: 105,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  rupee: {
    fontSize: rf(14),
    fontWeight: '800',
    color: '#1B7A2E',
  },

  priceInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 5,
    color: '#111',
    fontSize: rf(14),
    fontWeight: '700',
  },

  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },

  customTitle: {
    fontSize: rf(13),
    fontWeight: '800',
    color: '#111',
  },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF6E8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },

  addText: {
    fontSize: rf(12),
    color: '#1B7A2E',
    fontWeight: '800',
  },

  customCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    backgroundColor: '#FAFCF9',
  },

  customCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  customCardTitle: {
    fontSize: rf(12),
    fontWeight: '800',
    color: '#111',
  },

  customPriceRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },

  unitContainer: {
    width: 115,
    position: 'relative',
    zIndex: 50,
  },

  unitDropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  customUnitOptions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 5,
    zIndex: 100,
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F6FBF3',
    borderWidth: 1,
    borderColor: '#DCEED8',
    borderRadius: 14,
    padding: 14,
    marginTop: 24,
  },

  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DFF1D9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryTitle: {
    fontSize: rf(13),
    fontWeight: '800',
    color: '#111',
  },

  summarySub: {
    fontSize: rf(11),
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },

  primaryBtn: {
    height: 54,
    borderRadius: 28,
    backgroundColor: '#1B7A2E',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },

  primaryBtnDisabled: {
    opacity: 0.7,
  },

  primaryText: {
    color: '#fff',
    fontSize: rf(16),
    fontWeight: '800',
  },

  note: {
    textAlign: 'center',
    fontSize: rf(11),
    color: '#9CA3AF',
    marginTop: 10,
    lineHeight: 16,
  },
});