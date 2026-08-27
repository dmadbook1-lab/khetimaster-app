import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  ShoppingCart,
  MapPin,
  Trash2,
  Minus,
  Plus,
  Sparkles,
  Ticket,
  ChevronRight,
  Smartphone,
  CreditCard,
  Landmark,
  Wallet,
  Banknote,
  Grid2X2,
  LockKeyhole,
  Truck,
  WandSparkles,
  ArrowUpRight,
} from 'lucide-react-native';

const {width, height} = Dimensions.get('window');

const GREEN = '#16883E';
const BRIGHT_GREEN = '#1DC45B';
const DARK = '#172033';
const MUTED = '#7B8494';
const PAGE_BG = '#F7F8F8';
const BORDER = '#E9EDEE';
const ORANGE = '#FF6B1A';
const RED = '#EF4444';

const PAGE_PADDING = width * 0.037;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

const INITIAL_CART_ITEMS = [
  {
    id: 'dap',
    brand: 'IFFCO',
    name: 'IFFCO DAP Fertilizer',
    unit: '50 kg bag',
    price: 1350,
    oldPrice: 1499,
    quantity: 2,
    deliveryDays: 2,
    image: require('../../assets/bazar/dap-fertilizer.jpg'),
  },
  {
    id: 'urea',
    brand: 'IFFCO',
    name: 'IFFCO Urea Fertilizer',
    unit: '45 kg bag',
    price: 380,
    oldPrice: 420,
    quantity: 1,
    deliveryDays: 2,
    image: require('../../assets/bazar/urea-fertilizer.jpg'),
  },
  {
    id: 'confidor',
    brand: 'BAYER',
    name: 'Bayer Confidor Insecticide',
    unit: '250 ml bottle',
    price: 640,
    oldPrice: 720,
    quantity: 1,
    deliveryDays: 3,
    image: require('../../assets/bazar/confidor.jpg'),
  },
];

const PAYMENT_METHODS = [
  {
    id: 'upi',
    title: 'UPI',
    Icon: Smartphone,
    color: '#FFFFFF',
    background: BRIGHT_GREEN,
  },
  {
    id: 'credit',
    title: 'Credit Card',
    Icon: CreditCard,
    color: '#3B82F6',
    background: '#FFFFFF',
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    Icon: Landmark,
    color: '#A855F7',
    background: '#FFFFFF',
  },
  {
    id: 'cod',
    title: 'Cash on Del.',
    Icon: Banknote,
    color: '#F97316',
    background: '#FFFFFF',
  },
  {
    id: 'wallet',
    title: 'Wallet',
    Icon: Wallet,
    color: '#EC4899',
    background: '#FFFFFF',
  },
  {
    id: 'debit',
    title: 'Debit Card',
    Icon: Grid2X2,
    color: '#16A34A',
    background: '#FFFFFF',
  },
];

const formatINR = value =>
  Number(value || 0).toLocaleString('en-IN');

export default function CartScreen({navigation}) {
  const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);
  const [selectedPayment, setSelectedPayment] = useState('upi');

  const itemCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
    [cartItems],
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    [cartItems],
  );

  const discount = 389;
  const deliveryCharge = 0;
  const gst = 187;

  const totalPayable =
    subtotal - discount + deliveryCharge + gst;

  const updateQuantity = (id, change) => {
    setCartItems(currentItems =>
      currentItems
        .map(item => {
          if (item.id !== id) {
            return item;
          }

          return {
            ...item,
            quantity: Math.max(0, item.quantity + change),
          };
        })
        .filter(item => item.quantity > 0),
    );
  };

  const removeItem = id => {
    setCartItems(currentItems =>
      currentItems.filter(item => item.id !== id),
    );
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout', {
      cartItems,
      selectedPayment,
      subtotal,
      discount,
      deliveryCharge,
      gst,
      totalPayable,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation?.goBack?.()}
          style={styles.backButton}>
          <ArrowLeft
            size={rf(23)}
            color={DARK}
            strokeWidth={2.4}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Shopping Cart</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.cartButton}>
          <ShoppingCart
            size={rf(22)}
            color={DARK}
            strokeWidth={2.4}
          />

          {itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <DeliveryAddressCard />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Items</Text>

          <Text style={styles.sectionCount}>
            {cartItems.length}{' '}
            {cartItems.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {cartItems.map(item => (
          <CartItemCard
            key={item.id}
            item={item}
            onIncrease={() => updateQuantity(item.id, 1)}
            onDecrease={() => updateQuantity(item.id, -1)}
            onRemove={() => removeItem(item.id)}
          />
        ))}

        <AIRecommendationCard />

        <Text style={styles.mainSectionTitle}>Offers & Coupons</Text>

        <CouponCard />

        <Text style={styles.mainSectionTitle}>Order Summary</Text>

        <OrderSummaryCard
          subtotal={subtotal}
          discount={discount}
          deliveryCharge={deliveryCharge}
          gst={gst}
          totalPayable={totalPayable}
        />

        <Text style={styles.mainSectionTitle}>Pay With</Text>

        <View style={styles.paymentGrid}>
          {PAYMENT_METHODS.map(method => (
            <PaymentCard
              key={method.id}
              method={method}
              selected={selectedPayment === method.id}
              onPress={() => setSelectedPayment(method.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleCheckout}
          style={styles.checkoutButton}>
          <LockKeyhole
            size={rf(20)}
            color="#FFFFFF"
            strokeWidth={2.5}
          />

          <Text style={styles.checkoutText}>
            Proceed to Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DeliveryAddressCard() {
  return (
    <View style={styles.addressCard}>
      <View style={styles.locationIconBox}>
        <MapPin
          size={rf(23)}
          color="#FFFFFF"
          strokeWidth={2.3}
        />
      </View>

      <View style={styles.addressDetails}>
        <Text style={styles.deliverLabel}>DELIVER TO</Text>

        <Text style={styles.addressName}>Patil Farm</Text>

        <Text numberOfLines={1} style={styles.addressText}>
          Aurangabad, Maharashtra 431001
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          Alert.alert(
            'Change Address',
            'Address selection can be opened here.',
          )
        }
        style={styles.changeButton}>
        <Text style={styles.changeButtonText}>Change</Text>
      </TouchableOpacity>
    </View>
  );
}

function CartItemCard({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemTopRow}>
        <View style={styles.productImageBox}>
          <Image
            source={item.image}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.productDetails}>
          <Text style={styles.productBrand}>{item.brand}</Text>

          <Text numberOfLines={2} style={styles.productName}>
            {item.name}
          </Text>

          <Text style={styles.productUnit}>{item.unit}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>
              {formatINR(item.price)}
            </Text>

            <Text style={styles.oldPrice}>
              {formatINR(item.oldPrice)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.itemControlsRow}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onDecrease}
            style={styles.quantityButton}>
            <Minus
              size={rf(14)}
              color="#94A3B8"
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <Text style={styles.quantityValue}>{item.quantity}</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onIncrease}
            style={styles.quantityButton}>
            <Plus
              size={rf(14)}
              color={GREEN}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRemove}
          style={styles.removeButton}>
          <Trash2
            size={rf(13)}
            color={RED}
            strokeWidth={2.3}
          />

          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deliveryBadge}>
        <Truck
          size={rf(15)}
          color={ORANGE}
          fill={ORANGE}
          strokeWidth={2}
        />

        <Text style={styles.deliveryBadgeText}>
          Delivery in {item.deliveryDays} Days
        </Text>
      </View>
    </View>
  );
}

function AIRecommendationCard() {
  return (
    <LinearGradient
      colors={['#0E9741', '#1AC458']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.aiCard}>
      <View style={styles.aiCircle} />

      <View style={styles.aiBadge}>
        <WandSparkles
          size={rf(11)}
          color="#FFFFFF"
          strokeWidth={2.3}
        />

        <Text style={styles.aiBadgeText}>AI Recommendation</Text>
      </View>

      <Text style={styles.aiTitle}>Boost Your Soybean Yield</Text>

      <Text style={styles.aiDescription}>
        “Based on your Soybean crop, adding a Micronutrient Mix
        may improve crop health and nutrient balance
        significantly.”
      </Text>

      <View style={styles.aiBottomRow}>
        <View style={styles.growthBadge}>
          <ArrowUpRight
            size={rf(12)}
            color="#FFFFFF"
            strokeWidth={2.4}
          />

          <Text style={styles.growthBadgeText}>
            +8% Better Growth
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.87}
          onPress={() =>
            Alert.alert(
              'Added',
              'Recommended micronutrient product added to cart.',
            )
          }
          style={styles.aiAddButton}>
          <Text style={styles.aiAddButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

function CouponCard() {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        Alert.alert(
          'Apply Coupon',
          'Coupon selection can be opened here.',
        )
      }
      style={styles.couponCard}>
      <View style={styles.couponIconBox}>
        <Ticket
          size={rf(22)}
          color={ORANGE}
          strokeWidth={2.3}
        />
      </View>

      <View style={styles.couponDetails}>
        <Text style={styles.couponTitle}>Apply Coupon</Text>

        <Text style={styles.couponSubtitle}>
          Save extra with promo codes
        </Text>
      </View>

      <ChevronRight
        size={rf(21)}
        color="#C7CDD5"
        strokeWidth={2.3}
      />
    </TouchableOpacity>
  );
}

function OrderSummaryCard({
  subtotal,
  discount,
  deliveryCharge,
  gst,
  totalPayable,
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryContent}>
        <SummaryRow
          label="Subtotal (3 items)"
          value={formatINR(subtotal)}
        />

        <SummaryRow
          label="Discount"
          value={`- ${formatINR(discount)}`}
          green
        />

        <SummaryRow
          label="Delivery Charges"
          value={
            deliveryCharge === 0
              ? 'FREE'
              : formatINR(deliveryCharge)
          }
          green
        />

        <SummaryRow
          label="GST (5%)"
          value={formatINR(gst)}
        />

        <View style={styles.summaryDivider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Payable</Text>

          <Text style={styles.totalValue}>
            ₹{formatINR(totalPayable)}
          </Text>
        </View>

        <View style={styles.savingsBar}>
          <Sparkles
            size={rf(13)}
            color={GREEN}
            strokeWidth={2.4}
          />

          <Text style={styles.savingsText}>
            You’re saving{' '}
            <Text style={styles.savingsAmount}>389</Text> on this
            order 🥳
          </Text>
        </View>
      </View>
    </View>
  );
}

function SummaryRow({label, value, green}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>

      <Text
        style={[
          styles.summaryValue,
          green && styles.greenSummaryValue,
        ]}>
        {value}
      </Text>
    </View>
  );
}

function PaymentCard({method, selected, onPress}) {
  const Icon = method.Icon;

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.paymentCard,
        selected && styles.selectedPaymentCard,
      ]}>
      <Icon
        size={rf(22)}
        color={selected ? '#FFFFFF' : method.color}
        strokeWidth={2.3}
      />

      <Text
        numberOfLines={1}
        style={[
          styles.paymentText,
          selected && styles.selectedPaymentText,
        ]}>
        {method.title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 66,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    marginLeft: 5,
    fontSize: rf(20),
    lineHeight: rf(25),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.35,
  },

  cartButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EDF0F2',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#111827',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },

  cartBadge: {
    position: 'absolute',
    right: -2,
    top: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#F97316',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: rf(9),
    lineHeight: rf(11),
    fontWeight: '900',
  },

  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 15,
    paddingBottom: 115,
    backgroundColor: PAGE_BG,
  },

  addressCard: {
    minHeight: 84,
    borderRadius: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEEEF',
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#111827',
    shadowOpacity: 0.035,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },

  locationIconBox: {
    width: 44,
    height: 44,
    borderRadius: 7,
    backgroundColor: '#20C760',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addressDetails: {
    flex: 1,
    marginLeft: 12,
  },

  deliverLabel: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#98A1AF',
    letterSpacing: 0.45,
  },

  addressName: {
    marginTop: 3,
    fontSize: rf(14),
    lineHeight: rf(17),
    fontWeight: '900',
    color: '#3B4354',
  },

  addressText: {
    marginTop: 2,
    fontSize: rf(11),
    lineHeight: rf(15),
    fontWeight: '500',
    color: MUTED,
  },

  changeButton: {
    height: 31,
    paddingHorizontal: 17,
    borderRadius: 16,
    backgroundColor: '#20C760',
    alignItems: 'center',
    justifyContent: 'center',
  },

  changeButtonText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  sectionHeader: {
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: rf(16),
    lineHeight: rf(20),
    fontWeight: '900',
    color: DARK,
  },

  sectionCount: {
    fontSize: rf(11),
    lineHeight: rf(14),
    fontWeight: '600',
    color: MUTED,
  },

  itemCard: {
    minHeight: 176,
    marginBottom: 14,
    borderRadius: 15,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEEEF',

    shadowColor: '#111827',
    shadowOpacity: 0.035,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },

  itemTopRow: {
    flexDirection: 'row',
  },

  productImageBox: {
    width: 76,
    height: 76,
    borderRadius: 4,
    backgroundColor: '#F8FAFB',
    borderWidth: 1,
    borderColor: '#EEF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  productImage: {
    width: '94%',
    height: '94%',
  },

  productDetails: {
    flex: 1,
    marginLeft: 17,
  },

  productBrand: {
    fontSize: rf(9),
    lineHeight: rf(12),
    fontWeight: '900',
    color: '#18A54C',
    letterSpacing: 0.2,
  },

  productName: {
    marginTop: 2,
    fontSize: rf(14),
    lineHeight: rf(18),
    fontWeight: '900',
    color: DARK,
  },

  productUnit: {
    marginTop: 2,
    fontSize: rf(10),
    lineHeight: rf(13),
    fontWeight: '500',
    color: '#9AA3B0',
  },

  priceRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  productPrice: {
    fontSize: rf(15),
    lineHeight: rf(19),
    fontWeight: '900',
    color: '#15803D',
  },

  oldPrice: {
    marginLeft: 9,
    fontSize: rf(10),
    fontWeight: '500',
    color: '#AEB5BF',
    textDecorationLine: 'line-through',
  },

  itemControlsRow: {
    marginTop: 5,
    paddingLeft: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  quantityControl: {
    height: 37,
    minWidth: 94,
    borderRadius: 19,
    paddingHorizontal: 3,
    backgroundColor: '#F8FAFA',
    borderWidth: 1,
    borderColor: '#EDF0F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  quantityButton: {
    width: 29,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityValue: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },

  removeButton: {
    height: 27,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FFF4F4',
    borderWidth: 1,
    borderColor: '#FFD6D6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  removeText: {
    fontSize: rf(9),
    lineHeight: rf(12),
    fontWeight: '800',
    color: RED,
  },

  deliveryBadge: {
    alignSelf: 'flex-start',
    marginLeft: 92,
    marginTop: 9,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFF4E9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  deliveryBadgeText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: ORANGE,
  },

  aiCard: {
    minHeight: 190,
    marginTop: 1,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingTop: 21,
    paddingBottom: 16,
    overflow: 'hidden',

    shadowColor: '#0E9741',
    shadowOpacity: 0.19,
    shadowRadius: 11,
    shadowOffset: {width: 0, height: 7},
    elevation: 5,
  },

  aiCircle: {
    position: 'absolute',
    width: 144,
    height: 144,
    borderRadius: 72,
    right: -39,
    top: -24,
    backgroundColor: 'rgba(255,255,255,0.09)',
  },

  aiBadge: {
    alignSelf: 'flex-start',
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.58)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  aiBadgeText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiTitle: {
    marginTop: 12,
    fontSize: rf(17),
    lineHeight: rf(21),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiDescription: {
    marginTop: 6,
    maxWidth: '84%',
    fontSize: rf(10),
    lineHeight: rf(15),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },

  aiBottomRow: {
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  growthBadge: {
    height: 27,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  growthBadgeText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  aiAddButton: {
    height: 34,
    paddingHorizontal: 21,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiAddButtonText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#16883E',
  },

  mainSectionTitle: {
    marginTop: 19,
    marginBottom: 11,
    fontSize: rf(16),
    lineHeight: rf(20),
    fontWeight: '900',
    color: DARK,
  },

  couponCard: {
    minHeight: 73,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEEEF',
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#111827',
    shadowOpacity: 0.025,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 1,
  },

  couponIconBox: {
    width: 39,
    height: 39,
    borderRadius: 8,
    backgroundColor: '#FFF4E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  couponDetails: {
    flex: 1,
    marginLeft: 13,
  },

  couponTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },

  couponSubtitle: {
    marginTop: 3,
    fontSize: rf(10),
    fontWeight: '500',
    color: '#99A2AF',
  },

  summaryCard: {
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEEEF',
    overflow: 'hidden',

    shadowColor: '#111827',
    shadowOpacity: 0.025,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 1,
  },

  summaryContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 19,
  },

  summaryRow: {
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryLabel: {
    fontSize: rf(11),
    lineHeight: rf(14),
    fontWeight: '500',
    color: MUTED,
  },

  summaryValue: {
    fontSize: rf(11),
    lineHeight: rf(14),
    fontWeight: '900',
    color: DARK,
  },

  greenSummaryValue: {
    color: '#169447',
  },

  summaryDivider: {
    height: 1,
    marginTop: 1,
    marginBottom: 16,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: '#E6EAEC',
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: rf(16),
    lineHeight: rf(20),
    fontWeight: '900',
    color: DARK,
  },

  totalValue: {
    fontSize: rf(22),
    lineHeight: rf(27),
    fontWeight: '900',
    color: '#16883E',
  },

  savingsBar: {
    minHeight: 41,
    marginTop: 13,
    borderRadius: 7,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 5,
  },

  savingsText: {
    fontSize: rf(9),
    fontWeight: '600',
    color: '#16883E',
  },

  savingsAmount: {
    fontWeight: '900',
  },

  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 11,
  },

  paymentCard: {
    width: '31.7%',
    height: 82,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EDEE',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#111827',
    shadowOpacity: 0.035,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },

  selectedPaymentCard: {
    backgroundColor: '#20C760',
    borderColor: '#20C760',

    shadowColor: '#20C760',
    shadowOpacity: 0.2,
    shadowRadius: 9,
    shadowOffset: {width: 0, height: 5},
    elevation: 4,
  },

  paymentText: {
    marginTop: 8,
    fontSize: rf(8),
    lineHeight: rf(11),
    fontWeight: '800',
    color: '#3F4859',
    textAlign: 'center',
  },

  selectedPaymentText: {
    color: '#FFFFFF',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 14,
    paddingBottom: 13,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9EDEE',
  },

  checkoutButton: {
    height: 53,
    borderRadius: 11,
    backgroundColor: '#16883E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,

    shadowColor: '#16883E',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 6,
  },

  checkoutText: {
    fontSize: rf(17),
    lineHeight: rf(21),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
});