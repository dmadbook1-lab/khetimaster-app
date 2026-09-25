import React, {useCallback, useEffect, memo, useMemo} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ChevronRight,
  Leaf,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchNurseryCart,
  removeNurseryCartItem,
  updateNurseryCartItem,
} from '../../redux/slices/nurseryCartSlice';

const GREEN = '#159447';
const DARK = '#151C2B';
const BG = '#F6F8F7';
const MUTED = '#747B78';
const BORDER = '#E3E8E5';
const LIGHT_GREEN = '#EAF7EF';

const CartItem = memo(({item, onUpdate, onRemove, updating, removing}) => {
  const plant = item?.plant;
  if (!plant) return null;

  const image = plant?.images?.length > 0 ? plant.images[0] : null;
  const quantity = Number(item.quantity || 1);
  const price = Number(plant.price || 0);

  return (
    <View style={styles.cartCard}>
      <View style={styles.imageWrapper}>
        {image ? (
          <Image
            source={{uri: image}}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <Leaf size={26} color={GREEN} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.name}>
          {plant.name}
        </Text>
        <Text style={styles.category}>{plant.category}</Text>
        <Text style={styles.price}>₹{price.toLocaleString('en-IN')}</Text>

        <View style={styles.bottomRow}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.quantityButton}
              disabled={updating}
              onPress={() => onUpdate(item, quantity - 1)}>
              <Minus size={14} color={DARK} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{quantity}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.quantityButton}
              disabled={updating}
              onPress={() => onUpdate(item, quantity + 1)}>
              <Plus size={14} color={DARK} />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemTotal}>
            ₹{(price * quantity).toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.removeButton}
        disabled={removing}
        onPress={() => onRemove(item)}>
        <Trash2 size={16} color="#D64545" />
      </TouchableOpacity>
    </View>
  );
});

const NurseryCartScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const {
    items = [],
    subtotal = 0,
    totalItems = 0,
    loading,
    updating,
    removing,
  } = useSelector(state => state.nurseryCart);

  const loadCart = useCallback(() => {
    dispatch(fetchNurseryCart());
  }, [dispatch]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQuantity = useCallback(
    async (item, nextQuantity) => {
      if (nextQuantity < 1) return;
      const maxStock = Number(item?.plant?.quantity || 0);
      if (nextQuantity > maxStock) {
        Alert.alert(
          'Stock limit',
          `Only ${maxStock} plants are currently available.`,
        );
        return;
      }
      try {
        await dispatch(
          updateNurseryCartItem({itemId: item._id, quantity: nextQuantity}),
        ).unwrap();
      } catch (error) {
        Alert.alert(
          'Unable to update',
          error?.message || 'Could not update cart quantity.',
        );
      }
    },
    [dispatch],
  );

  const removeItem = useCallback(
    item => {
      Alert.alert(
        'Remove from cart',
        `Remove ${item?.plant?.name || 'this plant'} from your cart?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                await dispatch(removeNurseryCartItem(item._id)).unwrap();
              } catch (error) {
                Alert.alert(
                  'Unable to remove',
                  error?.message || 'Could not remove item.',
                );
              }
            },
          },
        ],
      );
    },
    [dispatch],
  );

  const renderItem = useCallback(
    ({item}) => (
      <CartItem
        item={item}
        onUpdate={updateQuantity}
        onRemove={removeItem}
        updating={updating}
        removing={removing}
      />
    ),
    [updateQuantity, removeItem, updating, removing],
  );

  const keyExtractor = useCallback(item => item._id, []);

  const {deliveryFee, grandTotal} = useMemo(() => {
    const fee =
      Number(subtotal) >= 500 ? 0 : items.length > 0 ? 50 : 0;
    return {
      deliveryFee: fee,
      grandTotal: Number(subtotal) + fee,
    };
  }, [subtotal, items.length]);

  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.loadingScreen} edges={['top']}>
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={21} color={DARK} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Cart</Text>
          {totalItems > 0 && (
            <Text style={styles.headerSubtitle}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Text>
          )}
        </View>

        <View style={styles.headerIconBox}>
          <ShoppingBag size={20} color={GREEN} />
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <ShoppingBag size={38} color={GREEN} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Explore the Nursery marketplace and add plants you like.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.shopButton}
            onPress={() => navigation.navigate('NurseryHome')}>
            <Text style={styles.shopButtonText}>Browse Plants</Text>
            <ChevronRight size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            onRefresh={loadCart}
            refreshing={loading}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={7}
            removeClippedSubviews
          />

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ₹{Number(subtotal).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text
                style={[
                  styles.summaryValue,
                  deliveryFee === 0 && styles.freeText,
                ]}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.codText}>Cash on Delivery</Text>
              </View>
              <Text style={styles.totalValue}>
                ₹{grandTotal.toLocaleString('en-IN')}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('NurseryCheckout')}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <ChevronRight size={19} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: BG},
  loadingScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {marginTop: 12, color: MUTED, fontSize: 13},

  header: {
    height: 66,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F2F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {flex: 1, marginLeft: 13},
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.3,
  },
  headerSubtitle: {fontSize: 11, color: MUTED, marginTop: 2},
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: {padding: 15, paddingBottom: 20},

  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 11,
    marginBottom: 10,
    flexDirection: 'row',
  },
  imageWrapper: {
    width: 90,
    height: 105,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: '#EAF1EC',
  },
  image: {width: '100%', height: '100%'},
  noImage: {flex: 1, alignItems: 'center', justifyContent: 'center'},

  info: {flex: 1, marginLeft: 12, paddingRight: 28},
  name: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    color: DARK,
    letterSpacing: -0.2,
  },
  category: {marginTop: 3, fontSize: 10, color: GREEN, fontWeight: '700'},
  price: {marginTop: 6, fontSize: 16, fontWeight: '900', color: DARK},

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FAFBFA',
  },
  quantityButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    width: 28,
    textAlign: 'center',
    color: DARK,
    fontWeight: '800',
    fontSize: 12,
  },
  itemTotal: {fontSize: 14, fontWeight: '900', color: GREEN},

  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 18,
    fontSize: 19,
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.3,
  },
  emptyText: {
    textAlign: 'center',
    color: MUTED,
    lineHeight: 20,
    marginTop: 7,
    fontSize: 12,
  },
  shopButton: {
    marginTop: 22,
    backgroundColor: GREEN,
    borderRadius: 13,
    paddingHorizontal: 22,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    shadowColor: GREEN,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  shopButtonText: {color: '#FFFFFF', fontWeight: '900', fontSize: 13},

  summary: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  summaryLabel: {color: MUTED, fontSize: 12, fontWeight: '600'},
  summaryValue: {color: DARK, fontSize: 13, fontWeight: '800'},
  freeText: {color: GREEN},
  divider: {height: 1, backgroundColor: BORDER, marginVertical: 6},
  totalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.2,
  },
  codText: {fontSize: 10, color: GREEN, marginTop: 2, fontWeight: '700'},
  totalValue: {fontSize: 20, fontWeight: '900', color: GREEN},
  checkoutButton: {
    height: 52,
    backgroundColor: GREEN,
    borderRadius: 14,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: GREEN,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutText: {color: '#FFFFFF', fontSize: 14, fontWeight: '900'},
});

export default NurseryCartScreen;