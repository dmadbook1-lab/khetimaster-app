import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArrowLeft,
  Check,
  MapPin,
  Truck,
  Package,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Shield,
  ArrowLeftRight,
  Smartphone,
  CreditCard,
  Landmark,
  Wallet,
  Banknote,
  Circle,
  LockKeyhole,
  Lock,
  BadgeCheck,
  Share2,
  Headphones,
} from 'lucide-react-native';
const { width, height } = Dimensions.get('window');
const GREEN = '#16B64B';
const DARK_GREEN = '#16883E';
const DARK = '#121A2B';
const MUTED = '#7A8497';
const PAGE_BG = '#F7F8F7';
const BORDER = '#EDF0EE';
const PAGE_PADDING = width * 0.035;
const isSmall = width < 370;
const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};
const PAYMENT_METHODS = [
  {
    id: 'upi',
    title: 'UPI Payment',
    subtitle: 'Pay with Google Pay, PhonePe, BHIM',
    icon: Smartphone,
    iconColor: '#16B64B',
    iconBg: '#FFFFFF',
  },
  {
    id: 'credit',
    title: 'Credit Card',
    subtitle: 'Visa, Mastercard, RuPay',
    icon: CreditCard,
    iconColor: '#3B82F6',
    iconBg: '#EFF6FF',
  },
  {
    id: 'debit',
    title: 'Debit Card',
    subtitle: 'All major bank cards accepted',
    icon: CreditCard,
    iconColor: '#A855F7',
    iconBg: '#FAF5FF',
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    subtitle: 'SBI, HDFC, ICICI, Axis & more',
    icon: Landmark,
    iconColor: '#6366F1',
    iconBg: '#EEF2FF',
  },
  {
    id: 'wallet',
    title: 'Wallet',
    subtitle: 'Paytm, Amazon Pay, Airtel',
    icon: Wallet,
    iconColor: '#EC4899',
    iconBg: '#FDF2F8',
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    subtitle: 'Pay when your order arrives',
    icon: Banknote,
    iconColor: '#F97316',
    iconBg: '#FFF7ED',
  },
];
const ORDER_ITEMS = [
  {
    id: '1',
    name: 'IFFCO DAP Fertilizer',
    quantity: 2,
    unitPrice: 1350,
    image: require('../../assets/bazar/dap-fertilizer.jpg'),
  },
  {
    id: '2',
    name: 'IFFCO Urea Fertilizer',
    quantity: 1,
    unitPrice: 380,
    image: require('../../assets/bazar/urea-fertilizer.jpg'),
  },
  {
    id: '3',
    name: 'Bayer Confidor Insecticide',
    quantity: 1,
    unitPrice: 640,
    image: require('../../assets/bazar/confidor.jpg'),
  },
];
const formatINR = value => `₹${Number(value).toLocaleString('en-IN')}`;
export default function CheckoutScreen({ navigation }) {
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [showOrderItems, setShowOrderItems] = useState(true);
  const itemsTotal = useMemo(
    () =>
      ORDER_ITEMS.reduce(
        (total, item) => total + item.quantity * item.unitPrice,
        0,
      ),
    [],
  );
  const subtotal = 5469;
  const discount = 389;
  const delivery = 0;
  const gst = 254;
  const grandTotal = subtotal - discount + delivery + gst;
  const handlePlaceOrder = () => {
    const selectedMethod = PAYMENT_METHODS.find(
      method => method.id === selectedPayment,
    );
    navigation.replace('OrderSuccess', {
      orderId: '#KM458921',
      totalAmount: grandTotal,
      savedAmount: discount,
      paymentMethod: selectedMethod?.title || 'Cash on Delivery',
    });
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={rf(22)} color={DARK} strokeWidth={2.4} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <CheckoutProgress />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <DeliveryAddressCard />

        <ExpectedDeliveryCard />

        <Text style={styles.sectionHeading}>Order Items</Text>

        <OrderItemsCard
          expanded={showOrderItems}
          onToggle={() => setShowOrderItems(current => !current)}
          items={ORDER_ITEMS}
          itemsTotal={itemsTotal}
        />

        <Text style={styles.sectionHeading}>AI Insights</Text>

        <AIInsightsCard />

        <Text style={styles.sectionHeading}>Payment Method</Text>

        <View style={styles.paymentList}>
          {PAYMENT_METHODS.map(method => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              selected={selectedPayment === method.id}
              onPress={() => setSelectedPayment(method.id)}
            />
          ))}
        </View>

        <Text style={styles.sectionHeading}>Bill Summary</Text>

        <BillSummaryCard
          subtotal={subtotal}
          discount={discount}
          delivery={delivery}
          gst={gst}
          grandTotal={grandTotal}
        />

        <SecureCheckoutCard />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity activeOpacity={0.9} onPress={handlePlaceOrder}>
          <LinearGradient
            colors={['#14B84A', '#13AF47']}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={styles.placeOrderButton}
          >
            <View style={styles.placeOrderLeft}>
              <LockKeyhole size={rf(20)} color="#FFFFFF" strokeWidth={2.5} />

              <Text style={styles.placeOrderText}>Place Order</Text>
            </View>

            <View style={styles.placeOrderPriceBox}>
              <Text style={styles.placeOrderPrice}>
                {formatINR(grandTotal).replace('₹', '')}
              </Text>

              <Text style={styles.placeOrderTax}>Incl. taxes & delivery</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
function CheckoutProgress() {
  return (
    <View style={styles.progressContainer}>
      <ProgressStep number="✓" label="Cart" completed active={false} />

      <View style={[styles.progressLine, styles.completedLine]} />

      <ProgressStep number="2" label="Checkout" completed={false} active />

      <View style={styles.progressLine} />

      <ProgressStep
        number="3"
        label="Payment"
        completed={false}
        active={false}
      />

      <View style={styles.progressLine} />

      <ProgressStep number="4" label="Done" completed={false} active={false} />
    </View>
  );
}
function ProgressStep({ number, label, completed, active }) {
  return (
    <View style={styles.progressStep}>
      <View
        style={[
          styles.progressCircle,
          completed && styles.completedCircle,
          active && styles.activeCircle,
        ]}
      >
        <Text
          style={[
            styles.progressNumber,
            (completed || active) && styles.activeProgressNumber,
          ]}
        >
          {number}
        </Text>
      </View>

      <Text
        style={[
          styles.progressLabel,
          active && styles.activeProgressLabel,
          completed && styles.completedProgressLabel,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}
function DeliveryAddressCard() {
  return (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressIconBox}>
          <MapPin size={rf(20)} color={DARK_GREEN} strokeWidth={2.2} />
        </View>

        <Text style={styles.addressHeading}>Delivery Address</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            Alert.alert(
              'Change Address',
              'Address selection screen can be opened here.',
            )
          }
          style={styles.changeButton}
        >
          <Text style={styles.changeButtonText}>Change</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addressContent}>
        <View style={styles.addressSpacer} />

        <View style={styles.addressDetails}>
          <View style={styles.homeFarmBadge}>
            <Text style={styles.homeFarmText}>Home Farm</Text>
          </View>

          <Text style={styles.farmName}>Patil Farm</Text>

          <Text style={styles.addressText}>
            Village: Khadki, Aurangabad,{'\n'}
            Maharashtra – 431001
          </Text>
        </View>
      </View>
    </View>
  );
}
function ExpectedDeliveryCard() {
  return (
    <View style={styles.deliveryCard}>
      <View style={styles.deliveryIconBox}>
        <Truck size={rf(22)} color="#3B82F6" strokeWidth={2.2} />
      </View>

      <View style={styles.deliveryDetails}>
        <Text style={styles.deliveryLabel}>Expected Delivery</Text>

        <Text style={styles.deliveryDate}>
          Friday, 26 June{'\n'}
          2026
        </Text>

        <Text style={styles.deliveryLocation}>Aurangabad, Maharashtra</Text>
      </View>

      <View style={styles.freeDeliveryBadge}>
        <Text style={styles.rupeeSmall}>₹</Text>
        <Text style={styles.freeDeliveryText}>Free Delivery</Text>
      </View>
    </View>
  );
}
function OrderItemsCard({ expanded, onToggle, items, itemsTotal }) {
  return (
    <View style={styles.orderCard}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onToggle}
        style={styles.orderCardHeader}
      >
        <View style={styles.packageIconBox}>
          <Package size={rf(17)} color={DARK_GREEN} strokeWidth={2.3} />
        </View>

        <Text style={styles.orderCountText}>{items.length} Items in Order</Text>

        <Text style={styles.orderTotal}>
          {formatINR(itemsTotal).replace('₹', '')}
        </Text>

        {expanded ? (
          <ChevronUp size={rf(18)} color={DARK} strokeWidth={2.3} />
        ) : (
          <ChevronDown size={rf(18)} color={DARK} strokeWidth={2.3} />
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.orderItemsBody}>
          {items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.orderItem,
                index === items.length - 1 && styles.lastOrderItem,
              ]}
            >
              <View style={styles.orderImageBox}>
                <Image
                  source={item.image}
                  style={styles.orderImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.orderItemDetails}>
                <Text numberOfLines={1} style={styles.orderItemName}>
                  {item.name}
                </Text>

                <Text style={styles.orderItemMeta}>
                  Qty: {item.quantity} × {formatINR(item.unitPrice)}
                </Text>
              </View>

              <Text style={styles.orderItemPrice}>
                {formatINR(item.quantity * item.unitPrice).replace('₹', '')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
function AIInsightsCard() {
  return (
    <LinearGradient
      colors={['#0D9440', '#15A84A']}
      start={{
        x: 0,
        y: 0,
      }}
      end={{
        x: 1,
        y: 1,
      }}
      style={styles.aiCard}
    >
      <View style={styles.aiCircleLarge} />
      <View style={styles.aiCircleSmall} />

      <View style={styles.aiHeader}>
        <View style={styles.aiBadge}>
          <Sparkles size={rf(12)} color="#FFFFFF" strokeWidth={2.5} />

          <Text style={styles.aiBadgeText}>AI PURCHASE SUMMARY</Text>
        </View>

        <View style={styles.matchCircle}>
          <Text style={styles.matchPercent}>98%</Text>
          <Text style={styles.matchText}>MATCH</Text>
        </View>
      </View>

      <Text style={styles.aiTitle}>Perfect for Soybean Crop</Text>

      <Text style={styles.aiDescription}>
        Suitable for your Soybean crop at the current vegetative stage. This
        combination ensures balanced nutrition and optimal protection throughout
        the growth cycle.
      </Text>

      <View style={styles.aiTagRow}>
        <View style={styles.aiTag}>
          <Shield size={rf(11)} color="#FFFFFF" strokeWidth={2.2} />

          <Text style={styles.aiTagText}>Improved Nutrition</Text>
        </View>

        <View style={styles.aiTag}>
          <ArrowLeftRight size={rf(11)} color="#FFFFFF" strokeWidth={2.2} />

          <Text style={styles.aiTagText}>Better Growth</Text>
        </View>
      </View>

      <View style={styles.aiTagSecondRow}>
        <View style={styles.aiTag}>
          <Shield size={rf(11)} color="#FFFFFF" strokeWidth={2.2} />

          <Text style={styles.aiTagText}>Crop Compatible</Text>
        </View>
      </View>
    </LinearGradient>
  );
}
function PaymentMethodCard({ method, selected, onPress }) {
  const Icon = method.icon;
  return (
    <TouchableOpacity
      activeOpacity={0.87}
      onPress={onPress}
      style={[styles.paymentCard, selected && styles.selectedPaymentCard]}
    >
      <View
        style={[
          styles.paymentIconBox,
          {
            backgroundColor: selected ? '#FFFFFF' : method.iconBg,
          },
        ]}
      >
        <Icon
          size={rf(22)}
          color={selected ? GREEN : method.iconColor}
          strokeWidth={2.2}
        />
      </View>

      <View style={styles.paymentDetails}>
        <Text
          style={[styles.paymentTitle, selected && styles.selectedPaymentTitle]}
        >
          {method.title}
        </Text>

        <Text
          numberOfLines={1}
          style={[
            styles.paymentSubtitle,
            selected && styles.selectedPaymentSubtitle,
          ]}
        >
          {method.subtitle}
        </Text>
      </View>

      <View style={[styles.radioOuter, selected && styles.selectedRadioOuter]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}
function BillSummaryCard({ subtotal, discount, delivery, gst, grandTotal }) {
  return (
    <View style={styles.billCard}>
      <View style={styles.billContent}>
        <BillRow
          label="Subtotal (3 items)"
          value={formatINR(subtotal).replace('₹', '')}
        />

        <BillRow
          label="Discount"
          value={`- ${formatINR(discount).replace('₹', '')}`}
          valueStyle={styles.discountValue}
        />

        <BillRow
          label="Delivery Charges"
          value={delivery === 0 ? 'FREE' : formatINR(delivery)}
          valueStyle={styles.discountValue}
        />

        <BillRow label="GST (5%)" value={formatINR(gst).replace('₹', '')} />

        <View style={styles.billDivider} />

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>

          <Text style={styles.grandTotalValue}>{formatINR(grandTotal)}</Text>
        </View>
      </View>

      <View style={styles.savingsBar}>
        <Sparkles size={rf(14)} color={DARK_GREEN} strokeWidth={2.4} />

        <Text style={styles.savingsText}>
          You’re saving <Text style={styles.savingsAmount}>389</Text> on this
          order 🎉
        </Text>
      </View>
    </View>
  );
}
function BillRow({ label, value, valueStyle }) {
  return (
    <View style={styles.billRow}>
      <Text style={styles.billLabel}>{label}</Text>

      <Text style={[styles.billValue, valueStyle]}>{value}</Text>
    </View>
  );
}
function SecureCheckoutCard() {
  return (
    <View style={styles.secureCard}>
      <View style={styles.secureHeader}>
        <View style={styles.secureHeaderIcon}>
          <Shield size={rf(18)} color={DARK_GREEN} strokeWidth={2.3} />
        </View>

        <Text style={styles.secureTitle}>Secure Checkout Guarantee</Text>
      </View>

      <View style={styles.secureFeatures}>
        <SecureFeature
          Icon={Lock}
          iconColor="#16A34A"
          iconBg="#ECFDF3"
          lineOne="100% Secure"
          lineTwo="Payment"
        />

        <SecureFeature
          Icon={BadgeCheck}
          iconColor="#3B82F6"
          iconBg="#EFF6FF"
          lineOne="Verified"
          lineTwo="Products"
        />

        <SecureFeature
          Icon={Share2}
          iconColor="#F97316"
          iconBg="#FFF7ED"
          lineOne="Easy Returns"
          lineTwo=""
        />

        <SecureFeature
          Icon={Headphones}
          iconColor="#A855F7"
          iconBg="#FAF5FF"
          lineOne="24/7 Support"
          lineTwo=""
        />
      </View>
    </View>
  );
}
function SecureFeature({ Icon, iconColor, iconBg, lineOne, lineTwo }) {
  return (
    <View style={styles.secureFeature}>
      <View
        style={[
          styles.secureFeatureIcon,
          {
            backgroundColor: iconBg,
          },
        ]}
      >
        <Icon size={rf(19)} color={iconColor} strokeWidth={2.2} />
      </View>

      <Text style={styles.secureFeatureText}>
        {lineOne}
        {!!lineTwo && `\n${lineTwo}`}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 57,
    paddingHorizontal: width * 0.038,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    marginLeft: 5,
    fontSize: rf(20),
    lineHeight: rf(25),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.35,
  },
  progressContainer: {
    height: 51,
    paddingHorizontal: width * 0.035,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F2',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#DCE1E7',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedCircle: {
    backgroundColor: '#168D43',
    borderColor: '#168D43',
  },
  activeCircle: {
    backgroundColor: '#168D43',
    borderColor: '#168D43',
  },
  progressNumber: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#C6CDD7',
  },
  activeProgressNumber: {
    color: '#FFFFFF',
  },
  progressLabel: {
    marginLeft: 5,
    fontSize: rf(10),
    fontWeight: '700',
    color: '#B4BBC7',
  },
  activeProgressLabel: {
    color: '#168D43',
    fontWeight: '900',
  },
  completedProgressLabel: {
    color: '#697386',
  },
  progressLine: {
    flex: 1,
    height: 1.5,
    marginHorizontal: 6,
    backgroundColor: '#E5E8EC',
  },
  completedLine: {
    backgroundColor: '#168D43',
  },
  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 13,
    paddingBottom: height * 0.14,
    backgroundColor: PAGE_BG,
  },
  sectionHeading: {
    marginTop: 17,
    marginBottom: 10,
    marginLeft: 4,
    fontSize: rf(16),
    lineHeight: rf(21),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.2,
  },
  addressCard: {
    minHeight: 154,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F2F0',
    shadowColor: '#111827',
    shadowOpacity: 0.025,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIconBox: {
    width: 31,
    height: 31,
    borderRadius: 7,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressHeading: {
    flex: 1,
    marginLeft: 11,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK,
  },
  changeButton: {
    height: 31,
    borderRadius: 7,
    paddingHorizontal: 14,
    backgroundColor: '#18B94D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeButtonText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  addressContent: {
    marginTop: 13,
    flexDirection: 'row',
  },
  addressSpacer: {
    width: 42,
  },
  addressDetails: {
    flex: 1,
  },
  homeFarmBadge: {
    alignSelf: 'flex-start',
    height: 18,
    borderRadius: 5,
    paddingHorizontal: 7,
    backgroundColor: '#E8F9EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeFarmText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: '#168D43',
  },
  farmName: {
    marginTop: 7,
    fontSize: rf(14),
    fontWeight: '900',
    color: '#394154',
  },
  addressText: {
    marginTop: 3,
    fontSize: rf(12),
    lineHeight: rf(17),
    fontWeight: '500',
    color: MUTED,
  },
  deliveryCard: {
    minHeight: 95,
    marginTop: 12,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F2F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 7,
    backgroundColor: '#EDF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryDetails: {
    flex: 1,
    marginLeft: 11,
  },
  deliveryLabel: {
    fontSize: rf(10),
    fontWeight: '600',
    color: MUTED,
  },
  deliveryDate: {
    marginTop: 3,
    fontSize: rf(14),
    lineHeight: rf(18),
    fontWeight: '900',
    color: DARK,
  },
  deliveryLocation: {
    marginTop: 2,
    fontSize: rf(10),
    fontWeight: '600',
    color: MUTED,
  },
  freeDeliveryBadge: {
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 9,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rupeeSmall: {
    fontSize: rf(10),
    fontWeight: '900',
    color: '#168D43',
  },
  freeDeliveryText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#168D43',
  },
  orderCard: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F2F0',
    overflow: 'hidden',
  },
  orderCardHeader: {
    height: 52,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageIconBox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderCountText: {
    flex: 1,
    marginLeft: 8,
    fontSize: rf(13),
    fontWeight: '900',
    color: DARK,
  },
  orderTotal: {
    marginRight: 8,
    fontSize: rf(13),
    fontWeight: '900',
    color: '#168D43',
  },
  orderItemsBody: {
    paddingHorizontal: 13,
    paddingBottom: 8,
  },
  orderItem: {
    minHeight: 68,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F2',
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastOrderItem: {
    paddingBottom: 4,
  },
  orderImageBox: {
    width: 50,
    height: 50,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E9EC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderImage: {
    width: '87%',
    height: '87%',
  },
  orderItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  orderItemName: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#20283A',
  },
  orderItemMeta: {
    marginTop: 4,
    fontSize: rf(10),
    fontWeight: '600',
    color: MUTED,
  },
  orderItemPrice: {
    marginLeft: 7,
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  aiCard: {
    minHeight: 290,
    borderRadius: 11,
    paddingHorizontal: 20,
    paddingTop: 17,
    paddingBottom: 19,
    overflow: 'hidden',
    shadowColor: '#0D9440',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },
  aiCircleLarge: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    right: -38,
    top: -45,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  aiCircleSmall: {
    position: 'absolute',
    width: 69,
    height: 69,
    borderRadius: 35,
    right: 13,
    top: 17,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  aiHeader: {
    height: 54,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiBadge: {
    alignSelf: 'flex-start',
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,95,40,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBadgeText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.25,
  },
  matchCircle: {
    width: 59,
    height: 59,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  matchPercent: {
    fontSize: rf(17),
    lineHeight: rf(19),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  matchText: {
    fontSize: rf(7),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiTitle: {
    marginTop: 23,
    fontSize: rf(19),
    lineHeight: rf(24),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  aiDescription: {
    marginTop: 10,
    maxWidth: '91%',
    fontSize: rf(12),
    lineHeight: rf(19),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.83)',
  },
  aiTagRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 8,
  },
  aiTagSecondRow: {
    marginTop: 7,
    flexDirection: 'row',
  },
  aiTag: {
    minHeight: 25,
    borderRadius: 13,
    paddingHorizontal: 11,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiTagText: {
    fontSize: rf(8),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  paymentList: {
    gap: 9,
  },
  paymentCard: {
    minHeight: 70,
    borderRadius: 9,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBEEEC',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOpacity: 0.025,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },
  selectedPaymentCard: {
    backgroundColor: '#11BE4D',
    borderColor: '#11BE4D',
    shadowColor: '#11BE4D',
    shadowOpacity: 0.22,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 4,
  },
  paymentIconBox: {
    width: 42,
    height: 42,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentDetails: {
    flex: 1,
    marginLeft: 13,
  },
  paymentTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: '#20283A',
  },
  selectedPaymentTitle: {
    color: '#FFFFFF',
  },
  paymentSubtitle: {
    marginTop: 3,
    fontSize: rf(10),
    fontWeight: '500',
    color: MUTED,
  },
  selectedPaymentSubtitle: {
    color: 'rgba(255,255,255,0.79)',
  },
  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#DFE4E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioOuter: {
    borderColor: '#FFFFFF',
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  billCard: {
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F2F0',
    overflow: 'hidden',
  },
  billContent: {
    paddingHorizontal: 14,
    paddingTop: 15,
    paddingBottom: 13,
  },
  billRow: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billLabel: {
    fontSize: rf(12),
    fontWeight: '500',
    color: MUTED,
  },
  billValue: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  discountValue: {
    color: '#168D43',
  },
  billDivider: {
    height: 1,
    marginTop: 1,
    marginBottom: 13,
    borderStyle: 'dashed',
    borderTopWidth: 1,
    borderTopColor: '#E5E8EC',
  },
  grandTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grandTotalLabel: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },
  grandTotalValue: {
    fontSize: rf(19),
    fontWeight: '900',
    color: '#168D43',
  },
  savingsBar: {
    minHeight: 37,
    backgroundColor: '#EAFBF0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  savingsText: {
    fontSize: rf(10),
    fontWeight: '700',
    color: '#168D43',
  },
  savingsAmount: {
    fontWeight: '900',
  },
  secureCard: {
    minHeight: 145,
    marginTop: 13,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingTop: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F2F0',
  },
  secureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secureHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureTitle: {
    marginLeft: 9,
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK,
  },
  secureFeatures: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secureFeature: {
    width: '23%',
    alignItems: 'center',
  },
  secureFeatureIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureFeatureText: {
    marginTop: 7,
    fontSize: rf(8),
    lineHeight: rf(10),
    fontWeight: '800',
    color: '#4A5365',
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 12,
    paddingBottom: 11,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDF0EE',
  },
  placeOrderButton: {
    height: 63,
    borderRadius: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#12AF47',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 6,
  },
  placeOrderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  placeOrderText: {
    fontSize: rf(18),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  placeOrderPriceBox: {
    alignItems: 'flex-end',
  },
  placeOrderPrice: {
    fontSize: rf(18),
    lineHeight: rf(21),
    fontWeight: '900',
    color: '#FFFFFF',
  },
  placeOrderTax: {
    marginTop: 1,
    fontSize: rf(8),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.88)',
  },
});
