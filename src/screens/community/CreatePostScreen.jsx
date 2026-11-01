import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Video from 'react-native-video';
import {
  Camera,
  Clapperboard,
  Film,
  Images,
  MapPin,
  Plus,
  RefreshCw,
  Video as VideoIcon,
  X,
} from 'lucide-react-native';
import Avatar from '../../components/community/social/Avatar';
import { COLORS, rf } from '../../components/community/theme';
import { createCommunityPost } from '../../redux/slices/communitySlice';
import {
  MAX_POST_MEDIA,
  MAX_REEL_SECONDS,
  captureCommunityMedia,
  pickCommunityMedia,
  uploadCommunityAssets,
  validateCommunityAsset,
} from '../../utils/communityMedia';
import { formatDuration } from '../../utils/communityFormat';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MAX_CAPTION = 2200;

const SUGGESTED_TAGS = [
  '#KhetiMaster',
  '#OrganicFarming',
  '#किसान',
  '#Wheat',
  '#Paddy',
  '#Cotton',
  '#Soybean',
  '#DripIrrigation',
  '#SoilHealth',
  '#जैविकखेती',
  '#Harvest',
  '#FarmLife',
];

/*
 * Share a feed post (1-10 photos / videos) or a reel (one video).
 *
 * params: type 'post' | 'reel'
 */
export default function CreatePostScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const me = useSelector(state => state.auth.user);

  const [type, setType] = useState(route.params?.type === 'reel' ? 'reel' : 'post');
  const [assets, setAssets] = useState([]);
  const [selected, setSelected] = useState(0);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState(
    [me?.district, me?.state].filter(Boolean).join(', '),
  );
  const [progress, setProgress] = useState(null);
  const [stage, setStage] = useState('');

  const busy = progress !== null;

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !busy });
  }, [navigation, busy]);

  const switchType = next => {
    if (next === type || busy) return;

    setType(next);
    setSelected(0);
    // a reel can only keep a single video
    setAssets(prev =>
      next === 'reel' ? prev.filter(a => a.kind === 'video').slice(0, 1) : prev,
    );
  };

  const addAssets = picked => {
    const errors = [];
    const valid = picked.filter(asset => {
      const error = validateCommunityAsset(asset, type);

      if (error) errors.push(error);

      return !error;
    });

    if (errors.length) {
      Alert.alert('Some media was skipped', [...new Set(errors)].join('\n'));
    }

    if (!valid.length) return;

    if (type === 'reel') {
      setAssets(valid.slice(0, 1));
      setSelected(0);
      return;
    }

    setSelected(Math.min(assets.length, MAX_POST_MEDIA - 1));
    setAssets(prev => [...prev, ...valid].slice(0, MAX_POST_MEDIA));
  };

  const openGallery = async () => {
    try {
      addAssets(
        await pickCommunityMedia({
          type,
          selectionLimit: MAX_POST_MEDIA - (type === 'reel' ? 0 : assets.length),
        }),
      );
    } catch (error) {
      Alert.alert('Gallery', error.message);
    }
  };

  const openCamera = async kind => {
    try {
      addAssets(await captureCommunityMedia({ kind }));
    } catch (error) {
      Alert.alert('Camera', error.message);
    }
  };

  const removeAsset = index => {
    setAssets(prev => prev.filter((_, i) => i !== index));
    setSelected(0);
  };

  const appendTag = tag => {
    setCaption(prev => {
      if (prev.toLowerCase().includes(tag.toLowerCase())) return prev;

      const spacer = prev && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';

      return `${prev}${spacer}${tag} `.slice(0, MAX_CAPTION);
    });
  };

  const share = async () => {
    if (!assets.length || busy) return;

    setStage('Uploading');
    setProgress(0);

    try {
      const media = await uploadCommunityAssets(assets, setProgress);

      setStage('Sharing');

      const result = await dispatch(
        createCommunityPost({
          type,
          caption: caption.trim(),
          location: location.trim(),
          media,
        }),
      );

      if (createCommunityPost.rejected.match(result)) {
        throw new Error(result.payload);
      }

      setProgress(null);
      navigation.goBack();
    } catch (error) {
      setProgress(null);
      Alert.alert(
        'Could not share',
        error.message || 'Something went wrong. Please try again.',
      );
    }
  };

  const close = () => {
    if (busy) return;

    if (!assets.length && !caption.trim()) {
      navigation.goBack();
      return;
    }

    Alert.alert('Discard this?', 'Your photos, video and caption will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  /* ------------------------------------------------------------------ */

  const renderPicker = () => (
    <View style={[styles.picker, type === 'reel' ? styles.pickerReel : styles.pickerPost]}>
      <View style={styles.pickerIcon}>
        {type === 'reel' ? (
          <Clapperboard size={34} color={COLORS.DARK_GREEN} strokeWidth={1.8} />
        ) : (
          <Images size={34} color={COLORS.DARK_GREEN} strokeWidth={1.8} />
        )}
      </View>
      <Text style={styles.pickerTitle}>
        {type === 'reel' ? 'Add a reel video' : 'Add photos or videos'}
      </Text>
      <Text style={styles.pickerText}>
        {type === 'reel'
          ? `Vertical videos up to ${MAX_REEL_SECONDS} seconds look best`
          : `Share up to ${MAX_POST_MEDIA} photos or videos from your farm`}
      </Text>

      <View style={styles.pickerButtons}>
        <Pressable style={[styles.pickerButton, styles.pickerButtonPrimary]} onPress={openGallery}>
          <Images size={18} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.pickerButtonTextPrimary}>Gallery</Text>
        </Pressable>

        {type === 'post' ? (
          <Pressable style={styles.pickerButton} onPress={() => openCamera('photo')}>
            <Camera size={18} color={COLORS.DARK_GREEN} strokeWidth={2.2} />
            <Text style={styles.pickerButtonText}>Photo</Text>
          </Pressable>
        ) : null}

        <Pressable style={styles.pickerButton} onPress={() => openCamera('video')}>
          <VideoIcon size={18} color={COLORS.DARK_GREEN} strokeWidth={2.2} />
          <Text style={styles.pickerButtonText}>Record</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderReelPreview = () => {
    const asset = assets[0];

    return (
      <View style={styles.reelPreviewWrap}>
        <View style={styles.reelPreview}>
          <Video
            source={{ uri: asset.uri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            repeat
            muted
            paused={busy}
            shutterColor="transparent"
          />
          {asset.duration ? (
            <View style={styles.durationChip}>
              <Film size={12} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.durationText}>{formatDuration(asset.duration)}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.replaceRow}>
          <Pressable style={styles.replaceButton} onPress={openGallery}>
            <RefreshCw size={15} color={COLORS.DARK} strokeWidth={2.3} />
            <Text style={styles.replaceText}>Replace</Text>
          </Pressable>
          <Pressable style={styles.replaceButton} onPress={() => openCamera('video')}>
            <VideoIcon size={15} color={COLORS.DARK} strokeWidth={2.3} />
            <Text style={styles.replaceText}>Record</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderPostPreview = () => {
    const current = assets[Math.min(selected, assets.length - 1)];

    return (
      <View>
        <View style={styles.postPreview}>
          {current.kind === 'video' ? (
            <Video
              source={{ uri: current.uri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              repeat
              muted
              paused={busy}
              shutterColor="transparent"
            />
          ) : (
            <Image source={{ uri: current.uri }} style={StyleSheet.absoluteFill} />
          )}
          {assets.length > 1 ? (
            <View style={styles.counterChip}>
              <Text style={styles.durationText}>
                {Math.min(selected, assets.length - 1) + 1}/{assets.length}
              </Text>
            </View>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbRow}
        >
          {assets.map((asset, index) => (
            <Pressable
              key={`${asset.uri}-${index}`}
              onPress={() => setSelected(index)}
              style={[styles.thumb, index === selected && styles.thumbActive]}
            >
              {asset.kind === 'image' ? (
                <Image source={{ uri: asset.uri }} style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, styles.thumbVideo]}>
                  <Film size={20} color="#FFFFFF" />
                </View>
              )}
              <Pressable
                hitSlop={8}
                onPress={() => removeAsset(index)}
                style={styles.thumbRemove}
              >
                <X size={12} color="#FFFFFF" strokeWidth={3} />
              </Pressable>
            </Pressable>
          ))}

          {assets.length < MAX_POST_MEDIA ? (
            <Pressable style={[styles.thumb, styles.thumbAdd]} onPress={openGallery}>
              <Plus size={24} color={COLORS.DARK_GREEN} strokeWidth={2.4} />
            </Pressable>
          ) : null}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={close} style={styles.headerButton}>
          <X size={rf(24)} color={COLORS.DARK} strokeWidth={2.3} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {type === 'reel' ? 'New reel' : 'New post'}
        </Text>
        <Pressable hitSlop={10} onPress={share} disabled={!assets.length || busy}>
          <Text style={[styles.shareText, (!assets.length || busy) && styles.shareDisabled]}>
            Share
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* TYPE SWITCH */}
          <View style={styles.segment}>
            {[
              { key: 'post', label: 'Post', Icon: Images },
              { key: 'reel', label: 'Reel', Icon: Clapperboard },
            ].map(({ key, label, Icon }) => {
              const active = type === key;

              return (
                <Pressable
                  key={key}
                  onPress={() => switchType(key)}
                  style={[styles.segmentItem, active && styles.segmentActive]}
                >
                  <Icon
                    size={16}
                    color={active ? '#FFFFFF' : COLORS.MUTED}
                    strokeWidth={2.3}
                  />
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* MEDIA */}
          {!assets.length
            ? renderPicker()
            : type === 'reel'
            ? renderReelPreview()
            : renderPostPreview()}

          {/* CAPTION */}
          <View style={styles.captionRow}>
            <Avatar user={me && { ...me, _id: me.id }} size={38} />
            <TextInput
              value={caption}
              onChangeText={value => setCaption(value.slice(0, MAX_CAPTION))}
              placeholder="Write a caption… add #hashtags so farmers can find it"
              placeholderTextColor={COLORS.MUTED}
              multiline
              style={styles.captionInput}
            />
          </View>
          <Text style={styles.counter}>
            {caption.length}/{MAX_CAPTION}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsRow}
            keyboardShouldPersistTaps="handled"
          >
            {SUGGESTED_TAGS.map(tag => (
              <Pressable key={tag} onPress={() => appendTag(tag)} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* LOCATION */}
          <View style={styles.locationRow}>
            <MapPin size={18} color={COLORS.DARK_GREEN} strokeWidth={2.2} />
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Add location"
              placeholderTextColor={COLORS.MUTED}
              maxLength={100}
              style={styles.locationInput}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* UPLOAD PROGRESS */}
      <Modal transparent visible={busy} animationType="fade" statusBarTranslucent>
        <View style={styles.overlay}>
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>
              {stage === 'Sharing'
                ? 'Almost done…'
                : `${stage} ${Math.round((progress || 0) * 100)}%`}
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round((progress || 0) * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressHint}>
              Keep the app open until your {type} is shared.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const PREVIEW_REEL_WIDTH = SCREEN_WIDTH * 0.56;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDE2E7',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: rf(17),
    fontWeight: '800',
    color: COLORS.DARK,
  },
  shareText: {
    fontSize: rf(15),
    fontWeight: '800',
    color: COLORS.DARK_GREEN,
    paddingHorizontal: 6,
  },
  shareDisabled: {
    opacity: 0.35,
  },
  scroll: {
    paddingBottom: 40,
  },
  segment: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginVertical: 14,
    padding: 4,
    borderRadius: 22,
    backgroundColor: '#F1F4F6',
  },
  segmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 22,
    borderRadius: 18,
  },
  segmentActive: {
    backgroundColor: COLORS.DARK_GREEN,
  },
  segmentText: {
    fontSize: rf(13.5),
    fontWeight: '800',
    color: COLORS.MUTED,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  picker: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#B7D8C2',
    backgroundColor: '#F4FBF6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  pickerPost: {
    height: SCREEN_WIDTH - 32,
  },
  pickerReel: {
    height: (SCREEN_WIDTH - 32) * 1.2,
  },
  pickerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E2F5E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerTitle: {
    marginTop: 14,
    fontSize: rf(17),
    fontWeight: '800',
    color: COLORS.DARK,
  },
  pickerText: {
    marginTop: 6,
    fontSize: rf(13),
    color: COLORS.MUTED,
    textAlign: 'center',
  },
  pickerButtons: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 21,
    borderWidth: 1.4,
    borderColor: COLORS.DARK_GREEN,
    backgroundColor: '#FFFFFF',
  },
  pickerButtonPrimary: {
    backgroundColor: COLORS.DARK_GREEN,
  },
  pickerButtonText: {
    fontSize: rf(13.5),
    fontWeight: '800',
    color: COLORS.DARK_GREEN,
  },
  pickerButtonTextPrimary: {
    fontSize: rf(13.5),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reelPreviewWrap: {
    alignItems: 'center',
  },
  reelPreview: {
    width: PREVIEW_REEL_WIDTH,
    height: PREVIEW_REEL_WIDTH * (16 / 9),
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  durationChip: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  counterChip: {
    position: 'absolute',
    right: 12,
    top: 12,
    paddingHorizontal: 9,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: rf(11),
    fontWeight: '700',
  },
  replaceRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#F1F4F6',
  },
  replaceText: {
    fontSize: rf(13),
    fontWeight: '700',
    color: COLORS.DARK,
  },
  postPreview: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: '#0F1115',
  },
  thumbRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E8ECEF',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: {
    borderColor: COLORS.DARK_GREEN,
  },
  thumbVideo: {
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbRemove: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbAdd: {
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderColor: '#B7D8C2',
    backgroundColor: '#F4FBF6',
  },
  captionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  captionInput: {
    flex: 1,
    minHeight: 90,
    fontSize: rf(15),
    lineHeight: rf(21),
    color: COLORS.DARK,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  counter: {
    alignSelf: 'flex-end',
    marginRight: 16,
    fontSize: rf(11),
    color: COLORS.MUTED,
  },
  tagsRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tagChip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#EEF8F1',
    justifyContent: 'center',
  },
  tagText: {
    fontSize: rf(12.5),
    fontWeight: '700',
    color: COLORS.DARK_GREEN,
  },
  locationRow: {
    marginHorizontal: 16,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDE2E7',
  },
  locationInput: {
    flex: 1,
    height: 48,
    fontSize: rf(14),
    color: COLORS.DARK,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  progressCard: {
    width: '100%',
    borderRadius: 20,
    padding: 22,
    backgroundColor: '#FFFFFF',
  },
  progressTitle: {
    fontSize: rf(17),
    fontWeight: '800',
    color: COLORS.DARK,
  },
  progressTrack: {
    marginTop: 14,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8EEF0',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.DARK_GREEN,
  },
  progressHint: {
    marginTop: 12,
    fontSize: rf(12.5),
    color: COLORS.MUTED,
  },
});
