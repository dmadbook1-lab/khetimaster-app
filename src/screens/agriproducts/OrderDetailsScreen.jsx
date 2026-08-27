import React, {useMemo, useState} from 'react';
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
  ArrowLeft,
  MessagesSquare,
  Package,
  Truck,
  MapPin,
  Home,
  Check,
  Box,
  Phone,
  MessageSquare,
  Map,
  Download,
  FileText,
  ReceiptText,
  ChevronRight,
  Sparkles,
  Bell,
  Star,
  RefreshCcw,
  CircleX,
  Store,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const GREEN = '#16883E';
const BRIGHT_GREEN = '#1DB954';
const DARK = '#1D2738';
const MUTED = '#8A93A3';
const PAGE_BG = '#F7F8F7';
const BORDER = '#EAEDEF';
const ORANGE = '#F97316';
const RED = '#FF4D59';

const PAGE_PADDING = width * 0.037;

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size - 2,
    Math.min(size * scale, size + 2),
  );
};

const ORDER_PRODUCTS = [
  {
    id: 'dap',
    brand: 'IFFCO',
    name: 'IFFCO DAP Fertilizer',
    quantity: 2,
    unitPrice: 1350,
    price: 2700,
    image: require('../../assets/bazar/dap-fertilizer.jpg'),
  },
  {
    id: 'micro',
    brand: '',
    name: 'Micronutrient Mix',
    quantity: 1,
    unitPrice: 420,
    price: 420,
    image: require('../../assets/bazar/dap-fertilizer.jpg'),
  },
  {
    id: 'neem',
    brand: '',
    name: 'Neem Oil Spray 1L',
    quantity: 1,
    unitPrice: 280,
    price: 280,
    image: require('../../assets/bazar/dap-fertilizer.jpg'),
  },
];

const formatINR = value =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;

export default function OrderDetailsScreen({
  navigation,
  route,
}) {
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const orderNumber =
    route?.params?.orderNumber || '#KM458921';

  const orderStatus =
    route?.params?.status || 'Packed';

  const products =
    route?.params?.products || ORDER_PRODUCTS;

  const totalProducts = useMemo(
    () => products.length,
    [products],
  );

  const handleViewProduct = product => {
    navigation.navigate('ProductDetails', {
      product,
    });
  };

  const handleTrackShipment = () => {
    Alert.alert(
      'Track Shipment',
      'Current shipment status: Packed. Tracking ID: DEL9234871KM',
    );
  };

  const handleDownloadDocument = documentName => {
    Alert.alert(
      documentName,
      `${documentName} download will start here.`,
    );
  };

  const handleCallSeller = () => {
    Alert.alert(
      'Call Seller',
      'Calling IFFCO Official Store...',
    );
  };

  const handleChatSeller = () => {
    Alert.alert(
      'Chat Seller',
      'Opening seller chat...',
    );
  };

  const handleEnableReminder = () => {
    setReminderEnabled(current => !current);

    Alert.alert(
      reminderEnabled
        ? 'Reminder Disabled'
        : 'Reminder Enabled',
      reminderEnabled
        ? 'The farming reminder has been disabled.'
        : 'You will be reminded about the best application time.',
    );
  };

  const handleRateOrder = () => {
    Alert.alert(
      'Rate Order',
      'Order rating screen can be opened here.',
    );
  };

  const handleReorder = () => {
    navigation.navigate('Cart', {
      initialCartItems: products.map(product => ({
        ...product,
        price: product.unitPrice,
      })),
    });
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Order Cancelled',
              'Your order cancellation request has been submitted.',
            );
          },
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

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <ArrowLeft
            size={rf(23)}
            color={DARK}
            strokeWidth={2.4}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Order Details
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleChatSeller}
          style={styles.headerChatButton}>
          <MessagesSquare
            size={rf(21)}
            color={GREEN}
            strokeWidth={2.3}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <OrderHeroCard
          orderNumber={orderNumber}
          orderStatus={orderStatus}
        />

        <OrderProgressCard />

        <DeliveryAddressCard />

        <OrderedProductsCard
          products={products}
          totalProducts={totalProducts}
          onViewProduct={handleViewProduct}
        />

        <Text style={styles.sectionTitle}>
          Seller Information
        </Text>

        <SellerCard
          onCall={handleCallSeller}
          onChat={handleChatSeller}
        />

        <Text style={styles.sectionTitle}>
          Delivery Partner
        </Text>

        <DeliveryPartnerCard
          onTrack={handleTrackShipment}
        />

        <Text style={styles.sectionTitle}>
          Invoice & Documents
        </Text>

        <DocumentsCard
          onPress={handleDownloadDocument}
        />

        <ReminderCard
          enabled={reminderEnabled}
          onPress={handleEnableReminder}
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleRateOrder}
            style={styles.rateButton}>
            <Star
              size={rf(18)}
              color={ORANGE}
              strokeWidth={2.4}
            />

            <Text style={styles.rateButtonText}>
              Rate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleReorder}
            style={styles.reorderButton}>
            <RefreshCcw
              size={rf(18)}
              color="#FFFFFF"
              strokeWidth={2.4}
            />

            <Text style={styles.reorderButtonText}>
              Reorder
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleCancelOrder}
          style={styles.cancelButton}>
          <CircleX
            size={rf(17)}
            color={RED}
            strokeWidth={2.4}
          />

          <Text style={styles.cancelButtonText}>
            Cancel Order
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function OrderHeroCard({
  orderNumber,
  orderStatus,
}) {
  return (
    <LinearGradient
      colors={['#17A84A', '#16883E']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.heroCard}>
      <View style={styles.heroTopRow}>
        <View>
          <Text style={styles.orderNumberLabel}>
            ORDER NUMBER
          </Text>

          <Text style={styles.orderNumber}>
            {orderNumber}
          </Text>
        </View>

        <View style={styles.statusBadge}>
          <Package
            size={rf(13)}
            color="#FFFFFF"
            fill="rgba(255,255,255,0.35)"
            strokeWidth={2.3}
          />

          <Text style={styles.statusBadgeText}>
            {orderStatus}
          </Text>
        </View>
      </View>

      <View style={styles.deliveryInfoBox}>
        <View style={styles.deliveryTruckBox}>
          <Truck
            size={rf(23)}
            color="#FFFFFF"
            strokeWidth={2.3}
          />
        </View>

        <View style={styles.deliveryInfoContent}>
          <Text style={styles.estimatedLabel}>
            ESTIMATED DELIVERY
          </Text>

          <Text style={styles.estimatedDate}>
            Tomorrow, 26 June{'\n'}
            2026
          </Text>
        </View>

        <View style={styles.freeBadge}>
          <Truck
            size={rf(12)}
            color="#FFFFFF"
            fill="#FFFFFF"
          />

          <Text style={styles.freeBadgeText}>
            Free
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function OrderProgressCard() {
  const steps = [
    {
      id: 'placed',
      label: 'Order\nPlaced',
      Icon: Check,
      completed: true,
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      Icon: Check,
      completed: true,
    },
    {
      id: 'packed',
      label: 'Packed',
      Icon: Box,
      active: true,
    },
    {
      id: 'shipped',
      label: 'Shipped',
      Icon: Truck,
    },
    {
      id: 'out',
      label: 'Out for\nDelivery',
      Icon: MapPin,
    },
    {
      id: 'delivered',
      label: 'Delivered',
      Icon: Home,
    },
  ];

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressRow}>
        {steps.map((step, index) => {
          const Icon = step.Icon;
          const highlighted =
            step.completed || step.active;

          return (
            <React.Fragment key={step.id}>
              <View style={styles.progressStep}>
                <View
                  style={[
                    styles.progressCircle,
                    step.completed &&
                      styles.completedProgressCircle,
                    step.active &&
                      styles.activeProgressCircle,
                  ]}>
                  <Icon
                    size={rf(15)}
                    color={
                      highlighted
                        ? step.active
                          ? GREEN
                          : '#FFFFFF'
                        : '#C4CBD4'
                    }
                    strokeWidth={2.5}
                  />
                </View>

                <Text
                  style={[
                    styles.progressLabel,
                    highlighted &&
                      styles.highlightedProgressLabel,
                  ]}>
                  {step.label}
                </Text>
              </View>

              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.progressLine,
                    index < 2 &&
                      styles.activeProgressLine,
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

function DeliveryAddressCard() {
  return (
    <View style={styles.addressCard}>
      <View style={styles.addressIconBox}>
        <MapPin
          size={rf(23)}
          color={GREEN}
          strokeWidth={2.4}
        />
      </View>

      <View style={styles.addressContent}>
        <Text style={styles.addressLabel}>
          DELIVERY ADDRESS
        </Text>

        <Text style={styles.addressName}>
          Patil Farm
        </Text>

        <Text style={styles.addressText}>
          Village Khadki, Aurangabad{'\n'}
          Maharashtra – 431001
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          Alert.alert(
            'Change Address',
            'Delivery address settings can be opened here.',
          )
        }
        style={styles.changeAddressButton}>
        <Text style={styles.changeAddressText}>
          Change
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function OrderedProductsCard({
  products,
  totalProducts,
  onViewProduct,
}) {
  return (
    <View style={styles.productsCard}>
      <View style={styles.productsHeader}>
        <Text style={styles.cardHeading}>
          Ordered Products
        </Text>

        <View style={styles.itemsBadge}>
          <Text style={styles.itemsBadgeText}>
            {totalProducts} Items
          </Text>
        </View>
      </View>

      {products.map((product, index) => (
        <View
          key={product.id}
          style={[
            styles.productRow,
            index === products.length - 1 &&
              styles.lastProductRow,
          ]}>
          <View style={styles.productImageBox}>
            <Image
              source={product.image}
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.productContent}>
            <Text
              numberOfLines={2}
              style={styles.productName}>
              {product.name}
            </Text>

            <Text style={styles.productMeta}>
              Qty: {product.quantity} ×{' '}
              {formatINR(product.unitPrice)}
            </Text>

            <Text style={styles.productPrice}>
              {formatINR(product.price)}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onViewProduct(product)}
            style={styles.viewButton}>
            <Text style={styles.viewButtonText}>
              View
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

function SellerCard({
  onCall,
  onChat,
}) {
  return (
    <View style={styles.sellerCard}>
      <View style={styles.sellerInfoRow}>
        <View style={styles.sellerLogo}>
          <Text style={styles.sellerLogoText}>
            IFFCO
          </Text>
        </View>

        <View style={styles.sellerDetails}>
          <Text style={styles.sellerName}>
            IFFCO Official Store
          </Text>

          <View style={styles.verifiedRow}>
            <View style={styles.verifiedBadge}>
              <Check
                size={rf(10)}
                color={GREEN}
                strokeWidth={3}
              />

              <Text style={styles.verifiedText}>
                Verified Seller
              </Text>
            </View>

            <Star
              size={rf(11)}
              color="#FACC15"
              fill="#FACC15"
            />

            <Text style={styles.ratingText}>
              4.9
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sellerActions}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onCall}
          style={styles.callButton}>
          <Phone
            size={rf(17)}
            color="#FFFFFF"
            strokeWidth={2.4}
          />

          <Text style={styles.callButtonText}>
            Call Seller
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onChat}
          style={styles.chatButton}>
          <MessageSquare
            size={rf(17)}
            color={BRIGHT_GREEN}
            strokeWidth={2.4}
          />

          <Text style={styles.chatButtonText}>
            Chat Seller
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DeliveryPartnerCard({
  onTrack,
}) {
  return (
    <View style={styles.deliveryPartnerCard}>
      <View style={styles.partnerInfoRow}>
        <View style={styles.partnerIconBox}>
          <Truck
            size={rf(25)}
            color="#3B82F6"
            strokeWidth={2.3}
          />
        </View>

        <View style={styles.partnerDetails}>
          <Text style={styles.partnerName}>
            Delhivery Express
          </Text>

          <Text style={styles.trackingText}>
            Tracking ID:{' '}
            <Text style={styles.trackingId}>
              DEL9234871KM
            </Text>
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onTrack}
        style={styles.trackShipmentButton}>
        <Map
          size={rf(19)}
          color="#FFFFFF"
          strokeWidth={2.4}
        />

        <Text style={styles.trackShipmentText}>
          Track Shipment
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function DocumentsCard({
  onPress,
}) {
  const documents = [
    {
      id: 'invoice',
      title: 'Download Invoice',
      Icon: Download,
    },
    {
      id: 'gst',
      title: 'GST Invoice',
      Icon: FileText,
    },
    {
      id: 'receipt',
      title: 'Order Receipt',
      Icon: ReceiptText,
    },
  ];

  return (
    <View style={styles.documentsCard}>
      {documents.map((document, index) => {
        const Icon = document.Icon;

        return (
          <TouchableOpacity
            key={document.id}
            activeOpacity={0.8}
            onPress={() => onPress(document.title)}
            style={[
              styles.documentRow,
              index === documents.length - 1 &&
                styles.lastDocumentRow,
            ]}>
            <View style={styles.documentIconBox}>
              <Icon
                size={rf(21)}
                color={GREEN}
                strokeWidth={2.3}
              />
            </View>

            <Text style={styles.documentTitle}>
              {document.title}
            </Text>

            <ChevronRight
              size={rf(21)}
              color="#98A1AF"
              strokeWidth={2.3}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ReminderCard({
  enabled,
  onPress,
}) {
  return (
    <LinearGradient
      colors={['#16883E', '#188D40']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.reminderCard}>
      <View style={styles.reminderCircle} />

      <View style={styles.reminderBadge}>
        <Sparkles
          size={rf(11)}
          color="#FFFFFF"
          strokeWidth={2.3}
        />

        <Text style={styles.reminderBadgeText}>
          AI Reminder
        </Text>
      </View>

      <Text style={styles.reminderTitle}>
        Smart Application Reminder
      </Text>

      <Text style={styles.reminderDescription}>
        “When your fertilizer arrives, KhetiMaster will remind
        you about the best application time based on weather,
        crop stage, and soil conditions – so your Soybean crop
        gets maximum benefit.”
      </Text>

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[
          styles.enableReminderButton,
          enabled && styles.enabledReminderButton,
        ]}>
        <Bell
          size={rf(18)}
          color="#FFFFFF"
          fill={enabled ? '#FFFFFF' : 'transparent'}
          strokeWidth={2.3}
        />

        <Text style={styles.enableReminderText}>
          {enabled
            ? 'Reminder Enabled'
            : 'Enable Reminder'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 63,
    paddingHorizontal: PAGE_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0F1',
  },

  backButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: rf(20),
    lineHeight: rf(25),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.35,
  },

  headerChatButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#DDF8E7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 17,
    paddingBottom: 165,
    backgroundColor: PAGE_BG,
  },

  heroCard: {
    minHeight: 178,
    borderRadius: 15,
    padding: 16,
    overflow: 'hidden',
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  orderNumberLabel: {
    fontSize: rf(10),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 0.3,
  },

  orderNumber: {
    marginTop: 3,
    fontSize: rf(21),
    lineHeight: rf(26),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  statusBadge: {
    minHeight: 25,
    paddingHorizontal: 11,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  statusBadgeText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  deliveryInfoBox: {
    minHeight: 88,
    marginTop: 17,
    borderRadius: 13,
    paddingHorizontal: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  deliveryTruckBox: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.19)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deliveryInfoContent: {
    flex: 1,
    marginLeft: 13,
  },

  estimatedLabel: {
    fontSize: rf(9),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },

  estimatedDate: {
    marginTop: 3,
    fontSize: rf(16),
    lineHeight: rf(22),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  freeBadge: {
    minHeight: 24,
    paddingHorizontal: 9,
    borderRadius: 5,
    backgroundColor: ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  freeBadgeText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  progressCard: {
    minHeight: 88,
    marginTop: 16,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingTop: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  progressStep: {
    width: 43,
    alignItems: 'center',
  },

  progressCircle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E4E8EC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  completedProgressCircle: {
    borderColor: GREEN,
    backgroundColor: GREEN,
  },

  activeProgressCircle: {
    borderWidth: 2,
    borderColor: GREEN,
    backgroundColor: '#EAFBF0',
  },

  progressLine: {
    flex: 1,
    height: 2,
    marginTop: 13,
    backgroundColor: '#ECEFF1',
  },

  activeProgressLine: {
    backgroundColor: GREEN,
  },

  progressLabel: {
    marginTop: 6,
    fontSize: rf(7),
    lineHeight: rf(9),
    fontWeight: '600',
    color: '#B4BBC5',
    textAlign: 'center',
  },

  highlightedProgressLabel: {
    color: GREEN,
    fontWeight: '900',
  },

  addressCard: {
    minHeight: 128,
    marginTop: 16,
    borderRadius: 13,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  addressIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addressContent: {
    flex: 1,
    marginLeft: 15,
  },

  addressLabel: {
    fontSize: rf(9),
    fontWeight: '800',
    color: '#A1A9B5',
    letterSpacing: 0.3,
  },

  addressName: {
    marginTop: 8,
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },

  addressText: {
    marginTop: 5,
    fontSize: rf(13),
    lineHeight: rf(20),
    fontWeight: '500',
    color: MUTED,
  },

  changeAddressButton: {
    height: 31,
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: '#E7F6EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  changeAddressText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: GREEN,
  },

  productsCard: {
    marginTop: 16,
    borderRadius: 13,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  productsHeader: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardHeading: {
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },

  itemsBadge: {
    height: 25,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemsBadgeText: {
    fontSize: rf(10),
    fontWeight: '700',
    color: '#8C95A2',
  },

  productRow: {
    minHeight: 101,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F2',
    flexDirection: 'row',
    alignItems: 'center',
  },

  lastProductRow: {
    paddingBottom: 4,
  },

  productImageBox: {
    width: 61,
    height: 61,
    borderRadius: 5,
    backgroundColor: '#F8FAF9',
    borderWidth: 1,
    borderColor: '#EEF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  productImage: {
    width: '92%',
    height: '92%',
  },

  productContent: {
    flex: 1,
    marginLeft: 14,
  },

  productName: {
    fontSize: rf(13),
    lineHeight: rf(17),
    fontWeight: '900',
    color: DARK,
  },

  productMeta: {
    marginTop: 4,
    fontSize: rf(10),
    fontWeight: '500',
    color: MUTED,
  },

  productPrice: {
    marginTop: 4,
    fontSize: rf(15),
    fontWeight: '900',
    color: GREEN,
  },

  viewButton: {
    height: 31,
    minWidth: 62,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewButtonText: {
    fontSize: rf(11),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  sectionTitle: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: rf(16),
    lineHeight: rf(20),
    fontWeight: '900',
    color: DARK,
  },

  sellerCard: {
    minHeight: 134,
    borderRadius: 13,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  sellerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sellerLogo: {
    width: 49,
    height: 49,
    borderRadius: 8,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sellerLogoText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  sellerDetails: {
    flex: 1,
    marginLeft: 13,
  },

  sellerName: {
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },

  verifiedRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  verifiedBadge: {
    height: 19,
    paddingHorizontal: 5,
    borderRadius: 4,
    backgroundColor: '#E8F8ED',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  verifiedText: {
    fontSize: rf(8),
    fontWeight: '800',
    color: GREEN,
  },

  ratingText: {
    marginLeft: 4,
    fontSize: rf(9),
    fontWeight: '600',
    color: '#7E8795',
  },

  sellerActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 11,
  },

  callButton: {
    flex: 1,
    height: 40,
    borderRadius: 7,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  callButtonText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  chatButton: {
    flex: 1,
    height: 40,
    borderRadius: 7,
    borderWidth: 1.3,
    borderColor: BRIGHT_GREEN,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  chatButtonText: {
    fontSize: rf(13),
    fontWeight: '900',
    color: BRIGHT_GREEN,
  },

  deliveryPartnerCard: {
    minHeight: 139,
    borderRadius: 13,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  partnerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  partnerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  partnerDetails: {
    flex: 1,
    marginLeft: 14,
  },

  partnerName: {
    fontSize: rf(16),
    fontWeight: '900',
    color: DARK,
  },

  trackingText: {
    marginTop: 4,
    fontSize: rf(10),
    fontWeight: '500',
    color: MUTED,
  },

  trackingId: {
    fontWeight: '900',
    color: GREEN,
  },

  trackShipmentButton: {
    height: 46,
    marginTop: 15,
    borderRadius: 9,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  trackShipmentText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  documentsCard: {
    borderRadius: 13,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },

  documentRow: {
    height: 69,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F2',
    flexDirection: 'row',
    alignItems: 'center',
  },

  lastDocumentRow: {
    borderBottomWidth: 0,
  },

  documentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 9,
    backgroundColor: '#EAFBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  documentTitle: {
    flex: 1,
    marginLeft: 13,
    fontSize: rf(14),
    fontWeight: '800',
    color: '#566071',
  },

  reminderCard: {
    minHeight: 316,
    marginTop: 17,
    borderRadius: 15,
    padding: 23,
    overflow: 'hidden',

    shadowColor: GREEN,
    shadowOpacity: 0.17,
    shadowRadius: 11,
    shadowOffset: {width: 0, height: 7},
    elevation: 5,
  },

  reminderCircle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    right: -38,
    top: -42,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  reminderBadge: {
    alignSelf: 'flex-start',
    height: 25,
    paddingHorizontal: 11,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.27)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  reminderBadgeText: {
    fontSize: rf(8),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  reminderTitle: {
    marginTop: 21,
    fontSize: rf(20),
    lineHeight: rf(25),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  reminderDescription: {
    marginTop: 15,
    fontSize: rf(13),
    lineHeight: rf(21),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.86)',
  },

  enableReminderButton: {
    height: 51,
    marginTop: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.52)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  enabledReminderButton: {
    backgroundColor: 'rgba(255,255,255,0.24)',
  },

  enableReminderText: {
    fontSize: rf(16),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: PAGE_PADDING,
    paddingTop: 13,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 11,
  },

  rateButton: {
    flex: 1,
    height: 57,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFD3A0',
    backgroundColor: '#FFF9F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  rateButtonText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: ORANGE,
  },

  reorderButton: {
    flex: 1,
    height: 57,
    borderRadius: 14,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  reorderButtonText: {
    fontSize: rf(15),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  cancelButton: {
    height: 49,
    marginTop: 11,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#FFBEC3',
    backgroundColor: '#FFF4F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  cancelButtonText: {
    fontSize: rf(14),
    fontWeight: '900',
    color: RED,
  },
});