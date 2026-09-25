import React, {useCallback, useEffect, useMemo, useState, memo} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  CreditCard,
  Home,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchNurseryCart} from '../../redux/slices/nurseryCartSlice';
import {createNurseryOrder} from '../../redux/slices/nurseryOrderSlice';

const GREEN = '#159447';
const DARK = '#151C2B';
const BG = '#F6F8F7';
const WHITE = '#FFFFFF';
const MUTED = '#747B78';
const BORDER = '#E2E8E4';
const LIGHT_GREEN = '#EAF7EF';
const RED = '#D64545';

/* ---------- Memoized Input ---------- */
const FormInput = memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    icon: Icon,
    keyboardType = 'default',
    error,
    multiline = false,
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          error && styles.inputError,
          multiline && styles.multilineWrapper,
        ]}>
        <Icon size={16} color={error ? RED : MUTED} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0A7A4"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[styles.input, multiline && styles.multilineInput]}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  ),
);

/* ---------- Memoized Order Item ---------- */
const OrderItemRow = memo(({item, isLast}) => {
  const plant = item?.plant || {};
  const image = item?.image || plant?.images?.[0] || null;
  const name = item?.name || plant?.name || 'Plant';
  const quantity = Number(item?.quantity || 1);
  const price = Number(item?.price || plant?.price || 0);

  return (
    <View style={[styles.orderItem, isLast && styles.lastOrderItem]}>
      {image ? (
        <Image source={{uri: image}} style={styles.itemImage} />
      ) : (
        <View style={styles.itemImagePlaceholder}>
          <Package size={19} color={GREEN} />
        </View>
      )}
      <View style={styles.itemDetails}>
        <Text numberOfLines={2} style={styles.itemName}>
          {name}
        </Text>
        <Text style={styles.itemQuantity}>Qty: {quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>
        ₹{(price * quantity).toLocaleString('en-IN')}
      </Text>
    </View>
  );
});

const NurseryCheckoutScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const {
    items = [],
    subtotal = 0,
    totalItems = 0,
    loading: cartLoading,
  } = useSelector(state => state.nurseryCart);

  const {creating, error: orderError} = useSelector(
    state => state.nurseryOrder,
  );

  const user = useSelector(
    state => state.auth?.user || state.auth?.profile || null,
  );

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [village, setVillage] = useState('');
  const [taluka, setTaluka] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchNurseryCart());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || user.name || '');
    setPhoneNumber(user.phoneNumber || user.phone || '');
    setVillage(user.village || '');
    setTaluka(user.taluka || '');
    setDistrict(user.district || '');
    setStateName(user.state || '');
  }, [user]);

  const {deliveryFee, total} = useMemo(() => {
    const fee = Number(subtotal) >= 500 ? 0 : 50;
    return {deliveryFee: fee, total: Number(subtotal) + fee};
  }, [subtotal]);

  const validate = useCallback(() => {
    const nextErrors = {};
    if (!fullName.trim()) nextErrors.fullName = 'Enter your full name';
    if (!phoneNumber.trim()) nextErrors.phoneNumber = 'Enter your phone number';
    else if (!/^[6-9]\d{9}$/.test(phoneNumber.trim()))
      nextErrors.phoneNumber = 'Enter a valid 10-digit phone number';
    if (!address.trim()) nextErrors.address = 'Enter your delivery address';
    if (!village.trim()) nextErrors.village = 'Enter your village';
    if (!taluka.trim()) nextErrors.taluka = 'Enter your taluka';
    if (!district.trim()) nextErrors.district = 'Enter your district';
    if (!stateName.trim()) nextErrors.state = 'Enter your state';
    if (!pincode.trim()) nextErrors.pincode = 'Enter your pincode';
    else if (!/^\d{6}$/.test(pincode.trim()))
      nextErrors.pincode = 'Enter a valid 6-digit pincode';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [
    fullName,
    phoneNumber,
    address,
    village,
    taluka,
    district,
    stateName,
    pincode,
  ]);

  const handlePlaceOrder = useCallback(async () => {
    if (!validate()) return;
    if (!items || items.length === 0) {
      Alert.alert(
        'Cart is empty',
        'Please add plants to your cart before checkout.',
      );
      return;
    }

    const deliveryAddress = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      village: village.trim(),
      taluka: taluka.trim(),
      district: district.trim(),
      state: stateName.trim(),
      pincode: pincode.trim(),
    };

    try {
      const result = await dispatch(
        createNurseryOrder(deliveryAddress),
      ).unwrap();
      const order = result?.order || result?.data || result;
      const orderId = order?._id || order?.id;

      Alert.alert(
        'Order placed successfully',
        'Your plant order has been placed with Cash on Delivery.',
        [
          {
            text: 'View Order',
            onPress: () => {
              if (orderId) {
                navigation.replace('NurseryOrderDetails', {orderId});
              } else {
                navigation.replace('NurseryOrders');
              }
            },
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      Alert.alert(
        'Unable to place order',
        error?.message || 'Something went wrong. Please try again.',
      );
    }
  }, [
    validate,
    items,
    fullName,
    phoneNumber,
    address,
    village,
    taluka,
    district,
    stateName,
    pincode,
    dispatch,
    navigation,
  ]);

  if (!cartLoading && (!items || items.length === 0)) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={DARK} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Checkout</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <ShoppingBag size={40} color={GREEN} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Add some plants before proceeding to checkout.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={() => navigation.navigate('NurseryHome')}>
            <Text style={styles.primaryButtonText}>Browse Plants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* HEADER */}
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color={DARK} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.topTitle}>Checkout</Text>
            <Text style={styles.topSubtitle}>
              {totalItems} item{totalItems === 1 ? '' : 's'}
            </Text>
          </View>

          <View style={styles.codHeader}>
            <Truck size={16} color={GREEN} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          {/* ORDER SUMMARY */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Package size={16} color={GREEN} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <Text style={styles.sectionSubtitle}>
                  {totalItems} item{totalItems === 1 ? '' : 's'} in your cart
                </Text>
              </View>
            </View>

            {items.map((item, index) => (
              <OrderItemRow
                key={String(
                  item?._id || item?.id || item?.plant?._id || index,
                )}
                item={item}
                isLast={index === items.length - 1}
              />
            ))}
          </View>

          {/* DELIVERY ADDRESS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MapPin size={16} color={GREEN} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <Text style={styles.sectionSubtitle}>
                  Where should we deliver?
                </Text>
              </View>
            </View>

            <FormInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              icon={CircleUserRound}
              error={errors.fullName}
            />

            <FormInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="10-digit mobile number"
              icon={Phone}
              keyboardType="phone-pad"
              error={errors.phoneNumber}
            />

            <FormInput
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="House no., street, landmark..."
              icon={Home}
              error={errors.address}
              multiline
            />

            <View style={styles.twoColumn}>
              <View style={styles.halfInput}>
                <FormInput
                  label="Village"
                  value={village}
                  onChangeText={setVillage}
                  placeholder="Village"
                  icon={MapPin}
                  error={errors.village}
                />
              </View>
              <View style={styles.halfInput}>
                <FormInput
                  label="Taluka"
                  value={taluka}
                  onChangeText={setTaluka}
                  placeholder="Taluka"
                  icon={MapPin}
                  error={errors.taluka}
                />
              </View>
            </View>

            <View style={styles.twoColumn}>
              <View style={styles.halfInput}>
                <FormInput
                  label="District"
                  value={district}
                  onChangeText={setDistrict}
                  placeholder="District"
                  icon={MapPin}
                  error={errors.district}
                />
              </View>
              <View style={styles.halfInput}>
                <FormInput
                  label="State"
                  value={stateName}
                  onChangeText={setStateName}
                  placeholder="State"
                  icon={MapPin}
                  error={errors.state}
                />
              </View>
            </View>

            <FormInput
              label="Pincode"
              value={pincode}
              onChangeText={setPincode}
              placeholder="6-digit pincode"
              icon={MapPin}
              keyboardType="number-pad"
              error={errors.pincode}
            />
          </View>

          {/* PAYMENT */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <CreditCard size={16} color={GREEN} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <Text style={styles.sectionSubtitle}>Simple and secure</Text>
              </View>
            </View>

            <View style={styles.codCard}>
              <View style={styles.codIcon}>
                <Truck size={20} color={GREEN} />
              </View>
              <View style={styles.codContent}>
                <Text style={styles.codTitle}>Cash on Delivery</Text>
                <Text style={styles.codDescription}>
                  Pay when your plants are delivered to you.
                </Text>
              </View>
              <View style={styles.selectedCheck}>
                <CheckCircle2 size={22} color={GREEN} fill={LIGHT_GREEN} />
              </View>
            </View>
          </View>

          {/* PRICE DETAILS */}
          <View style={styles.sectionCard}>
            <Text style={styles.priceDetailsTitle}>Price Details</Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>
                ₹{Number(subtotal).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery</Text>
              <Text
                style={[
                  styles.priceValue,
                  deliveryFee === 0 && styles.freeText,
                ]}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </Text>
            </View>

            {deliveryFee === 0 && (
              <Text style={styles.freeDeliveryNote}>
                Free delivery on orders above ₹500
              </Text>
            )}

            <View style={styles.totalDivider} />

            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ₹{total.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {orderError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>
                {typeof orderError === 'string'
                  ? orderError
                  : 'Unable to place order. Please try again.'}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* BOTTOM */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomTotalLabel}>Total Amount</Text>
            <Text style={styles.bottomTotal}>
              ₹{total.toLocaleString('en-IN')}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={creating}
            style={[styles.placeOrderButton, creating && styles.disabledButton]}
            onPress={handlePlaceOrder}>
            {creating ? (
              <ActivityIndicator size="small" color={WHITE} />
            ) : (
              <>
                <Text style={styles.placeOrderText}>Place Order</Text>
                <ChevronRight size={18} color={WHITE} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: BG},

  topBar: {
    height: 66,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F2F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {flex: 1, alignItems: 'center'},
  topTitle: {
    color: DARK,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  topSubtitle: {color: MUTED, fontSize: 10, marginTop: 2, fontWeight: '600'},
  headerSpacer: {width: 40},
  codHeader: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {padding: 16, paddingBottom: 25},

  sectionCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  sectionTitle: {
    color: DARK,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {color: MUTED, fontSize: 10, marginTop: 3},

  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F1',
  },
  lastOrderItem: {borderBottomWidth: 0, paddingBottom: 0},
  itemImage: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#EAF1EC',
  },
  itemImagePlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {flex: 1, marginLeft: 12, marginRight: 8},
  itemName: {color: DARK, fontSize: 12, fontWeight: '800'},
  itemQuantity: {color: MUTED, fontSize: 10, marginTop: 4, fontWeight: '600'},
  itemPrice: {color: DARK, fontSize: 12, fontWeight: '900'},

  inputGroup: {marginBottom: 13},
  inputLabel: {color: DARK, fontSize: 11, fontWeight: '800', marginBottom: 7},
  inputWrapper: {
    minHeight: 47,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: '#FAFBFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },
  multilineWrapper: {alignItems: 'flex-start', paddingTop: 13},
  inputError: {borderColor: '#E8A0A0', backgroundColor: '#FFF9F9'},
  input: {
    flex: 1,
    color: DARK,
    fontSize: 12,
    marginLeft: 9,
    paddingVertical: 0,
  },
  multilineInput: {minHeight: 70, paddingTop: 0},
  errorText: {color: RED, fontSize: 10, marginTop: 5, marginLeft: 3},

  twoColumn: {flexDirection: 'row', gap: 10},
  halfInput: {flex: 1},

  codCard: {
    minHeight: 78,
    borderRadius: 15,
    backgroundColor: LIGHT_GREEN,
    borderWidth: 1,
    borderColor: '#CBEBD7',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
  },
  codIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codContent: {flex: 1, marginLeft: 12},
  codTitle: {color: DARK, fontSize: 13, fontWeight: '900'},
  codDescription: {
    color: MUTED,
    fontSize: 10,
    marginTop: 4,
    lineHeight: 15,
    fontWeight: '600',
  },
  selectedCheck: {marginLeft: 8},

  priceDetailsTitle: {
    color: DARK,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 15,
    letterSpacing: -0.2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {color: MUTED, fontSize: 12, fontWeight: '600'},
  priceValue: {color: DARK, fontSize: 12, fontWeight: '800'},
  freeText: {color: GREEN, fontWeight: '900'},
  freeDeliveryNote: {color: GREEN, fontSize: 10, marginBottom: 5, fontWeight: '600'},
  totalDivider: {height: 1, backgroundColor: BORDER, marginVertical: 8},
  totalLabel: {color: DARK, fontSize: 14, fontWeight: '900'},
  totalValue: {color: GREEN, fontSize: 19, fontWeight: '900'},

  errorBanner: {
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#F0C8C8',
    borderRadius: 12,
    padding: 13,
    marginBottom: 12,
  },
  errorBannerText: {color: RED, fontSize: 11, lineHeight: 17, fontWeight: '600'},

  bottomBar: {
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomTotalLabel: {color: MUTED, fontSize: 10, fontWeight: '600'},
  bottomTotal: {
    color: DARK,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  placeOrderButton: {
    height: 50,
    minWidth: 160,
    borderRadius: 14,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: GREEN,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  placeOrderText: {color: WHITE, fontSize: 13, fontWeight: '900'},
  disabledButton: {opacity: 0.65},

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  emptyIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: DARK,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 18,
    letterSpacing: -0.3,
  },
  emptyText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },
  primaryButton: {
    backgroundColor: GREEN,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 13,
    marginTop: 22,
    shadowColor: GREEN,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {color: WHITE, fontSize: 13, fontWeight: '900'},
});

export default NurseryCheckoutScreen;