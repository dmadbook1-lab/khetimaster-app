import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { X, Trash2 } from 'lucide-react-native';
import BottomTabBar from '../../common/BottomTabBar';
import AIGuruHeader, {
  HEADER_HEIGHT,
} from '../../components/aiguru/AIGuruHeader';
import CurrentFarmCard from '../../components/aiguru/CurrentFarmCard';
import AIReadySection from '../../components/aiguru/AIReadySection';
import ChatMessage from '../../components/aiguru/ChatMessage';
import TypingIndicator from '../../components/aiguru/TypingIndicator';
import ChatComposer, {
  COMPOSER_HEIGHT,
} from '../../components/aiguru/ChatComposer';
import FarmPickerSheet from '../../components/aiguru/FarmPickerSheet';
import ChatHistorySheet from '../../components/aiguru/ChatHistorySheet';
import {
  AmbientGlow,
  COLORS,
  FadeInUp,
  GUTTER,
  Glass,
  PressableScale,
  rf,
} from '../../components/aiguru/theme';
import VoiceAssistantModal from '../../components/voice/VoiceAssistantModal';
import { selectUser } from '../../redux/slices/authSlice';
import {
  loadMyFarms,
  selectFarmFields,
} from '../../redux/slices/farmFieldSlice';
import {
  selectAiGuru,
  sendAiGuruMessage,
  startNewAiGuruChat,
  setAiGuruFarm,
  setAiGuruLanguage,
  fetchAiGuruSessions,
  openAiGuruSession,
  deleteAiGuruSession,
  clearAiGuruHistory,
  rateAiGuruMessage,
} from '../../redux/slices/aiGuruSlice';
import { resolveAiGuruAction } from '../../constants/aiGuruScreens';
import { pickAiGuruPhoto } from '../../utils/aiGuruPhoto';
/*
 * Route params (all optional), used when another screen opens AI Guru:
 *   fieldId   farm to talk about ('general' for none)
 *   question  sent right away
 *   photo     { uri, base64, mimeType } sent right away
 *   source    where the question came from (farm, disease, mandi, ...)
 *   newChat   start a fresh conversation
 */
export default function AIGuruScreen({ navigation, route }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const handledParamsRef = useRef(null);

  const user = useSelector(selectUser);
  const farms = useSelector(selectFarmFields);
  const {
    sessionId,
    messages,
    activeFieldId,
    language,
    sending,
    loadingSession,
    sessions,
    sessionsLoading,
  } = useSelector(selectAiGuru);

  const [inputText, setInputText] = useState('');
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [farmPickerVisible, setFarmPickerVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [voiceVisible, setVoiceVisible] = useState(false);

  const userId = user?._id || user?.id || user?.userId;
  const firstName = String(user?.fullName || user?.name || '').split(' ')[0];

  const activeFarm = useMemo(
    () =>
      activeFieldId
        ? farms.find(farm => String(farm?._id) === String(activeFieldId)) ||
          null
        : null,
    [farms, activeFieldId],
  );

  const hasConversation = messages.length > 0;

  const greeting = firstName
    ? t('aiGuru.namaste_name', { name: firstName })
    : t('aiGuru.namaste');
  const welcomeText = activeFarm
    ? `${greeting} ${t('aiGuru.welcome_farm', {
        farm: activeFarm.fieldName,
        crop: activeFarm.isBarrenLand
          ? t('aiGuru.barren_land')
          : activeFarm.cropName,
      })}`
    : `${greeting} ${t('aiGuru.welcome_general')}`;

  // Farms power the farm switcher and farm-aware answers
  useEffect(() => {
    if (userId && farms.length === 0) {
      dispatch(loadMyFarms(userId));
    }
  }, [dispatch, userId, farms.length]);

  // A selected farm that was deleted falls back to general mode
  useEffect(() => {
    if (activeFieldId && farms.length > 0 && !activeFarm) {
      dispatch(setAiGuruFarm(null));
    }
  }, [dispatch, activeFieldId, activeFarm, farms.length]);

  // Follow the newest message until the user drags up to read; content that
  // grows later (images loading) then no longer yanks the view down
  const stickToBottomRef = useRef(true);
  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollToEnd?.({ animated: true });
  }, []);

  useEffect(() => {
    if (hasConversation) {
      stickToBottomRef.current = true;
    }
  }, [messages.length, sending, hasConversation]);

  const submitMessage = useCallback(
    ({ text = '', photo = null, source = 'aiguru' } = {}) => {
      const trimmed = String(text).trim();
      if ((!trimmed && !photo) || sending) {
        return;
      }

      dispatch(
        sendAiGuruMessage({
          message: trimmed,
          image: photo
            ? { base64: photo.base64, mimeType: photo.mimeType }
            : undefined,
          imageUri: photo?.uri,
          source,
        }),
      );
      setInputText('');
      setPendingPhoto(null);
    },
    [dispatch, sending],
  );

  // Questions / photos handed over by other screens
  useEffect(() => {
    const params = route?.params;
    if (!params || handledParamsRef.current === params) {
      return;
    }
    handledParamsRef.current = params;

    const { fieldId, question, photo, source, newChat } = params;
    if (fieldId === undefined && !question && !photo && !newChat) {
      return;
    }

    const nextFieldId =
      fieldId === undefined
        ? activeFieldId
        : fieldId && fieldId !== 'general'
        ? String(fieldId)
        : null;

    if (newChat || nextFieldId !== activeFieldId) {
      dispatch(startNewAiGuruChat());
    }
    dispatch(setAiGuruFarm(nextFieldId));

    if (question || photo) {
      submitMessage({ text: question || '', photo, source });
    }

    navigation.setParams({
      fieldId: undefined,
      question: undefined,
      photo: undefined,
      source: undefined,
      newChat: undefined,
    });
  }, [route?.params, activeFieldId, dispatch, navigation, submitMessage]);

  const handleSend = () => {
    submitMessage({ text: inputText, photo: pendingPhoto });
  };
  const handleVoicePress = () => {
    setVoiceVisible(true);
  };
  const handleVoiceTranscript = text => {
    setVoiceVisible(false);
    submitMessage({ text, photo: pendingPhoto, source: 'voice' });
  };

  const choosePhoto = async camera => {
    try {
      const photo = await pickAiGuruPhoto({ camera });
      if (photo) {
        setPendingPhoto(photo);
      }
    } catch (error) {
      Alert.alert(t('aiGuru.photo'), error.message);
    }
  };
  const handleAttachmentPress = () => {
    Alert.alert(
      t('aiGuru.add_photo_title'),
      t('aiGuru.add_photo_text'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.gallery'), onPress: () => choosePhoto(false) },
        { text: t('common.camera'), onPress: () => choosePhoto(true) },
      ],
    );
  };

  const handleSelectFarm = fieldId => {
    setFarmPickerVisible(false);
    if ((fieldId || null) !== (activeFieldId || null)) {
      dispatch(setAiGuruFarm(fieldId));
    }
  };
  const handleAddFarm = () => {
    setFarmPickerVisible(false);
    navigation.navigate('FarmMappingScreen');
  };

  const handleActionPress = action => {
    const target = resolveAiGuruAction(action, { farms });
    if (target) {
      navigation.navigate(target.route, target.params);
    }
  };
  const handleFeedback = (messageId, rating) => {
    dispatch(rateAiGuruMessage({ messageId, rating }));
  };

  const handleOpenHistory = () => {
    setHistoryVisible(true);
    dispatch(fetchAiGuruSessions());
  };
  const handleOpenSession = id => {
    setHistoryVisible(false);
    if (id !== sessionId) {
      dispatch(openAiGuruSession(id));
    }
  };
  const handleNewChat = () => {
    setHistoryVisible(false);
    dispatch(startNewAiGuruChat());
  };
  const handleDeleteSession = id => {
    Alert.alert(t('aiGuru.delete_chat'), t('aiGuru.delete_chat_text'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => dispatch(deleteAiGuruSession(id)),
      },
    ]);
  };
  const handleClearAll = () => {
    Alert.alert(
      t('aiGuru.clear_all'),
      t('aiGuru.clear_all_text'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.clear'),
          style: 'destructive',
          onPress: () => {
            setHistoryVisible(false);
            dispatch(clearAiGuruHistory());
          },
        },
      ],
    );
  };
  const handleClearChat = () => {
    if (!hasConversation) {
      return;
    }
    Alert.alert(
      t('aiGuru.clear_conversation'),
      t('aiGuru.clear_conversation_text'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.clear'),
          style: 'destructive',
          onPress: () => {
            if (sessionId) {
              dispatch(deleteAiGuruSession(sessionId));
            } else {
              dispatch(startNewAiGuruChat());
            }
            setInputText('');
            setPendingPhoto(null);
          },
        },
      ],
    );
  };

  const welcomeMessage = {
    id: 'welcome-ai',
    role: 'assistant',
    text: welcomeText,
    localOnly: true,
  };

  return (
    <View style={styles.root}>
      <AmbientGlow />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <AIGuruHeader
            navigation={navigation}
            language={language}
            onLanguageChange={code => dispatch(setAiGuruLanguage(code))}
            onHistoryPress={handleOpenHistory}
          />

          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              pendingPhoto && styles.scrollContentWithPhoto,
            ]}
            onContentSizeChange={() => {
              if (hasConversation && stickToBottomRef.current) {
                scrollToBottom();
              }
            }}
            onScrollBeginDrag={() => {
              stickToBottomRef.current = false;
            }}
            scrollEventThrottle={16}
          >
            <CurrentFarmCard
              farm={activeFarm}
              onSwitchFarm={() => setFarmPickerVisible(true)}
            />

            {loadingSession && (
              <View style={styles.loader}>
                <ActivityIndicator color={COLORS.green} />
                <Text style={styles.loaderText}>{t('aiGuru.opening_chat')}</Text>
              </View>
            )}

            {!hasConversation && !loadingSession && (
              <AIReadySection
                name={firstName}
                onVoicePress={handleVoicePress}
              />
            )}

            {hasConversation && !loadingSession && (
              <View style={styles.chatSection}>
                <FadeInUp style={styles.chatHeader}>
                  <View style={styles.chatLine} />
                  <Text style={styles.chatTitle}>{t('common.today')}</Text>
                  <View style={styles.chatLine} />

                  <PressableScale
                    onPress={handleClearChat}
                    style={styles.clearButton}
                  >
                    <Trash2
                      size={rf(14)}
                      color={COLORS.danger}
                      strokeWidth={2.3}
                    />
                    <Text style={styles.clearText}>{t('common.clear')}</Text>
                  </PressableScale>
                </FadeInUp>

                <View style={styles.messagesContainer}>
                  <ChatMessage message={welcomeMessage} animate={false} />

                  {messages.map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      // only fresh messages animate in, not a whole old chat
                      animate={index >= messages.length - 2}
                      onActionPress={handleActionPress}
                      onFeedback={handleFeedback}
                    />
                  ))}

                  {sending && <TypingIndicator />}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.composerArea}>
            {pendingPhoto && (
              <FadeInUp style={styles.photoPreviewWrap}>
                <Glass tint={0.75} style={styles.photoPreview}>
                  <Image
                    source={{ uri: pendingPhoto.uri }}
                    style={styles.photoThumb}
                  />
                  <View style={styles.photoInfo}>
                    <Text style={styles.photoTitle}>{t('aiGuru.photo_attached')}</Text>
                    <Text style={styles.photoText}>
                      {t('aiGuru.photo_attached_hint')}
                    </Text>
                  </View>
                  <PressableScale
                    hitSlop={10}
                    onPress={() => setPendingPhoto(null)}
                    style={styles.photoRemove}
                  >
                    <X size={rf(15)} color={COLORS.muted} strokeWidth={2.6} />
                  </PressableScale>
                </Glass>
              </FadeInUp>
            )}

            <ChatComposer
              value={inputText}
              onChangeText={setInputText}
              onSend={handleSend}
              onVoicePress={handleVoicePress}
              onAttachmentPress={handleAttachmentPress}
              hasAttachment={Boolean(pendingPhoto)}
              disabled={sending}
            />
          </View>

          <View style={styles.tabBarSpace} />

          <BottomTabBar navigation={navigation} active="AIGuru" />
        </KeyboardAvoidingView>

        <FarmPickerSheet
          visible={farmPickerVisible}
          farms={farms}
          activeFieldId={activeFieldId}
          onSelect={handleSelectFarm}
          onAddFarm={handleAddFarm}
          onClose={() => setFarmPickerVisible(false)}
        />

        <ChatHistorySheet
          visible={historyVisible}
          sessions={sessions}
          loading={sessionsLoading}
          activeSessionId={sessionId}
          onOpen={handleOpenSession}
          onDelete={handleDeleteSession}
          onNewChat={handleNewChat}
          onClearAll={handleClearAll}
          onClose={() => setHistoryVisible(false)}
        />

        <VoiceAssistantModal
          visible={voiceVisible}
          onClose={() => setVoiceVisible(false)}
          onTranscript={handleVoiceTranscript}
        />
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  // Header and composer float over the scroll view as glass
  scroll: {
    marginTop: -HEADER_HEIGHT,
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT,
    paddingBottom: COMPOSER_HEIGHT + 12,
  },
  scrollContentWithPhoto: {
    paddingBottom: COMPOSER_HEIGHT + 82,
  },
  loader: {
    marginTop: 48,
    alignItems: 'center',
    gap: 10,
  },
  loaderText: {
    fontSize: rf(12),
    fontWeight: '700',
    color: COLORS.muted,
  },
  chatSection: {
    paddingTop: 18,
  },
  chatHeader: {
    marginHorizontal: GUTTER,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },
  chatTitle: {
    fontSize: rf(12),
    fontWeight: '600',
    color: COLORS.faint,
  },
  clearButton: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: COLORS.dangerLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  clearText: {
    fontSize: rf(10.5),
    fontWeight: '800',
    color: COLORS.danger,
  },
  messagesContainer: {
    paddingHorizontal: GUTTER,
  },
  composerArea: {
    marginTop: -COMPOSER_HEIGHT,
    zIndex: 10,
  },
  photoPreviewWrap: {
    marginHorizontal: GUTTER,
    marginTop: 8,
  },
  photoPreview: {
    padding: 8,
    borderRadius: 20,
    borderColor: COLORS.greenBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  photoThumb: {
    width: 46,
    height: 46,
    borderRadius: 14,
  },
  photoInfo: {
    flex: 1,
  },
  photoTitle: {
    fontSize: rf(12),
    fontWeight: '800',
    color: COLORS.greenDark,
  },
  photoText: {
    marginTop: 1,
    fontSize: rf(10.5),
    fontWeight: '600',
    color: COLORS.muted,
  },
  photoRemove: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarSpace: {
    height: 86,
  },
});
