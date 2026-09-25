import React, {useCallback, useEffect, memo} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Edit3,
  Leaf,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  deleteNurseryPlant,
  fetchMyNurseryListings,
} from '../../redux/slices/nurserySlice';

const GREEN = '#159447';
const DARK = '#151C2B';
const BG = '#F6F8F7';
const MUTED = '#747B78';
const BORDER = '#E3E8E5';
const LIGHT_GREEN = '#EAF7EF';

const ListingCard = memo(({item, onEdit, onDelete, deleting}) => {
  const image = item?.images?.length > 0 ? item.images[0] : null;

  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        {image ? (
          <Image
            source={{uri: image}}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <Leaf size={30} color={GREEN} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>
          {item.name}
        </Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.price}>
          ₹{Number(item.price || 0).toLocaleString('en-IN')}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.quantity}>{item.quantity} available</Text>
          {item?.location?.district && (
            <View style={styles.location}>
              <MapPin size={10} color={MUTED} />
              <Text numberOfLines={1} style={styles.locationText}>
                {item.location.district}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.editButton}
          onPress={() => onEdit(item)}>
          <Edit3 size={16} color={GREEN} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.deleteButton}
          disabled={deleting}
          onPress={() => onDelete(item)}>
          <Trash2 size={16} color="#D64545" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const MyNurseryListingsScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const {
    myListings = [],
    myListingsLoading,
    deleting,
  } = useSelector(state => state.nursery);

  const loadListings = useCallback(() => {
    dispatch(fetchMyNurseryListings());
  }, [dispatch]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handleDelete = useCallback(
    plant => {
      Alert.alert(
        'Delete listing',
        `Are you sure you want to remove "${plant.name}"?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await dispatch(deleteNurseryPlant(plant._id)).unwrap();
                Alert.alert(
                  'Listing removed',
                  'Your plant listing has been removed.',
                );
                loadListings();
              } catch (error) {
                Alert.alert(
                  'Unable to delete',
                  error?.message || 'Could not remove the listing.',
                );
              }
            },
          },
        ],
      );
    },
    [dispatch, loadListings],
  );

  const handleEdit = useCallback(
    plant => {
      navigation.navigate('SellPlant', {plant});
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item}) => (
      <ListingCard
        item={item}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deleting={deleting}
      />
    ),
    [handleEdit, handleDelete, deleting],
  );

  const keyExtractor = useCallback(item => item._id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={21} color={DARK} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Listings</Text>
          <Text style={styles.headerSubtitle}>Manage your plants</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.addButton}
          onPress={() => navigation.navigate('SellPlant')}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {myListingsLoading && myListings.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      ) : (
        <FlatList
          data={myListings}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            myListings.length === 0 && styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={myListingsLoading}
              onRefresh={loadListings}
              tintColor={GREEN}
              colors={[GREEN]}
            />
          }
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          ListHeaderComponent={
            myListings.length > 0 ? (
              <View style={styles.summary}>
                <View>
                  <Text style={styles.summaryTitle}>Your plants</Text>
                  <Text style={styles.summaryText}>
                    {myListings.length}{' '}
                    {myListings.length === 1 ? 'listing' : 'listings'}
                  </Text>
                </View>
                <View style={styles.summaryIcon}>
                  <Leaf size={26} color={GREEN} />
                </View>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Leaf size={38} color={GREEN} />
              </View>
              <Text style={styles.emptyTitle}>No plant listings yet</Text>
              <Text style={styles.emptyText}>
                Start selling plants on the KhetiMaster Nursery marketplace.
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.sellButton}
                onPress={() => navigation.navigate('SellPlant')}>
                <Plus size={17} color="#FFFFFF" />
                <Text style={styles.sellButtonText}>List a Plant</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: BG},

  header: {
    height: 68,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backButton: {
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },

  list: {padding: 16, paddingBottom: 30},
  emptyList: {flexGrow: 1, justifyContent: 'center'},

  summary: {
    backgroundColor: LIGHT_GREEN,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTitle: {
    color: DARK,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  summaryText: {color: MUTED, fontSize: 11, marginTop: 3, fontWeight: '600'},
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 11,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BORDER,
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

  info: {flex: 1, marginLeft: 12, paddingRight: 6, justifyContent: 'space-between'},
  name: {fontSize: 14, fontWeight: '800', color: DARK, letterSpacing: -0.2},
  category: {fontSize: 10, color: GREEN, marginTop: 4, fontWeight: '700'},
  price: {fontSize: 17, fontWeight: '900', color: DARK, marginTop: 8},
  metaRow: {marginTop: 8},
  quantity: {color: MUTED, fontSize: 10, fontWeight: '600'},
  location: {flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3},
  locationText: {fontSize: 10, color: MUTED, maxWidth: 100},

  actions: {justifyContent: 'space-between', paddingLeft: 4},
  editButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loading: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  loadingText: {marginTop: 12, color: MUTED, fontSize: 13},

  empty: {alignItems: 'center', paddingHorizontal: 30},
  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
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
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
    fontSize: 12,
  },
  sellButton: {
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
  sellButtonText: {color: '#FFFFFF', fontWeight: '900', fontSize: 13},
});

export default MyNurseryListingsScreen;