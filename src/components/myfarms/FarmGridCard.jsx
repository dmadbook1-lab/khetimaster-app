
import React, {useEffect, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  MoreVertical,
  BookOpen,
  Maximize2,
  ChevronRight,
  MapPin,
  Pencil,
  Trash2,
  X,
  Sprout,
  CalendarDays,
  Droplets,
  Check,
  AlertTriangle,
} from 'lucide-react-native';

import {useDispatch, useSelector} from 'react-redux';

import {farms as defaultFarmImages} from './data';

import {
  updateFarmField,
  deleteFarmField,
  selectFarmFieldUpdating,
  selectFarmFieldDeleting,
} from '../../redux/slices/farmFieldSlice';

const {width} = Dimensions.get('window');

const CARD_WIDTH = (width - width * 0.11 - 16) / 2;

const GREEN = '#16883E';
const DARK = '#111827';
const MUTED = '#64748B';

const FARMING_TYPES = ['Organic', 'Inorganic', 'Integrated'];

const rf = size => {
  const scale = width / 390;
  return Math.max(size - 2, Math.min(size * scale, size + 2));
};

const getFarmId = farm => farm?._id || farm?.id;

const getInitialForm = farm => ({
  fieldName: farm?.fieldName || farm?.farmName || '',
  cropName: farm?.cropName || '',
  variety: farm?.variety || '',
  acre:
    farm?.acre !== undefined && farm?.acre !== null
      ? String(farm.acre)
      : '',
  sowingDate: farm?.sowingDate
    ? String(farm.sowingDate).slice(0, 10)
    : '',
  typeOfIrrigation: farm?.typeOfIrrigation || '',
  typeOfFarming: FARMING_TYPES.includes(farm?.typeOfFarming)
    ? farm.typeOfFarming
    : 'Integrated',
  isBarrenLand: Boolean(farm?.isBarrenLand),
});

export default function FarmGridCard({
  farm,
  farmIndex = 0,
  navigation,
}) {
  const dispatch = useDispatch();

  const updating = useSelector(selectFarmFieldUpdating);
  const deleting = useSelector(selectFarmFieldDeleting);

  const [menuVisible, setMenuVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const [editForm, setEditForm] = useState(() => getInitialForm(farm));
  const [formError, setFormError] = useState('');

  const farmId = getFarmId(farm);

  const farmName =
    farm?.fieldName || farm?.farmName || 'My Farm';

  const cropName = farm?.isBarrenLand
    ? 'Barren Land'
    : farm?.cropName || 'Crop not specified';

  const variety = farm?.variety || '';
  const acre = Number(farm?.acre || 0);
  const isBarren = Boolean(farm?.isBarrenLand);

  const imageList = Array.isArray(defaultFarmImages)
    ? defaultFarmImages
    : [];

  const defaultImage =
    imageList.length > 0
      ? imageList[farmIndex % imageList.length]?.image
      : null;

  useEffect(() => {
    if (editVisible) {
      setEditForm(getInitialForm(farm));
      setFormError('');
    }
  }, [editVisible, farm]);

  if (!farm) {
    return null;
  }

  const handleOpenFarm = () => {
    if (!navigation) {
      return;
    }

    navigation.navigate('FarmOverview', {
      farm,
      farmId,
    });
  };

  const updateFormField = (key, value) => {
    setEditForm(previous => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleOpenEdit = () => {
    setMenuVisible(false);
    setFormError('');
    setEditForm(getInitialForm(farm));
    setEditVisible(true);
  };

  const handleSaveChanges = async () => {
    if (!farmId) {
      setFormError('Farm ID is missing. Please reload your farms.');
      return;
    }

    if (!editForm.fieldName.trim()) {
      setFormError('Please enter a farm name.');
      return;
    }

    if (!editForm.isBarrenLand && !editForm.cropName.trim()) {
      setFormError('Please enter a crop name.');
      return;
    }

    const area = Number(editForm.acre);

    if (!editForm.acre.trim() || !Number.isFinite(area) || area <= 0) {
      setFormError('Farm area must be greater than zero.');
      return;
    }

    if (!editForm.variety.trim()) {
      setFormError('Please enter the crop variety.');
      return;
    }

    if (!editForm.sowingDate.trim()) {
      setFormError('Please enter the sowing date.');
      return;
    }

    if (!editForm.typeOfIrrigation.trim()) {
      setFormError('Please enter the irrigation type.');
      return;
    }

    if (!FARMING_TYPES.includes(editForm.typeOfFarming)) {
      setFormError('Please select a valid farming type.');
      return;
    }

    setFormError('');

    // Use fieldName because it is the farm-name field in the
    // FarmField model. farmName is included for compatibility
    // with existing consumers of this data.
    const farmData = {
      fieldName: editForm.fieldName.trim(),
      farmName: editForm.fieldName.trim(),
      cropName: editForm.isBarrenLand
        ? editForm.cropName.trim() || farm?.cropName || 'Barren Land'
        : editForm.cropName.trim(),
      variety: editForm.variety.trim(),
      acre: area,
      sowingDate: editForm.sowingDate.trim(),
      typeOfIrrigation: editForm.typeOfIrrigation.trim(),
      typeOfFarming: editForm.typeOfFarming,
      isBarrenLand: Boolean(editForm.isBarrenLand),
    };

    try {
      await dispatch(
        updateFarmField({
          fieldId: farmId,
          farmData,
        }),
      ).unwrap();

      setEditVisible(false);

      Alert.alert(
        'Farm updated',
        'Your farm details have been updated successfully.',
      );
    } catch (error) {
      setFormError(
        typeof error === 'string'
          ? error
          : error?.message || 'Unable to update the farm. Please try again.',
      );
    }
  };

  const handleDeleteFarm = async () => {
    if (!farmId) {
      setFormError('Farm ID is missing. Please reload your farms.');
      return;
    }

    setFormError('');

    try {
      await dispatch(deleteFarmField(farmId)).unwrap();

      setDeleteVisible(false);

      Alert.alert(
        'Farm deleted',
        `${farmName} has been deleted successfully.`,
      );
    } catch (error) {
      setFormError(
        typeof error === 'string'
          ? error
          : error?.message || 'Unable to delete the farm. Please try again.',
      );
    }
  };

  const closeEditModal = () => {
    if (updating) {
      return;
    }

    setEditVisible(false);
    setFormError('');
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setDeleteVisible(false);
    setFormError('');
  };

  return (
    <>
      {/* FARM CARD */}

      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleOpenFarm}
          style={styles.cardContent}>
          {defaultImage ? (
            <Image
              source={defaultImage}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imageFallback}>
              <Sprout size={26} color={GREEN} />
              <Text style={styles.fallbackText} numberOfLines={1}>
                {cropName}
              </Text>
            </View>
          )}

          <View
            pointerEvents="none"
            style={styles.imageOverlay}
          />

          <View style={styles.body}>
            <Text numberOfLines={1} style={styles.title}>
              {farmName}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <BookOpen
                  size={11}
                  color={MUTED}
                  strokeWidth={2.2}
                />

                <Text numberOfLines={1} style={styles.metaText}>
                  {cropName}
                </Text>
              </View>

              <Text style={styles.dot}>•</Text>

              <View style={styles.metaItem}>
                <Maximize2
                  size={11}
                  color={MUTED}
                  strokeWidth={2.2}
                />

                <Text numberOfLines={1} style={styles.metaText}>
                  {acre > 0 ? `${acre.toFixed(1)} ac` : '—'}
                </Text>
              </View>
            </View>

            {variety ? (
              <View style={styles.locationRow}>
                <MapPin
                  size={11}
                  color="#94A3B8"
                  strokeWidth={2.2}
                />

                <Text numberOfLines={1} style={styles.locationText}>
                  {variety}
                </Text>
              </View>
            ) : null}

            <View style={styles.bottomRow}>
              <View
                style={[
                  styles.statusPill,
                  isBarren
                    ? styles.attentionPill
                    : styles.healthyPill,
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    isBarren
                      ? styles.attentionText
                      : styles.healthyText,
                  ]}>
                  {isBarren ? 'Barren' : 'Active'}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.detailsText}>View</Text>
                <ChevronRight
                  size={13}
                  color={GREEN}
                  strokeWidth={2.6}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* THREE-DOT MENU — kept separate from the card's press target */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setFormError('');
            setMenuVisible(true);
          }}
          style={styles.menuBtn}>
          <MoreVertical
            size={18}
            color="#FFFFFF"
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>

      {/* ACTION MENU MODAL */}

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuVisible(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            activeOpacity={1}
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuVisible(false)}
          />

          <View style={styles.actionSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={styles.sheetFarmIcon}>
                <Sprout size={23} color={GREEN} />
              </View>

              <View style={styles.sheetHeadingText}>
                <Text style={styles.sheetTitle}>Manage farm</Text>
                <Text numberOfLines={1} style={styles.sheetSubtitle}>
                  {farmName}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                style={styles.closeIconBtn}>
                <X size={19} color={MUTED} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenEdit}
              style={styles.actionItem}>
              <View style={styles.editIconBox}>
                <Pencil size={19} color={GREEN} />
              </View>

              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>Edit farm details</Text>
                <Text style={styles.actionSubtitle}>
                  Update crop, acreage and other information
                </Text>
              </View>

              <ChevronRight size={19} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMenuVisible(false);
                setFormError('');
                setDeleteVisible(true);
              }}
              style={styles.actionItem}>
              <View style={styles.deleteIconBox}>
                <Trash2 size={19} color="#DC2626" />
              </View>

              <View style={styles.actionCopy}>
                <Text style={styles.deleteActionTitle}>Delete farm</Text>
                <Text style={styles.actionSubtitle}>
                  Permanently remove this farm
                </Text>
              </View>

              <ChevronRight size={19} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMenuVisible(false)}
              style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EDIT FARM MODAL */}

      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeEditModal}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.editModal}>
            <View style={styles.editHeader}>
              <View style={styles.editHeaderIcon}>
                <Pencil size={21} color={GREEN} />
              </View>

              <View style={styles.editHeaderCopy}>
                <Text style={styles.editTitle}>Edit farm</Text>
                <Text style={styles.editSubtitle}>
                  Update your farm information
                </Text>
              </View>

              <TouchableOpacity
                disabled={updating}
                onPress={closeEditModal}
                style={styles.closeIconBtn}>
                <X size={20} color={MUTED} />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.editScrollContent}>
              <Text style={styles.fieldLabel}>Farm name *</Text>
              <TextInput
                value={editForm.fieldName}
                onChangeText={value =>
                  updateFormField('fieldName', value)
                }
                placeholder="e.g. Shinde Farm"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                maxLength={80}
              />

              <Text style={styles.fieldLabel}>Crop name *</Text>
              <TextInput
                value={editForm.cropName}
                onChangeText={value =>
                  updateFormField('cropName', value)
                }
                placeholder="e.g. Cotton"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                editable={!editForm.isBarrenLand}
                maxLength={80}
              />

              <Text style={styles.fieldLabel}>Crop variety *</Text>
              <TextInput
                value={editForm.variety}
                onChangeText={value =>
                  updateFormField('variety', value)
                }
                placeholder="e.g. Bt Cotton"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                maxLength={100}
              />

              <Text style={styles.fieldLabel}>Farm area (acres) *</Text>
              <TextInput
                value={editForm.acre}
                onChangeText={value =>
                  updateFormField('acre', value)
                }
                placeholder="e.g. 2.5"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>Sowing date *</Text>
              <View style={styles.inputWithIcon}>
                <CalendarDays size={17} color={MUTED} />
                <TextInput
                  value={editForm.sowingDate}
                  onChangeText={value =>
                    updateFormField('sowingDate', value)
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  style={styles.iconInput}
                  autoCapitalize="none"
                />
              </View>
              <Text style={styles.helperText}>
                Enter the date as YYYY-MM-DD.
              </Text>

              <Text style={styles.fieldLabel}>Irrigation type *</Text>
              <View style={styles.inputWithIcon}>
                <Droplets size={17} color={MUTED} />
                <TextInput
                  value={editForm.typeOfIrrigation}
                  onChangeText={value =>
                    updateFormField('typeOfIrrigation', value)
                  }
                  placeholder="e.g. Drip, Sprinkler, Rainfed"
                  placeholderTextColor="#9CA3AF"
                  style={styles.iconInput}
                  maxLength={80}
                />
              </View>

              <Text style={styles.fieldLabel}>Farming method *</Text>
              <View style={styles.typeOptions}>
                {FARMING_TYPES.map(type => {
                  const selected = editForm.typeOfFarming === type;

                  return (
                    <TouchableOpacity
                      key={type}
                      activeOpacity={0.8}
                      onPress={() =>
                        updateFormField('typeOfFarming', type)
                      }
                      style={[
                        styles.typeOption,
                        selected && styles.typeOptionSelected,
                      ]}>
                      {selected ? (
                        <Check size={13} color={GREEN} />
                      ) : null}

                      <Text
                        style={[
                          styles.typeOptionText,
                          selected && styles.typeOptionTextSelected,
                        ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.barrenToggleRow}>
                <View style={styles.barrenToggleCopy}>
                  <Text style={styles.barrenToggleTitle}>
                    Barren land
                  </Text>
                  <Text style={styles.barrenToggleSubtitle}>
                    There is currently no standing crop
                  </Text>
                </View>

                <Switch
                  value={editForm.isBarrenLand}
                  onValueChange={value => {
                    updateFormField('isBarrenLand', value);
                    setFormError('');
                  }}
                  trackColor={{
                    false: '#D1D5DB',
                    true: '#86EFAC',
                  }}
                  thumbColor={editForm.isBarrenLand ? GREEN : '#F9FAFB'}
                />
              </View>

              {formError ? (
                <View style={styles.errorBox}>
                  <AlertTriangle size={17} color="#DC2626" />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              ) : null}

              <View style={styles.editButtons}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={updating}
                  onPress={closeEditModal}
                  style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={updating}
                  onPress={handleSaveChanges}
                  style={[
                    styles.primaryButton,
                    updating && styles.disabledButton,
                  ]}>
                  {updating ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Check size={17} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>
                        Save changes
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}

      <Modal
        visible={deleteVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeDeleteModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModal}>
            <View style={styles.warningIcon}>
              <Trash2 size={25} color="#DC2626" />
            </View>

            <Text style={styles.confirmTitle}>Delete this farm?</Text>

            <Text style={styles.confirmDescription}>
              Are you sure you want to delete{' '}
              <Text style={styles.confirmFarmName}>{farmName}</Text>?
              This action cannot be undone.
            </Text>

            {formError ? (
              <View style={styles.errorBox}>
                <AlertTriangle size={17} color="#DC2626" />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={deleting}
                onPress={closeDeleteModal}
                style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Keep farm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={deleting}
                onPress={handleDeleteFarm}
                style={[
                  styles.deleteButton,
                  deleting && styles.disabledButton,
                ]}>
                {deleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Trash2 size={16} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Delete</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 4,
  },

  cardContent: {
    flex: 1,
  },

  image: {
    width: '100%',
    height: 106,
  },

  imageFallback: {
    width: '100%',
    height: 106,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 5,
  },

  fallbackText: {
    fontSize: rf(12),
    fontWeight: '900',
    color: GREEN,
  },

  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 106,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },

  menuBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 5,
  },

  body: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  title: {
    fontSize: rf(14),
    color: DARK,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    maxWidth: '44%',
  },

  metaText: {
    marginLeft: 4,
    fontSize: rf(9),
    color: MUTED,
    fontWeight: '700',
    flexShrink: 1,
  },

  dot: {
    marginHorizontal: 6,
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '900',
  },

  locationRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationText: {
    flex: 1,
    marginLeft: 4,
    fontSize: rf(9),
    color: '#94A3B8',
    fontWeight: '700',
  },

  bottomRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusPill: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
    maxWidth: '65%',
  },

  healthyPill: {
    backgroundColor: '#ECFDF5',
  },

  attentionPill: {
    backgroundColor: '#FFF7ED',
  },

  statusText: {
    fontSize: rf(9),
    fontWeight: '900',
  },

  healthyText: {
    color: GREEN,
  },

  attentionText: {
    color: '#EA580C',
  },

  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailsText: {
    marginRight: 2,
    fontSize: rf(10),
    color: GREEN,
    fontWeight: '900',
  },

  // Shared modal layout

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  closeIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Action menu

  actionSheet: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },

  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginBottom: 20,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  sheetFarmIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ECFDF3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sheetHeadingText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  sheetTitle: {
    color: DARK,
    fontSize: 17,
    fontWeight: '900',
  },

  sheetSubtitle: {
    marginTop: 4,
    color: MUTED,
    fontSize: 12,
    fontWeight: '600',
  },

  actionItem: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  editIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ECFDF3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  actionTitle: {
    color: DARK,
    fontSize: 14,
    fontWeight: '800',
  },

  deleteActionTitle: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },

  actionSubtitle: {
    marginTop: 4,
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },

  actionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  cancelButton: {
    marginTop: 14,
    minHeight: 48,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '800',
  },

  // Edit form

  editModal: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    overflow: 'hidden',
  },

  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  editHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ECFDF3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  editHeaderCopy: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  editTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: DARK,
  },

  editSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: MUTED,
    fontWeight: '600',
  },

  editScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },

  fieldLabel: {
    marginTop: 14,
    marginBottom: 8,
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    color: DARK,
    backgroundColor: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  inputWithIcon: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 13,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  iconInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    color: DARK,
    fontSize: 13,
    fontWeight: '600',
  },

  helperText: {
    marginTop: 6,
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },

  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  typeOption: {
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  typeOptionSelected: {
    backgroundColor: '#ECFDF3',
    borderColor: '#86EFAC',
  },

  typeOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  typeOptionTextSelected: {
    color: GREEN,
    fontWeight: '900',
  },

  barrenToggleRow: {
    marginTop: 20,
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  barrenToggleCopy: {
    flex: 1,
  },

  barrenToggleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: DARK,
  },

  barrenToggleSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: MUTED,
  },

  errorBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },

  editButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },

  secondaryButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  secondaryButtonText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '800',
  },

  primaryButton: {
    minHeight: 48,
    paddingHorizontal: 15,
    borderRadius: 14,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    flex: 1.4,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  disabledButton: {
    opacity: 0.65,
  },

  // Delete confirmation

  confirmModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
  },

  warningIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  confirmTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: DARK,
    textAlign: 'center',
  },

  confirmDescription: {
    marginTop: 10,
    color: MUTED,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
  },

  confirmFarmName: {
    color: DARK,
    fontWeight: '900',
  },

  confirmButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 22,
  },

  deleteButton: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    flex: 1,
  },
});

