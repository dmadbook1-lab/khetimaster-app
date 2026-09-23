import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  MapPin,
  RefreshCw,
  Search,
  TrendingUp,
  X,
} from 'lucide-react-native';

import { useDispatch, useSelector } from 'react-redux';

import { useLocation } from '../../context/LocationContext';

import {
  getMandiCrops,
  getMandiDistricts,
  getMandiRates,
  getMandiStates,
  setSelectedCrop,
  setSelectedDistrict,
  setSelectedState,
  clearMandiRates,
  selectMandiCrops,
  selectMandiCropsLoading,
  selectMandiStates,
  selectMandiDistricts,
  selectMandiStatesLoading,
  selectMandiDistrictsLoading,
  selectSelectedMandiCrop,
  selectSelectedMandiState,
  selectSelectedMandiDistrict,
  selectMandiRates,
  selectMandiLoading,
  selectMandiError,
} from '../../redux/slices/mandiSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GREEN = '#0D9F4F';
const GREEN_DARK = '#087A3B';
const GREEN_LIGHT = '#E8F8EE';

const DARK = '#0F1419';
const TEXT = '#1A1D21';
const TEXT_SECONDARY = '#4A5568';
const MUTED = '#718096';

const LIGHT_BG = '#F7FAFA';
const WHITE = '#FFFFFF';
const CARD_BG = '#FFFFFF';

const BORDER = '#E2E8F0';
const BORDER_LIGHT = '#EDF2F7';

const RED = '#E53E3E';
const RED_BG = '#FFF5F5';
const RED_BORDER = '#FED7D7';

const ORANGE = '#DD6B20';
const ORANGE_BG = '#FFFAF0';

const BLUE = '#3182CE';
const BLUE_BG = '#EBF8FF';

const ITEMS_PER_PAGE = 10;

const getItemName = item => {
  if (typeof item === 'string') return item;
  return item?.name || item?.state || item?.district || '';
};

const normalize = value =>
  String(value || '').trim().toLowerCase();

const MandiRatesScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const { location: currentLocation, loading: locationLoading } = useLocation();

  const crops = useSelector(selectMandiCrops);
  const cropsLoading = useSelector(selectMandiCropsLoading);
  const states = useSelector(selectMandiStates);
  const districts = useSelector(selectMandiDistricts);
  const statesLoading = useSelector(selectMandiStatesLoading);
  const districtsLoading = useSelector(selectMandiDistrictsLoading);
  const selectedCrop = useSelector(selectSelectedMandiCrop);
  const selectedState = useSelector(selectSelectedMandiState);
  const selectedDistrict = useSelector(selectSelectedMandiDistrict);
  const rates = useSelector(selectMandiRates);
  const loading = useSelector(selectMandiLoading);
  const error = useSelector(selectMandiError);

  const [cropSearch, setCropSearch] = useState('');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationStep, setLocationStep] = useState('state');
  const [draftState, setDraftState] = useState('');
  const [draftDistrict, setDraftDistrict] = useState('');
  const [manualLocationSelected, setManualLocationSelected] = useState(false);
  const [detectedDistrict, setDetectedDistrict] = useState('');
  const [automaticLocationInitialized, setAutomaticLocationInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');

  const scrollRef = useRef(null);
  const resultsRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    dispatch(getMandiCrops());
    dispatch(getMandiStates());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rates]);

  useEffect(() => {
    if (locationLoading) return;
    if (!currentLocation) return;
    if (manualLocationSelected) return;

    const detectedState = String(currentLocation?.state || '').trim();
    const detectedDistrictValue = String(
      currentLocation?.district || currentLocation?.city || ''
    ).trim();

    if (!detectedState) return;

    if (automaticLocationInitialized && selectedState === detectedState) {
      if (detectedDistrictValue && !detectedDistrict) {
        setDetectedDistrict(detectedDistrictValue);
      }
      return;
    }

    setAutomaticLocationInitialized(true);

    if (selectedState !== detectedState) {
      dispatch(setSelectedState(detectedState));
    }

    if (detectedDistrictValue) {
      setDetectedDistrict(detectedDistrictValue);
    }

    dispatch(getMandiDistricts(detectedState));
  }, [
    currentLocation,
    locationLoading,
    manualLocationSelected,
    automaticLocationInitialized,
    selectedState,
    detectedDistrict,
    dispatch,
  ]);

  useEffect(() => {
    if (manualLocationSelected) return;
    if (!detectedDistrict || !selectedState || districts.length === 0) return;

    const matchingDistrict = districts.find(
      item => normalize(getItemName(item)) === normalize(detectedDistrict)
    );

    if (!matchingDistrict) return;

    const districtName = getItemName(matchingDistrict);

    if (selectedDistrict !== districtName) {
      dispatch(setSelectedDistrict(districtName));
    }
  }, [districts, detectedDistrict, selectedState, selectedDistrict, manualLocationSelected, dispatch]);

  const fetchRates = useCallback(
    ({ crop = selectedCrop, state = selectedState, district = selectedDistrict } = {}) => {
      if (!crop?.id || !state || !district) return;
      dispatch(getMandiRates({ crop: crop.id, state, district, limit: 100 }));
    },
    [dispatch, selectedCrop, selectedState, selectedDistrict]
  );

  useEffect(() => {
    if (locationLoading || !selectedCrop || !selectedState || !selectedDistrict) return;
    fetchRates();
  }, [locationLoading, selectedCrop, selectedState, selectedDistrict, fetchRates]);

  const handleCropSelect = crop => {
    dispatch(setSelectedCrop(crop));
    setCurrentPage(1);
    if (selectedState && selectedDistrict) {
      fetchRates({ crop, state: selectedState, district: selectedDistrict });
    }
  };

  const openLocationModal = () => {
    setDraftState(selectedState || '');
    setDraftDistrict(selectedDistrict || '');
    setStateSearch('');
    setDistrictSearch('');
    if (selectedState) {
      setLocationStep('district');
      dispatch(getMandiDistricts(selectedState));
    } else {
      setLocationStep('state');
    }
    setLocationModalVisible(true);
  };

  const closeLocationModal = () => {
    setDraftState(selectedState || '');
    setDraftDistrict(selectedDistrict || '');
    setLocationModalVisible(false);
  };

  const handleDraftStateChange = stateName => {
    setDraftState(stateName);
    setDraftDistrict('');
    setDistrictSearch('');
    setLocationStep('district');
    dispatch(getMandiDistricts(stateName));
  };

  const handleDraftDistrictChange = districtName => {
    setDraftDistrict(districtName);
  };

  const applyLocation = () => {
    if (!draftState || !draftDistrict) return;
    setManualLocationSelected(true);
    dispatch(setSelectedState(draftState));
    dispatch(setSelectedDistrict(draftDistrict));
    dispatch(clearMandiRates());
    setLocationModalVisible(false);
    setCurrentPage(1);
    if (selectedCrop?.id) {
      fetchRates({ crop: selectedCrop, state: draftState, district: draftDistrict });
    }
  };

  const useDetectedLocation = () => {
    setManualLocationSelected(false);
    setAutomaticLocationInitialized(false);
    setDetectedDistrict('');
    dispatch(clearMandiRates());
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    if (selectedCrop && selectedState && selectedDistrict) {
      fetchRates();
    }
  };

  const filteredCrops = useMemo(() => {
    const search = cropSearch.trim().toLowerCase();
    if (!search) return crops;
    return crops.filter(crop =>
      `${crop.name || ''} ${crop.commodity || ''}`.toLowerCase().includes(search)
    );
  }, [crops, cropSearch]);

  const filteredStates = useMemo(() => {
    const search = stateSearch.trim().toLowerCase();
    if (!search) return states;
    return states.filter(s => getItemName(s).toLowerCase().includes(search));
  }, [states, stateSearch]);

  const filteredDistricts = useMemo(() => {
    const search = districtSearch.trim().toLowerCase();
    if (!search) return districts;
    return districts.filter(d => getItemName(d).toLowerCase().includes(search));
  }, [districts, districtSearch]);

  const totalPages = Math.max(1, Math.ceil(rates.length / ITEMS_PER_PAGE));

  const paginatedRates = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return rates.slice(start, start + ITEMS_PER_PAGE);
  }, [rates, currentPage]);

  const goToPage = page => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const formatPrice = value => {
    const number = Number(value);
    if (!Number.isFinite(number)) return '—';
    return `₹${number.toLocaleString('en-IN')}`;
  };

  const formatDate = value => {
    if (!value) return '—';
    return String(value);
  };

  const renderCrop = ({ item }) => {
    const isSelected = selectedCrop?.id === item.id;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleCropSelect(item)}
        style={[styles.cropCard, isSelected && styles.cropCardSelected]}>
        <View style={[styles.cropIcon, isSelected && styles.cropIconSelected]}>
          <Text style={[styles.cropIconText, isSelected && styles.cropIconTextSelected]}>
            {String(item.name || 'C').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text
          numberOfLines={2}
          style={[styles.cropName, isSelected && styles.cropNameSelected]}>
          {item.name}
        </Text>
        {isSelected && (
          <View style={styles.cropSelectedDot} />
        )}
      </TouchableOpacity>
    );
  };

  const renderRate = ({ item, index }) => {
    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
    return (
      <View style={styles.rateCard}>
        <View style={styles.rateCardInner}>
          <View style={styles.rateHeader}>
            <View style={styles.marketIconContainer}>
              <MapPin size={18} color={GREEN} strokeWidth={2.2} />
            </View>
            <View style={styles.marketInfo}>
              <Text style={styles.marketName} numberOfLines={2}>
                {item.market || 'Market unavailable'}
              </Text>
              <Text style={styles.marketDistrict} numberOfLines={1}>
                {item.district || selectedDistrict}
                {item.state ? `, ${item.state}` : ''}
              </Text>
            </View>
            
            {/* Redesigned Clean Meta Container on Right Side */}
            <View style={styles.rateMetaRight}>
              <View style={styles.rateSerialBadge}>
                <Text style={styles.rateSerialText}>#{globalIndex}</Text>
              </View>
              <View style={styles.dateChip}>
                <CalendarDays size={12} color={BLUE} strokeWidth={2.5} />
                <Text style={styles.dateChipText}>{formatDate(item.arrivalDate)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.priceBox}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>MIN PRICE</Text>
              <Text style={styles.priceValue}>{formatPrice(item.minPrice)}</Text>
              <View style={[styles.priceBar, { backgroundColor: '#FED7D7' }]} />
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceItem}>
              <Text style={[styles.priceLabel, styles.modalPriceLabel]}>MODAL PRICE</Text>
              <Text style={[styles.priceValue, styles.modalPriceValue]}>
                {formatPrice(item.modalPrice)}
              </Text>
              <View style={[styles.priceBar, { backgroundColor: '#C6F6D5' }]} />
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>MAX PRICE</Text>
              <Text style={styles.priceValue}>{formatPrice(item.maxPrice)}</Text>
              <View style={[styles.priceBar, { backgroundColor: '#BEE3F8' }]} />
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailChip}>
              <Text style={styles.detailChipLabel}>Variety</Text>
              <Text style={styles.detailChipValue} numberOfLines={1}>
                {item.variety || '—'}
              </Text>
            </View>
            <View style={styles.detailChip}>
              <Text style={styles.detailChipLabel}>Grade</Text>
              <Text style={styles.detailChipValue} numberOfLines={1}>
                {item.grade || '—'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPagination = () => {
    if (rates.length <= ITEMS_PER_PAGE) return null;

    const pageNumbers = getPageNumbers();
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, rates.length);

    return (
      <View style={styles.paginationWrapper}>
        <Text style={styles.paginationInfo}>
          Showing {startItem}-{endItem} of {rates.length} results
        </Text>

        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.paginationArrow, currentPage === 1 && styles.paginationArrowDisabled]}
            onPress={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            activeOpacity={0.7}>
            <ChevronLeft size={18} color={currentPage === 1 ? '#CBD5E0' : GREEN} />
          </TouchableOpacity>

          <View style={styles.pageNumbersRow}>
            {pageNumbers.map((page, idx) => {
              if (page === '...') {
                return (
                  <View key={`dots-${idx}`} style={styles.paginationDots}>
                    <Text style={styles.paginationDotsText}>•••</Text>
                  </View>
                );
              }
              const isActive = page === currentPage;
              return (
                <TouchableOpacity
                  key={`page-${page}`}
                  style={[styles.pageButton, isActive && styles.pageButtonActive]}
                  onPress={() => goToPage(page)}
                  activeOpacity={0.7}>
                  <Text style={[styles.pageButtonText, isActive && styles.pageButtonTextActive]}>
                    {page}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.paginationArrow,
              currentPage === totalPages && styles.paginationArrowDisabled,
            ]}
            onPress={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            activeOpacity={0.7}>
            <ChevronRight
              size={18}
              color={currentPage === totalPages ? '#CBD5E0' : GREEN}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.quickJumpRow}>
          <TouchableOpacity
            style={[styles.quickJumpBtn, currentPage === 1 && styles.quickJumpBtnDisabled]}
            onPress={() => goToPage(1)}
            disabled={currentPage === 1}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.quickJumpText,
                currentPage === 1 && styles.quickJumpTextDisabled,
              ]}>
              First
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.quickJumpBtn,
              currentPage === totalPages && styles.quickJumpBtnDisabled,
            ]}
            onPress={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.quickJumpText,
                currentPage === totalPages && styles.quickJumpTextDisabled,
              ]}>
              Last
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderResults = () => {
    if (!selectedCrop) {
      return (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconOuter}>
            <View style={styles.emptyIcon}>
              <TrendingUp size={30} color={GREEN} />
            </View>
          </View>
          <Text style={styles.emptyTitle}>Select a Crop</Text>
          <Text style={styles.emptyText}>
            Choose a crop above to view the latest mandi prices for your selected location.
          </Text>
        </View>
      );
    }

    if (!selectedState || !selectedDistrict) {
      return (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconOuter}>
            <View style={[styles.emptyIcon, { backgroundColor: BLUE_BG }]}>
              <MapPin size={30} color={BLUE} />
            </View>
          </View>
          <Text style={styles.emptyTitle}>
            {locationLoading ? 'Detecting Location' : 'Set Your Location'}
          </Text>
          <Text style={styles.emptyText}>
            {locationLoading
              ? 'Getting your current location...'
              : 'Select a state and district to see mandi prices.'}
          </Text>
          {!locationLoading ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={openLocationModal}
              activeOpacity={0.85}>
              <MapPin size={17} color={WHITE} />
              <Text style={styles.primaryButtonText}>Select Location</Text>
            </TouchableOpacity>
          ) : (
            <ActivityIndicator size="small" color={GREEN} style={{ marginTop: 20 }} />
          )}
        </View>
      );
    }

    if (loading && rates.length === 0) {
      return (
        <View style={styles.loadingCard}>
          <View style={styles.loadingPulse}>
            <IndianRupee size={26} color={GREEN} />
          </View>
          <ActivityIndicator size="small" color={GREEN} style={{ marginTop: 16 }} />
          <Text style={styles.loadingTitle}>Fetching Latest Rates</Text>
          <Text style={styles.loadingText}>
            Getting {selectedCrop.name} prices from {selectedDistrict}, {selectedState}
          </Text>
        </View>
      );
    }

    if (error && rates.length === 0) {
      return (
        <View style={styles.errorCard}>
          <View style={styles.errorIconContainer}>
            <X size={26} color={RED} />
          </View>
          <Text style={styles.errorTitle}>Couldn't Load Rates</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh} activeOpacity={0.85}>
            <RefreshCw size={16} color={WHITE} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (rates.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconOuter}>
            <View style={[styles.emptyIcon, { backgroundColor: ORANGE_BG }]}>
              <IndianRupee size={30} color={ORANGE} />
            </View>
          </View>
          <Text style={styles.emptyTitle}>No Rates Found</Text>
          <Text style={styles.emptyText}>
            No mandi records were found for {selectedCrop.name} in {selectedDistrict},{' '}
            {selectedState}.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={openLocationModal}
            activeOpacity={0.85}>
            <MapPin size={17} color={WHITE} />
            <Text style={styles.primaryButtonText}>Change Location</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.resultsSection}>
        <View style={styles.resultsHeader}>
          <View style={styles.resultsHeaderLeft}>
            <Text style={styles.resultsTitle}>Market Rates</Text>
            <View style={styles.resultCountBadge}>
              <Text style={styles.resultCountText}>{rates.length}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={loading}
            activeOpacity={0.75}>
            {loading ? (
              <ActivityIndicator size="small" color={GREEN} />
            ) : (
              <RefreshCw size={17} color={GREEN} />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.resultsSubtitle}>
          Government market data • {selectedDistrict}, {selectedState}
        </Text>

        {error ? (
          <View style={styles.inlineError}>
            <Text style={styles.inlineErrorText}>{error}</Text>
          </View>
        ) : null}

        <View ref={resultsRef}>
          {paginatedRates.map((item, index) => (
            <View key={`${item.market || 'market'}-${item.arrivalDate || 'date'}-${index}`}>
              {renderRate({ item, index })}
            </View>
          ))}
        </View>

        {renderPagination()}
      </View>
    );
  };

  const renderLocationModal = () => {
    return (
      <Modal
        visible={locationModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeLocationModal}>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.locationModal}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <View style={styles.modalLocationIcon}>
                    <MapPin size={20} color={GREEN} />
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>Mandi Location</Text>
                    <Text style={styles.modalSubtitle}>Choose a temporary location</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={closeLocationModal}
                  activeOpacity={0.75}>
                  <X size={20} color={DARK} />
                </TouchableOpacity>
              </View>

              {!manualLocationSelected && currentLocation?.state ? (
                <TouchableOpacity
                  style={styles.detectedLocationBanner}
                  onPress={() => {
                    useDetectedLocation();
                    closeLocationModal();
                  }}
                  activeOpacity={0.8}>
                  <View style={styles.detectedLeft}>
                    <View style={styles.detectedIcon}>
                      <MapPin size={15} color={GREEN} />
                    </View>
                    <View style={styles.detectedTextContainer}>
                      <Text style={styles.detectedLabel}>Detected Location</Text>
                      <Text style={styles.detectedValue} numberOfLines={1}>
                        {currentLocation?.district
                          ? `${currentLocation.district}, ${currentLocation.state}`
                          : currentLocation.state}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.autoBadge}>
                    <Text style={styles.autoBadgeText}>AUTO</Text>
                  </View>
                </TouchableOpacity>
              ) : null}

              <View style={styles.stepsContainer}>
                <TouchableOpacity
                  style={[styles.step, locationStep === 'state' && styles.activeStep]}
                  onPress={() => setLocationStep('state')}
                  activeOpacity={0.8}>
                  <View
                    style={[
                      styles.stepNumberCircle,
                      locationStep === 'state' && styles.activeStepNumberCircle,
                      draftState && locationStep !== 'state' && styles.completedStepNumberCircle,
                    ]}>
                    {draftState && locationStep !== 'state' ? (
                      <Check size={11} color={WHITE} />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumberText,
                          locationStep === 'state' && styles.activeStepNumberText,
                        ]}>
                        1
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[styles.stepText, locationStep === 'state' && styles.activeStepText]}>
                    State
                  </Text>
                </TouchableOpacity>

                <View style={styles.stepLine} />

                <TouchableOpacity
                  disabled={!draftState}
                  style={[
                    styles.step,
                    locationStep === 'district' && styles.activeStep,
                    !draftState && styles.disabledStep,
                  ]}
                  onPress={() => setLocationStep('district')}
                  activeOpacity={0.8}>
                  <View
                    style={[
                      styles.stepNumberCircle,
                      locationStep === 'district' && styles.activeStepNumberCircle,
                      draftDistrict &&
                        locationStep !== 'district' &&
                        styles.completedStepNumberCircle,
                    ]}>
                    {draftDistrict && locationStep !== 'district' ? (
                      <Check size={11} color={WHITE} />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumberText,
                          locationStep === 'district' && styles.activeStepNumberText,
                        ]}>
                        2
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepText,
                      locationStep === 'district' && styles.activeStepText,
                    ]}>
                    District
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.draftLocation}>
                <MapPin size={15} color={draftState ? GREEN : MUTED} />
                <Text
                  style={[styles.draftLocationText, !draftState && styles.draftLocationPlaceholder]}
                  numberOfLines={1}>
                  {draftState
                    ? `${draftState}${draftDistrict ? ` → ${draftDistrict}` : ''}`
                    : 'Select a location'}
                </Text>
              </View>

              {locationStep === 'state' ? (
                <View style={styles.modalListContainer}>
                  <View style={styles.modalSearchBar}>
                    <Search size={16} color={MUTED} />
                    <TextInput
                      value={stateSearch}
                      onChangeText={setStateSearch}
                      placeholder="Search states..."
                      placeholderTextColor="#A0AEC0"
                      style={styles.modalSearchInput}
                      autoCapitalize="none"
                    />
                    {stateSearch.length > 0 && (
                      <TouchableOpacity onPress={() => setStateSearch('')} activeOpacity={0.7}>
                        <X size={16} color={MUTED} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {statesLoading ? (
                    <View style={styles.modalLoading}>
                      <ActivityIndicator size="small" color={GREEN} />
                      <Text style={styles.modalLoadingText}>Loading states...</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredStates}
                      keyExtractor={(item, index) => `${getItemName(item)}-${index}`}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.locationList}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => {
                        const stateName = getItemName(item);
                        const selected = normalize(draftState) === normalize(stateName);
                        return (
                          <TouchableOpacity
                            style={[
                              styles.locationOption,
                              selected && styles.locationOptionSelected,
                            ]}
                            onPress={() => handleDraftStateChange(stateName)}
                            activeOpacity={0.7}>
                            <View style={styles.locationOptionLeft}>
                              <View
                                style={[
                                  styles.optionIcon,
                                  selected && styles.optionIconSelected,
                                ]}>
                                <MapPin size={13} color={selected ? WHITE : MUTED} />
                              </View>
                              <Text
                                style={[
                                  styles.locationOptionText,
                                  selected && styles.locationOptionTextSelected,
                                ]}>
                                {stateName}
                              </Text>
                            </View>
                            {selected && (
                              <View style={styles.selectedCheck}>
                                <Check size={13} color={WHITE} />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      }}
                    />
                  )}
                </View>
              ) : (
                <View style={styles.modalListContainer}>
                  <TouchableOpacity
                    style={styles.backToState}
                    onPress={() => setLocationStep('state')}
                    activeOpacity={0.75}>
                    <ArrowLeft size={15} color={GREEN} />
                    <Text style={styles.backToStateText}>Change State ({draftState})</Text>
                  </TouchableOpacity>

                  <View style={styles.modalSearchBar}>
                    <Search size={16} color={MUTED} />
                    <TextInput
                      value={districtSearch}
                      onChangeText={setDistrictSearch}
                      placeholder="Search districts..."
                      placeholderTextColor="#A0AEC0"
                      style={styles.modalSearchInput}
                      autoCapitalize="none"
                    />
                    {districtSearch.length > 0 && (
                      <TouchableOpacity onPress={() => setDistrictSearch('')} activeOpacity={0.7}>
                        <X size={16} color={MUTED} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {districtsLoading ? (
                    <View style={styles.modalLoading}>
                      <ActivityIndicator size="small" color={GREEN} />
                      <Text style={styles.modalLoadingText}>Loading districts...</Text>
                    </View>
                  ) : filteredDistricts.length === 0 ? (
                    <View style={styles.noDistricts}>
                      <View style={styles.noDistrictIcon}>
                        <MapPin size={20} color={ORANGE} />
                      </View>
                      <Text style={styles.noDistrictsTitle}>No districts found</Text>
                      <Text style={styles.noDistrictsText}>
                        {districtSearch
                          ? 'Try a different search term.'
                          : "We couldn't find mandi districts for this state."}
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredDistricts}
                      keyExtractor={(item, index) => `${getItemName(item)}-${index}`}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.locationList}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => {
                        const districtName = getItemName(item);
                        const selected = normalize(draftDistrict) === normalize(districtName);
                        return (
                          <TouchableOpacity
                            style={[
                              styles.locationOption,
                              selected && styles.locationOptionSelected,
                            ]}
                            onPress={() => handleDraftDistrictChange(districtName)}
                            activeOpacity={0.7}>
                            <View style={styles.locationOptionLeft}>
                              <View
                                style={[
                                  styles.optionIcon,
                                  selected && styles.optionIconSelected,
                                ]}>
                                <MapPin size={13} color={selected ? WHITE : MUTED} />
                              </View>
                              <Text
                                style={[
                                  styles.locationOptionText,
                                  selected && styles.locationOptionTextSelected,
                                ]}>
                                {districtName}
                              </Text>
                            </View>
                            {selected && (
                              <View style={styles.selectedCheck}>
                                <Check size={13} color={WHITE} />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      }}
                    />
                  )}
                </View>
              )}

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  disabled={!draftState || !draftDistrict || districtsLoading}
                  style={[
                    styles.applyButton,
                    (!draftState || !draftDistrict || districtsLoading) &&
                      styles.applyButtonDisabled,
                  ]}
                  onPress={applyLocation}
                  activeOpacity={0.85}>
                  <Check size={18} color={WHITE} />
                  <Text style={styles.applyButtonText}>Apply Location</Text>
                </TouchableOpacity>

                {manualLocationSelected && (
                  <TouchableOpacity
                    style={styles.useAutomaticButton}
                    onPress={() => {
                      useDetectedLocation();
                      closeLocationModal();
                    }}
                    activeOpacity={0.75}>
                    <RefreshCw size={14} color={GREEN} />
                    <Text style={styles.useAutomaticText}>Use Current Location</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <ArrowLeft size={21} color={DARK} strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Mandi Rates</Text>
            <View style={styles.headerLocationRow}>
              <MapPin size={11} color={GREEN} />
              <Text style={styles.headerLocationText} numberOfLines={1}>
                {locationLoading
                  ? 'Detecting location...'
                  : selectedState && selectedDistrict
                  ? `${selectedDistrict}, ${selectedState}`
                  : 'Location unavailable'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.headerLocationButton}
            onPress={openLocationModal}
            activeOpacity={0.75}>
            <MapPin size={17} color={GREEN} />
          </TouchableOpacity>
        </View>

        <Animated.ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          style={{ opacity: fadeAnim }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={GREEN} />
          }>
          <View style={styles.locationCard}>
            <View style={styles.locationLeft}>
              <View style={styles.locationIcon}>
                <MapPin size={19} color={GREEN} />
              </View>
              <View style={styles.locationTextContainer}>
                <View style={styles.locationLabelRow}>
                  <Text style={styles.locationLabel}>MANDI LOCATION</Text>
                  {manualLocationSelected ? (
                    <View style={styles.manualBadge}>
                      <Text style={styles.manualBadgeText}>MANUAL</Text>
                    </View>
                  ) : (
                    <View style={styles.autoLocationBadge}>
                      <Text style={styles.autoLocationBadgeText}>AUTO</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.locationValue} numberOfLines={1}>
                  {locationLoading
                    ? 'Detecting location...'
                    : selectedState && selectedDistrict
                    ? `${selectedDistrict}, ${selectedState}`
                    : selectedState || 'Select location'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.changeLocationButton}
              onPress={openLocationModal}
              activeOpacity={0.75}>
              <Text style={styles.changeLocationText}>Change</Text>
              <ChevronDown size={15} color={GREEN} />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Select Crop</Text>
              <Text style={styles.sectionSubtitle}>
                Choose a crop to see today's market rates
              </Text>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Search size={18} color={MUTED} />
            <TextInput
              value={cropSearch}
              onChangeText={setCropSearch}
              placeholder="Search crops..."
              placeholderTextColor="#A0AEC0"
              style={styles.searchInput}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {cropSearch.length > 0 && (
              <TouchableOpacity onPress={() => setCropSearch('')} activeOpacity={0.7}>
                <X size={18} color={MUTED} />
              </TouchableOpacity>
            )}
          </View>

          {cropsLoading ? (
            <View style={styles.cropLoading}>
              <ActivityIndicator size="small" color={GREEN} />
              <Text style={styles.cropLoadingText}>Loading crops...</Text>
            </View>
          ) : filteredCrops.length === 0 ? (
            <View style={styles.noCrops}>
              <Text style={styles.noCropsText}>No crops found.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCrops}
              keyExtractor={item => item.id}
              renderItem={renderCrop}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cropList}
              removeClippedSubviews={Platform.OS === 'android'}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={5}
            />
          )}

          {selectedCrop && (
            <View style={styles.selectedCropBanner}>
              <View style={styles.selectedCropLeft}>
                <View style={styles.selectedCropIcon}>
                  <Text style={styles.selectedCropIconText}>
                    {String(selectedCrop.name || 'C').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.selectedCropLabel}>Showing rates for</Text>
                  <Text style={styles.selectedCropName}>{selectedCrop.name}</Text>
                </View>
              </View>
              <View style={styles.selectedCropPriceIcon}>
                <TrendingUp size={20} color={GREEN} />
              </View>
            </View>
          )}

          {renderResults()}

          {rates.length > 0 && (
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>
                Data sourced from Government of India Mandi Price Information System
              </Text>
            </View>
          )}

          <View style={{ height: 30 }} />
        </Animated.ScrollView>

        {renderLocationModal()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: WHITE,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },

  headerTextContainer: {
    flex: 1,
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: DARK,
    letterSpacing: -0.4,
  },

  headerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },

  headerLocationText: {
    flex: 1,
    fontSize: 11,
    color: MUTED,
    fontWeight: '600',
  },

  headerLocationButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D0EFDB',
  },

  locationCard: {
    marginTop: 16,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },

  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  locationTextContainer: {
    flex: 1,
  },

  locationLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  locationLabel: {
    fontSize: 9,
    color: MUTED,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  autoLocationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: GREEN_LIGHT,
  },

  autoLocationBadgeText: {
    fontSize: 7,
    color: GREEN,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  manualBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: ORANGE_BG,
  },

  manualBadgeText: {
    fontSize: 7,
    color: ORANGE,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  locationValue: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
    marginTop: 3,
  },

  changeLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: GREEN_LIGHT,
    gap: 3,
  },

  changeLocationText: {
    fontSize: 12,
    fontWeight: '700',
    color: GREEN,
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 3,
    fontWeight: '500',
  },

  searchContainer: {
    height: 46,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 9,
    fontSize: 14,
    color: TEXT,
    paddingVertical: 0,
  },

  cropList: {
    paddingVertical: 14,
    paddingRight: 10,
    gap: 8,
  },

  cropCard: {
    width: 88,
    minHeight: 92,
    borderRadius: 14,
    backgroundColor: CARD_BG,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 10,
  },

  cropCardSelected: {
    borderColor: GREEN,
    backgroundColor: GREEN_LIGHT,
    shadowColor: GREEN,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  cropIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  cropIconSelected: {
    backgroundColor: GREEN,
  },

  cropIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: MUTED,
  },

  cropIconTextSelected: {
    color: WHITE,
  },

  cropName: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
    lineHeight: 14,
  },

  cropNameSelected: {
    color: GREEN_DARK,
    fontWeight: '800',
  },

  cropSelectedDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: GREEN,
    marginTop: 4,
  },

  cropLoading: {
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },

  cropLoadingText: {
    color: MUTED,
    fontSize: 12,
  },

  noCrops: {
    paddingVertical: 24,
    alignItems: 'center',
  },

  noCropsText: {
    color: MUTED,
    fontSize: 13,
  },

  selectedCropBanner: {
    backgroundColor: GREEN_LIGHT,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },

  selectedCropLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedCropIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  selectedCropIconText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '800',
  },

  selectedCropLabel: {
    fontSize: 10,
    color: MUTED,
    fontWeight: '600',
  },

  selectedCropName: {
    fontSize: 15,
    fontWeight: '800',
    color: DARK,
    marginTop: 1,
  },

  selectedCropPriceIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultsSection: {
    marginTop: 2,
  },

  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  resultsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  resultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
  },

  resultCountBadge: {
    minWidth: 26,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 7,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: GREEN,
  },

  resultsSubtitle: {
    fontSize: 11.5,
    color: MUTED,
    marginBottom: 14,
    fontWeight: '500',
  },

  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rateCard: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    overflow: 'hidden',
  },

  rateCardInner: {
    padding: 14,
  },

  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  marketIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  marketInfo: {
    flex: 1,
    marginRight: 8,
  },

  marketName: {
    fontSize: 14,
    fontWeight: '800',
    color: DARK,
    lineHeight: 18,
  },

  marketDistrict: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
    fontWeight: '500',
  },

  /* Meta Right Container Aligning Badge & Date Safely */
  rateMetaRight: {
    alignItems: 'flex-end',
    gap: 6,
  },

  rateSerialBadge: {
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },

  rateSerialText: {
    fontSize: 9,
    fontWeight: '800',
    color: MUTED,
  },

  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BLUE_BG,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EBF8FF',
  },

  dateChipText: {
    fontSize: 10,
    color: BLUE,
    fontWeight: '800', // Bold
  },

  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFA',
    borderRadius: 12,
    marginTop: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },

  priceItem: {
    flex: 1,
    alignItems: 'center',
  },

  priceLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: MUTED,
    letterSpacing: 0.6,
    marginBottom: 4,
  },

  modalPriceLabel: {
    color: GREEN,
  },

  priceValue: {
    fontSize: 15,
    fontWeight: '900',
    color: DARK,
  },

  modalPriceValue: {
    color: GREEN,
  },

  priceBar: {
    width: 30,
    height: 3,
    borderRadius: 2,
    marginTop: 6,
  },

  priceDivider: {
    width: 1,
    height: 34,
    backgroundColor: BORDER,
  },

  detailsRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },

  detailChip: {
    flex: 1,
    backgroundColor: '#F7FAFA',
    borderRadius: 10,
    padding: 9,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },

  detailChipLabel: {
    fontSize: 8,
    color: MUTED,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  detailChipValue: {
    fontSize: 11,
    color: TEXT,
    fontWeight: '700',
    marginTop: 2,
  },

  // Pagination
  paginationWrapper: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  paginationInfo: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '600',
    marginBottom: 12,
  },

  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  paginationArrow: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },

  paginationArrowDisabled: {
    backgroundColor: '#FAFAFA',
    borderColor: BORDER_LIGHT,
  },

  pageNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  pageButton: {
    minWidth: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },

  pageButtonActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
    shadowColor: GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  pageButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_SECONDARY,
  },

  pageButtonTextActive: {
    color: WHITE,
    fontWeight: '800',
  },

  paginationDots: {
    paddingHorizontal: 4,
    justifyContent: 'center',
  },

  paginationDotsText: {
    fontSize: 12,
    color: MUTED,
    letterSpacing: 1,
  },

  quickJumpRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  quickJumpBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: GREEN_LIGHT,
  },

  quickJumpBtnDisabled: {
    backgroundColor: '#F7FAFC',
  },

  quickJumpText: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN,
  },

  quickJumpTextDisabled: {
    color: '#CBD5E0',
  },

  // Empty / Loading / Error
  emptyCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    paddingHorizontal: 28,
    paddingVertical: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  emptyIconOuter: {
    marginBottom: 16,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    color: MUTED,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },

  primaryButton: {
    marginTop: 20,
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    shadowColor: GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  primaryButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
  },

  loadingCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    paddingVertical: 40,
    paddingHorizontal: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },

  loadingPulse: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK,
    marginTop: 14,
  },

  loadingText: {
    fontSize: 12,
    lineHeight: 18,
    color: MUTED,
    textAlign: 'center',
    marginTop: 6,
  },

  errorCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: RED_BORDER,
  },

  errorIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: RED_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK,
  },

  errorText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: GREEN,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    shadowColor: GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  retryButtonText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '700',
  },

  inlineError: {
    backgroundColor: RED_BG,
    borderRadius: 10,
    padding: 11,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: RED_BORDER,
  },

  inlineErrorText: {
    color: RED,
    fontSize: 11,
    lineHeight: 16,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalSafeArea: {
    maxHeight: '92%',
  },

  locationModal: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },

  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#D9DEDB',
    alignSelf: 'center',
    marginBottom: 14,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  modalLocationIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
  },

  modalSubtitle: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },

  detectedLocationBanner: {
    marginTop: 14,
    padding: 10,
    borderRadius: 12,
    backgroundColor: GREEN_LIGHT,
    borderWidth: 1,
    borderColor: '#C6F6D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  detectedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },

  detectedIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  detectedTextContainer: {
    flex: 1,
  },

  detectedLabel: {
    fontSize: 8,
    color: GREEN,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  detectedValue: {
    fontSize: 12,
    color: DARK,
    fontWeight: '700',
    marginTop: 1,
  },

  autoBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: WHITE,
  },

  autoBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    color: GREEN,
    letterSpacing: 0.5,
  },

  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  step: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F7FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  activeStep: {
    backgroundColor: GREEN_LIGHT,
    borderColor: '#C6F6D5',
  },

  disabledStep: {
    opacity: 0.4,
  },

  stepNumberCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeStepNumberCircle: {
    backgroundColor: GREEN,
  },

  completedStepNumberCircle: {
    backgroundColor: GREEN,
  },

  stepNumberText: {
    fontSize: 10,
    fontWeight: '800',
    color: MUTED,
  },

  activeStepNumberText: {
    color: WHITE,
  },

  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
  },

  activeStepText: {
    color: GREEN,
  },

  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
    marginHorizontal: 8,
  },

  draftLocation: {
    marginTop: 10,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  draftLocationText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: DARK,
  },

  draftLocationPlaceholder: {
    color: MUTED,
    fontWeight: '500',
  },

  modalListContainer: {
    height: 280,
    marginTop: 10,
  },

  modalSearchBar: {
    height: 40,
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  modalSearchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 13,
    color: TEXT,
    paddingVertical: 0,
  },

  locationList: {
    paddingBottom: 8,
  },

  locationOption: {
    minHeight: 46,
    paddingHorizontal: 8,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },

  locationOptionSelected: {
    backgroundColor: GREEN_LIGHT,
  },

  locationOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  optionIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  optionIconSelected: {
    backgroundColor: GREEN,
  },

  locationOptionText: {
    fontSize: 13,
    color: TEXT,
    fontWeight: '600',
  },

  locationOptionTextSelected: {
    color: GREEN_DARK,
    fontWeight: '800',
  },

  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backToState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    marginBottom: 4,
  },

  backToStateText: {
    fontSize: 12,
    color: GREEN,
    fontWeight: '700',
  },

  modalLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },

  modalLoadingText: {
    fontSize: 12,
    color: MUTED,
  },

  noDistricts: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  noDistrictIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: ORANGE_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  noDistrictsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: DARK,
  },

  noDistrictsText: {
    marginTop: 5,
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },

  modalFooter: {
    marginTop: 10,
  },

  applyButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    shadowColor: GREEN,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  applyButtonDisabled: {
    backgroundColor: '#A0C4AD',
    shadowOpacity: 0,
    elevation: 0,
  },

  applyButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
  },

  useAutomaticButton: {
    height: 42,
    marginTop: 8,
    borderRadius: 11,
    backgroundColor: GREEN_LIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  useAutomaticText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '700',
  },

  sourceContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },

  sourceText: {
    textAlign: 'center',
    color: MUTED,
    fontSize: 10,
    lineHeight: 15,
  },
});

export default MandiRatesScreen;