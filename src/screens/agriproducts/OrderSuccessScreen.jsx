import React from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  Check,
  Package,
  Truck,
  Home,
  Sparkles,
  Clock3,
  MapPin,
  ShoppingBag,
  Plus,
  Leaf,
} from 'lucide-react-native';

const {width, height} = Dimensions.get('window');

const GREEN = '#16A34A';
const DARK_GREEN = '#16883E';
const DARK = '#1B2536';
const MUTED = '#7B8494';
const PAGE_BG = '#F7F8F7';
const BORDER = '#E9EDEF';

const PAGE_PADDING = width * 0.037;

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

const RECOMMENDED_PRODUCTS = [
  {
    id: 'micro',
    name: 'Micronutrient Mix',
    price: 420,
    image: require('../../assets/bazar/dap-fertilizer.jpg'),
  },
  {
    id: 'neem',
    name: 'Neem Oil Spray',
    price: 280,
    image: require('../../assets/bazar/dap-fertilizer.jpg'),
  },
  {
    id: 'bio',
    name: 'Bio Fertilizer',
    price: 350,
    image: require('../../assets/bazar/dap-fertilizer.jpg'),
  },
];

const formatINR = value =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function OrderSuccessScreen({navigation, route}) {
  const orderId = route?.params?.orderId || '#KM458921';
  const totalAmount = route?.params?.totalAmount || 5080;
  const savedAmount = route?.params?.savedAmount || 389;
  const paymentMethod =
    route?.params?.paymentMethod || 'Cash on Delivery';

 const handleTrackOrder = () => {
  navigation.navigate('OrderDetails', {
    orderNumber: '#KM458921',
    status: 'Packed',
    totalAmount,
    savedAmount,
    paymentMethod,
  });
};

  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'AgriProducts'}],
    });
  };

  const handleAddProduct = product => {
    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart.`,
      [
        {
          text: 'Continue',
        },
        {
          text: 'Open Cart',
          onPress: () => navigation.navigate('Cart'),
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroContainer}>
          <Image
            source={require('../../assets/bazar/order-success-farmer.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <LinearGradient
            colors={[
              'rgba(0,0,0,0.02)',
              'rgba(0,0,0,0.12)',
            ]}
            style={styles.heroOverlay}
          />

          <View style={styles.successCircleOuter}>
            <View style={styles.successCircle}>
              <Check
                size={rf(35)}
                color="#FFFFFF"
                strokeWidth={3.1}
              />
            </View>
          </View>
        </View>

        <View style={styles.successContent}>
          <Text style={styles.successTitle}>
            Order Placed Successfully!
          </Text>

          <Text style={styles.celebration}>🎉</Text>

          <Text style={styles.successDescription}>
            Your order has been confirmed and is being{'\n'}
            prepared for dispatch to your farm.
          </Text>
        </View>

        <OrderDetailsCard
          orderId={orderId}
          totalAmount={totalAmount}
          savedAmount={savedAmount}
          paymentMethod={paymentMethod}
        />

        <OrderStatusCard />

        <FarmingTipCard />

        <View style={styles.recommendedHeader}>
          <Text style={styles.recommendedTitle}>
            You May Also Need
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AgriProducts')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsRow}>
          {RECOMMENDED_PRODUCTS.map(product => (
            <RecommendedProductCard
              key={product.id}
              product={product}
              onAdd={() => handleAddProduct(product)}
            />
          ))}
        </ScrollView>
      </ScrollView>

      <View style={styles.bottomBar}>
       <TouchableOpacity
  activeOpacity={0.9}
  onPress={handleTrackOrder}
  style={styles.trackButton}>
  <MapPin
    size={rf(20)}
    color="#FFFFFF"
    strokeWidth={2.5}
  />

  <Text style={styles.trackButtonText}>
    Track Order
  </Text>
</TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleContinueShopping}
          style={styles.continueButton}>
          <ShoppingBag
            size={rf(19)}
            color={DARK_GREEN}
            strokeWidth={2.4}
          />

          <Text style={styles.continueButtonText}>
            Continue Shopping
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function OrderDetailsCard({
  orderId,
  totalAmount,
  savedAmount,
  paymentMethod,
}) {
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderIdLabel}>ORDER ID</Text>

          <Text style={styles.orderId}>{orderId}</Text>
        </View>

        <Text style={styles.orderTime}>Today, 10:42 AM</Text>
      </View>

      <View style={styles.orderGrid}>
        <View style={styles.orderGridItem}>
          <Text style={styles.orderGridLabel}>
            EST. DELIVERY
          </Text>

          <Text style={styles.deliveryDate}>
            26 June 2026
          </Text>
        </View>

        <View style={styles.orderGridItem}>
          <Text style={styles.orderGridLabel}>PAYMENT</Text>

          <Text style={styles.paymentValue}>
            {paymentMethod}
          </Text>
        </View>

        <View style={styles.orderGridItem}>
          <Text style={styles.orderGridLabel}>
            TOTAL AMOUNT
          </Text>

          <Text style={styles.greenValue}>
            {formatINR(totalAmount)}
          </Text>
        </View>

        <View style={styles.orderGridItem}>
          <Text style={styles.orderGridLabel}>YOU SAVED</Text>

          <Text style={styles.greenValue}>
            {formatINR(savedAmount)} 🎉
          </Text>
        </View>
      </View>
    </View>
  );
}

function OrderStatusCard() {
  const steps = [
    {
      id: 'confirmed',
      label: 'Order\nConfirmed',
      Icon: Check,
      active: true,
    },
    {
      id: 'packed',
      label: 'Packed',
      Icon: Package,
      active: false,
    },
    {
      id: 'shipped',
      label: 'Shipped',
      Icon: Truck,
      active: false,
    },
    {
      id: 'delivered',
      label: 'Delivered',
      Icon: Home,
      active: false,
    },
  ];

  return (
    <View style={styles.statusCard}>
      <Text style={styles.cardTitle}>Order Status</Text>

      <View style={styles.statusRow}>
        {steps.map((step, index) => {
          const Icon = step.Icon;

          return (
            <React.Fragment key={step.id}>
              <View style={styles.statusStep}>
                <View
                  style={[
                    styles.statusIconCircle,
                    step.active && styles.activeStatusCircle,
                  ]}>
                  <Icon
                    size={rf(18)}
                    color={
                      step.active ? '#FFFFFF' : '#AAB2BE'
                    }
                    strokeWidth={2.5}
                  />
                </View>

                <Text
                  style={[
                    styles.statusLabel,
                    step.active && styles.activeStatusLabel,
                  ]}>
                  {step.label}
                </Text>
              </View>

              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.statusLine,
                    index === 0 && styles.activeStatusLine,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

function FarmingTipCard() {
  return (
    <LinearGradient
      colors={['#168F3F', '#18A948']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.tipCard}>
      <View style={styles.tipCircle} />

      <View style={styles.tipBadge}>
        <Sparkles
          size={rf(12)}
          color="#FACC15"
          fill="#FACC15"
          strokeWidth={2.2}
        />

        <Text style={styles.tipBadgeText}>
          AI FARMING TIP
        </Text>
      </View>

      <Text style={styles.tipTitle}>
        Maximize Your Soybean Yield
      </Text>

      <Text style={styles.tipDescription}>
        The fertilizer you ordered is recommended for your
        Soybean crop during the vegetative stage. Proper
        application will improve nutrient uptake and strengthen
        root development.
      </Text>

      <View style={styles.tipInfoCard}>
        <View style={styles.tipClockBox}>
          <Clock3
            size={rf(19)}
            color="#FFFFFF"
            strokeWidth={2.3}
          />
        </View>

        <Text style={styles.tipInfoText}>
          Apply within 5–7 days after delivery for best results.
          Early morning or evening application is ideal.
        </Text>
      </View>
    </LinearGradient>
  );
}

function RecommendedProductCard({product, onAdd}) {
  return (
    <View style={styles.productCard}>
      <View style={styles.productImageBox}>
        <Image
          source={product.image}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>

      <Text numberOfLines={2} style={styles.productName}>
        {product.name}
      </Text>

      <Text style={styles.productPrice}>
        {formatINR(product.price)}
      </Text>

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onAdd}
        style={styles.addButton}>
        <Plus
          size={rf(15)}
          color="#FFFFFF"
          strokeWidth={2.7}
        />

        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingBottom: 155,
    backgroundColor: PAGE_BG,
  },

  heroContainer: {
    width: '100%',
    height: width * 0.6,
    backgroundColor: '#E5E7EB',
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  successCircleOuter: {
    position: 'absolute',
    left: '50%',
    bottom: -34,
    width: 74,
    height: 74,
    marginLeft: -37,
    borderRadius: 37,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#16A34A',
    shadowOpacity: 0.23,
    shadowRadius: 13,
    shadowOffset: {width: 0, height: 7},
    elevation: 7,
  },

  successCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#1BB651',
    alignItems: 'center',
    justifyContent: 'center',
  },

  successContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 67,
    paddingBottom: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  successTitle: {
    fontSize: rf(24),
    lineHeight: rf(30),
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
    letterSpacing: -0.4,
  },

  celebration: {
    marginTop: 4,
    fontSize: rf(20),
  },

  successDescription: {
    marginTop: 12,
    fontSize: rf(14),
    lineHeight: rf(21),
    fontWeight: '500',
    color: MUTED,
    textAlign: 'center',
  },

  orderCard: {
    marginHorizontal: PAGE_PADDING,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',

    shadowColor: '#111827',
    shadowOpacity: 0.035,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },

  orderHeader: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#17AA4B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  orderIdLabel: {
    fontSize: rf(9),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.4,
  },

  orderId: {
    marginTop: 4,
    fontSize: rf(18),
    lineHeight: rf(22),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  orderTime: {
    fontSize: rf(9),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
  },

  orderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  orderGridItem: {
    width: '50%',
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EDF0F1',
  },

  orderGridLabel: {
    fontSize: rf(9),
    fontWeight: '800',
    color: '#98A1AF',
    letterSpacing: 0.25,
  },

  deliveryDate: {
    marginTop: 6,
    fontSize: rf(13),
    fontWeight: '900',
    color: '#16883E',
  },

  paymentValue: {
    marginTop: 6,
    fontSize: rf(12),
    fontWeight: '900',
    color: '#F97316',
  },

  greenValue: {
    marginTop: 6,
    fontSize: rf(14),
    fontWeight: '900',
    color: '#16883E',
  },

  statusCard: {
    marginHorizontal: PAGE_PADDING,
    marginTop: 23,
    minHeight: 145,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: '#111827',
    shadowOpacity: 0.025,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 1,
  },

  cardTitle: {
    fontSize: rf(14),
    fontWeight: '900',
    color: DARK,
  },

  statusRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  statusStep: {
    width: 54,
    alignItems: 'center',
  },

  statusIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeStatusCircle: {
    backgroundColor: '#20C760',
  },

  statusLine: {
    flex: 1,
    height: 2,
    marginTop: 18,
    backgroundColor: '#E4E8EC',
  },

  activeStatusLine: {
    backgroundColor: '#20C760',
  },

  statusLabel: {
    marginTop: 8,
    fontSize: rf(8),
    lineHeight: rf(11),
    fontWeight: '700',
    color: '#9CA4B1',
    textAlign: 'center',
  },

  activeStatusLabel: {
    color: '#16A34A',
    fontWeight: '900',
  },

  tipCard: {
    marginHorizontal: PAGE_PADDING,
    marginTop: 24,
    minHeight: 335,
    borderRadius: 16,
    paddingHorizontal: 23,
    paddingTop: 24,
    paddingBottom: 23,
    overflow: 'hidden',
  },

  tipCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    right: -35,
    top: -42,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  tipBadge: {
    alignSelf: 'flex-start',
    height: 27,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  tipBadgeText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.25,
  },

  tipTitle: {
    marginTop: 19,
    fontSize: rf(19),
    lineHeight: rf(24),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  tipDescription: {
    marginTop: 11,
    maxWidth: '94%',
    fontSize: rf(14),
    lineHeight: rf(23),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },

  tipInfoCard: {
    marginTop: 22,
    minHeight: 79,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.19)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  tipClockBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(0,130,55,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tipInfoText: {
    flex: 1,
    marginLeft: 13,
    fontSize: rf(11),
    lineHeight: rf(16),
    fontWeight: '500',
    color: '#FFFFFF',
  },

  recommendedHeader: {
    marginTop: 26,
    marginBottom: 14,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  recommendedTitle: {
    fontSize: rf(18),
    fontWeight: '900',
    color: DARK,
  },

  seeAllText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: DARK_GREEN,
  },

  productsRow: {
    paddingHorizontal: PAGE_PADDING,
    paddingRight: PAGE_PADDING + 10,
    gap: 11,
  },

  productCard: {
    width: width * 0.37,
    minHeight: 235,
    borderRadius: 8,
    padding: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,

    shadowColor: '#111827',
    shadowOpacity: 0.035,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },

  productImageBox: {
    width: '100%',
    height: 125,
    borderRadius: 4,
    backgroundColor: '#F8FAF9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  productImage: {
    width: '94%',
    height: '94%',
  },

  productName: {
    minHeight: rf(34),
    marginTop: 10,
    fontSize: rf(11),
    lineHeight: rf(15),
    fontWeight: '900',
    color: DARK,
  },

  productPrice: {
    marginTop: 3,
    fontSize: rf(15),
    fontWeight: '900',
    color: DARK_GREEN,
  },

  addButton: {
    marginTop: 9,
    height: 34,
    borderRadius: 7,
    backgroundColor: '#20C760',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  addButtonText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    gap: 10,
  },

  trackButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#16AA49',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,

    shadowColor: '#16A34A',
    shadowOpacity: 0.2,
    shadowRadius: 9,
    shadowOffset: {width: 0, height: 5},
    elevation: 5,
  },

  trackButtonText: {
    fontSize: rf(17),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  continueButton: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1.7,
    borderColor: DARK_GREEN,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  continueButtonText: {
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK_GREEN,
  },
});