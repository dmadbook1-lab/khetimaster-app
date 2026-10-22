import React, { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowRight,
  Ban,
  Info,
  ShoppingCart,
  Sprout,
  Trash2,
  Truck,
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';

import MarketHero, {
  GlassButton,
  TopInset,
} from '../../components/market/MarketHero';
import {
  EmptyState,
  InfoRow,
  LoadingState,
  MarketButton,
} from '../../components/market/MarketBits';
import {
  MARKET_COLORS as C,
  MARKET_SHADOW,
} from '../../components/market/theme';
import FeedbackModal, {
  useFeedbackModal,
} from '../../components/common/FeedbackModal';
import Toast, { useToast } from '../../components/common/Toast';
import { PlantImage, QtyStepper } from '../../components/nursery/NurseryBits';
import useNurseryMeta from '../../components/nursery/useNurseryMeta';
import { NURSERY_ROUTES } from '../../constants/nurseryRoutes';
import {
  clearNurseryCart,
  fetchNurseryCart,
  removeNurseryCartItem,
  updateNurseryCartItem,
} from '../../redux/slices/nurseryCartSlice';
import { formatRupees } from '../../utils/marketFormat';
import { freeDeliveryGap } from '../../utils/nurseryFormat';

export default function NurseryCartScreen({ navigation }) {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const feedback = useFeedbackModal();
  const toast = useToast();
  const { delivery } = useNurseryMeta();

  const { cart, loaded, loading, error, busyItemId } = useSelector(
    state => state.nurseryCart,
  );

  const load = useCallback(() => dispatch(fetchNurseryCart()), [dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const changeQuantity = async (item, quantity) => {
    try {
      await dispatch(
        updateNurseryCartItem({ itemId: item._id, quantity }),
      ).unwrap();
    } catch (failure) {
      feedback.error('Could not update quantity', String(failure));
      load();
    }
  };

  const removeItem = (item, name) =>
    feedback.confirm({
      title: 'Remove from cart?',
      message: `${name} will be removed from your cart.`,
      confirmLabel: 'Remove',
      destructive: true,
      onConfirm: async () => {
        try {
          await dispatch(removeNurseryCartItem(item._id)).unwrap();
          toast.show('Removed from cart');
        } catch (failure) {
          feedback.error('Could not remove', String(failure));
        }
      },
    });

  const clearAll = () =>
    feedback.confirm({
      title: 'Empty your cart?',
      message: 'All plants will be removed from your cart.',
      confirmLabel: 'Empty Cart',
      destructive: true,
      onConfirm: async () => {
        try {
          await dispatch(clearNurseryCart()).unwrap();
          toast.show('Cart emptied');
        } catch (failure) {
          feedback.error('Could not empty cart', String(failure));
        }
      },
    });

  const items = cart.items || [];
  const unavailable = cart.unavailableItems || [];
  const gap = freeDeliveryGap(cart.subtotal, delivery);
  const progress = Math.min(cart.subtotal / delivery.freeAbove, 1);
  const hasAdjusted = items.some(item => item.quantityAdjusted);
  const isEmpty = loaded && !items.length && !unavailable.length;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TopInset />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loaded && loading}
            onRefresh={load}
            colors={[C.green]}
            tintColor={C.green}
          />
        }
      >
        <MarketHero
          compact
          gradient="forest"
          onBack={() => navigation.goBack()}
          eyebrow="Your cart"
          title={
            items.length
              ? `${cart.totalItems} ${
                  cart.totalItems === 1 ? 'plant' : 'plants'
                } ready`
              : 'Your cart'
          }
          subtitle={
            items.length
              ? 'Check quantities, then continue to delivery details.'
              : 'Plants you add will show up here.'
          }
          right={
            items.length || unavailable.length ? (
              <GlassButton onPress={clearAll}>
                <Trash2 size={18} color={C.white} />
              </GlassButton>
            ) : null
          }
        >
          {items.length > 0 && (
            <View style={styles.freeBox}>
              <View style={styles.freeRow}>
                <Truck size={15} color={C.white} />
                <Text style={styles.freeText}>
                  {gap > 0
                    ? `Add ${formatRupees(gap)} more for free delivery`
                    : 'You get free delivery!'}
                </Text>
              </View>
              <View style={styles.freeTrack}>
                <View
                  style={[styles.freeFill, { width: `${progress * 100}%` }]}
                />
              </View>
            </View>
          )}
        </MarketHero>

        <View style={styles.body}>
          {!loaded ? (
            error ? (
              <EmptyState
                title="Couldn't load your cart"
                message={error}
                actionLabel="Try Again"
                onAction={load}
              />
            ) : (
              <LoadingState />
            )
          ) : isEmpty ? (
            <EmptyState
              icon={<ShoppingCart size={30} color={C.green} />}
              title="Your cart is empty"
              message="Browse fruit plants, seedlings, flowers and more from nurseries near you."
              actionLabel="Browse Plants"
              onAction={() => navigation.navigate(NURSERY_ROUTES.HOME)}
            />
          ) : (
            <>
              {hasAdjusted && (
                <View style={[styles.notice, styles.noticeAmber]}>
                  <Info size={16} color={C.amber} />
                  <Text style={[styles.noticeText, styles.noticeTextAmber]}>
                    Some plants have less stock left. We lowered their quantity
                    to what is available.
                  </Text>
                </View>
              )}

              {items.map(item => {
                const plant = item.plant || {};
                const busy = busyItemId === item._id || busyItemId === 'all';

                return (
                  <View key={item._id} style={styles.itemCard}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate(NURSERY_ROUTES.PLANT, {
                          plantId: plant._id,
                        })
                      }
                    >
                      <PlantImage plant={plant} style={styles.itemImage} />
                    </TouchableOpacity>

                    <View style={styles.flex}>
                      <View style={styles.itemTop}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {plant.name}
                        </Text>
                        <TouchableOpacity
                          hitSlop={10}
                          disabled={busy}
                          onPress={() => removeItem(item, plant.name)}
                        >
                          <Trash2 size={16} color={C.muted} />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.itemMeta} numberOfLines={1}>
                        {formatRupees(plant.price)} each ·{' '}
                        {plant.seller?.name || 'Nursery'}
                      </Text>
                      {item.quantityAdjusted && (
                        <Text style={styles.adjusted}>
                          Only {plant.quantity} left
                        </Text>
                      )}

                      <View style={styles.itemBottom}>
                        <QtyStepper
                          value={item.quantity}
                          max={plant.quantity}
                          busy={busy}
                          onChange={quantity => changeQuantity(item, quantity)}
                        />
                        <Text style={styles.itemTotal}>
                          {formatRupees(item.itemTotal)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* NO LONGER AVAILABLE */}
              {unavailable.length > 0 && (
                <>
                  <Text style={styles.blockTitle}>Not available any more</Text>
                  {unavailable.map(item => (
                    <View
                      key={item._id}
                      style={[styles.itemCard, styles.itemUnavailable]}
                    >
                      <View style={[styles.itemImage, styles.unavailableIcon]}>
                        <Ban size={24} color={C.red} />
                      </View>
                      <View style={styles.flex}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.unavailableReason}>
                          {item.reason}. It won't be ordered.
                        </Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.removeButton}
                        disabled={busyItemId === item._id}
                        onPress={() => removeItem(item, item.name)}
                      >
                        <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}

              {/* BILL */}
              {items.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Bill summary</Text>
                  <InfoRow
                    label={`Plants (${cart.totalItems})`}
                    value={formatRupees(cart.subtotal)}
                  />
                  <InfoRow
                    label="Delivery"
                    value={
                      cart.deliveryFee ? formatRupees(cart.deliveryFee) : 'FREE'
                    }
                  />
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>To pay on delivery</Text>
                    <Text style={styles.totalValue}>
                      {formatRupees(cart.total)}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.addMore}
                onPress={() => navigation.navigate(NURSERY_ROUTES.HOME)}
              >
                <Sprout size={18} color={C.green} />
                <Text style={styles.addMoreText}>Add more plants</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {items.length > 0 && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 14) + 6 },
          ]}
        >
          <View style={styles.flex}>
            <Text style={styles.bottomLabel}>Total</Text>
            <Text style={styles.bottomPrice}>{formatRupees(cart.total)}</Text>
          </View>
          <MarketButton
            label="Checkout"
            icon={<ArrowRight size={17} color={C.white} />}
            disabled={!!busyItemId}
            onPress={() => navigation.navigate(NURSERY_ROUTES.CHECKOUT)}
            style={styles.flexWide}
          />
        </View>
      )}

      <FeedbackModal {...feedback.modalProps} />
      <Toast {...toast.toastProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 30 },
  body: { paddingHorizontal: 16, paddingTop: 14 },
  flex: { flex: 1 },
  flexWide: { flex: 1.4 },

  freeBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  freeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  freeText: { flex: 1, color: C.white, fontSize: 12.5, fontWeight: '800' },
  freeTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: 10,
    overflow: 'hidden',
  },
  freeFill: { height: '100%', borderRadius: 3, backgroundColor: C.gold },

  notice: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  noticeAmber: { backgroundColor: C.lightAmber },
  noticeText: { flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  noticeTextAmber: { color: '#8A5A00' },

  itemCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    ...MARKET_SHADOW,
  },
  itemImage: { width: 84, height: 84, borderRadius: 16 },
  itemTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  itemName: { flex: 1, fontSize: 14.5, fontWeight: '900', color: C.dark },
  itemMeta: { fontSize: 11.5, fontWeight: '600', color: C.muted, marginTop: 3 },
  adjusted: {
    alignSelf: 'flex-start',
    marginTop: 5,
    fontSize: 10.5,
    fontWeight: '900',
    color: C.amber,
    backgroundColor: C.lightAmber,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  itemTotal: { fontSize: 16, fontWeight: '900', color: C.dark },

  blockTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: C.dark,
    marginTop: 10,
    marginBottom: 10,
  },
  itemUnavailable: { alignItems: 'center', opacity: 0.92 },
  unavailableIcon: {
    width: 56,
    height: 56,
    backgroundColor: C.lightRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableReason: {
    fontSize: 11.5,
    fontWeight: '700',
    color: C.red,
    marginTop: 3,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 11,
    backgroundColor: C.lightRed,
  },
  removeText: { fontSize: 12, fontWeight: '900', color: C.red },

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginTop: 4,
    ...MARKET_SHADOW,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: C.dark,
    marginBottom: 4,
  },
  totalRow: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.lightGreen,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 13, fontWeight: '800', color: C.text },
  totalValue: { fontSize: 18, fontWeight: '900', color: C.green },

  addMore: {
    marginTop: 14,
    height: 54,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.green,
    backgroundColor: C.lightGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addMoreText: { fontSize: 13.5, fontWeight: '900', color: C.green },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  bottomLabel: { fontSize: 11, color: C.muted, fontWeight: '700' },
  bottomPrice: {
    fontSize: 19,
    color: C.dark,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
});
