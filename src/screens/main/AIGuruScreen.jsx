import React, {
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import BottomTabBar from '../../common/BottomTabBar';

import AIGuruHeader from '../../components/aiguru/AIGuruHeader';
import CurrentFarmCard from '../../components/aiguru/CurrentFarmCard';
import AIReadySection from '../../components/aiguru/AIReadySection';
import SuggestedQuestions from '../../components/aiguru/SuggestedQuestions';
import ChatMessage from '../../components/aiguru/ChatMessage';
import TypingIndicator from '../../components/aiguru/TypingIndicator';
import ChatComposer from '../../components/aiguru/ChatComposer';

const {width} = Dimensions.get('window');

const DARK = '#171D2C';
const MUTED = '#7F8A9D';
const PAGE_BG = '#FFFFFF';

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size - 2,
    Math.min(size * scale, size + 2),
  );
};

const SUGGESTED_QUESTIONS = [
  'Will my crop need irrigation?',
  'Any disease risk this week?',
  'What fertilizer should I apply?',
  'Weather forecast for my farm?',
  'Current mandi prices?',
];

const INITIAL_MESSAGES = [
  {
    id: 'welcome-ai',
    sender: 'ai',
    text:
      'Namaste Vishal! I am your AI farming assistant. I am monitoring Patil Farm and can help with your soybean crop, irrigation, disease risk, fertilizer planning, weather and mandi prices.',
    time: 'Now',
  },
];

export default function AIGuruScreen({
  navigation,
}) {
  const scrollRef = useRef(null);

  const [messages, setMessages] =
    useState(INITIAL_MESSAGES);

  const [inputText, setInputText] =
    useState('');

  const [isTyping, setIsTyping] =
    useState(false);

  const hasConversation = messages.length > 1;

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd?.({
        animated: true,
      });
    });
  }, []);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    );
  };

  const getAIResponse = question => {
    const normalized = question.toLowerCase();

    if (
      normalized.includes('irrigation') ||
      normalized.includes('water')
    ) {
      return 'Based on the current farm conditions, your soybean field has moderate soil moisture. Irrigation is not immediately required today. Check the field again tomorrow morning, especially if rainfall does not occur.';
    }

    if (
      normalized.includes('disease') ||
      normalized.includes('pest')
    ) {
      return 'The current disease risk is low to moderate. Inspect the underside of leaves for yellow spots, curling or insects. Avoid spraying unless visible symptoms cross the economic threshold.';
    }

    if (
      normalized.includes('fertilizer') ||
      normalized.includes('nutrient')
    ) {
      return 'For the current vegetative stage, apply fertilizer only after confirming soil moisture. A balanced micronutrient mix may support growth, but avoid excessive nitrogen because it can produce weak vegetative growth.';
    }

    if (
      normalized.includes('weather') ||
      normalized.includes('rain')
    ) {
      return 'Patil Farm is expected to remain warm with moderate humidity. There is a possibility of rainfall later in the day, so complete spraying or cultivation work during the morning window.';
    }

    if (
      normalized.includes('mandi') ||
      normalized.includes('price')
    ) {
      return 'I can compare nearby mandi prices for soybean and cotton. For accurate live prices, connect your mandi-rate service and select your preferred market location.';
    }

    return 'I have analyzed your question using the current Patil Farm context. Please share the crop stage, visible symptoms or field condition for a more precise recommendation.';
  };

  const submitMessage = useCallback(
    question => {
      const trimmedQuestion =
        question.trim();

      if (!trimmedQuestion || isTyping) {
        return;
      }

      const userMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: trimmedQuestion,
        time: getCurrentTime(),
      };

      setMessages(current => [
        ...current,
        userMessage,
      ]);

      setInputText('');
      setIsTyping(true);

      setTimeout(scrollToBottom, 80);

      setTimeout(() => {
        const aiMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: getAIResponse(
            trimmedQuestion,
          ),
          time: getCurrentTime(),
        };

        setMessages(current => [
          ...current,
          aiMessage,
        ]);

        setIsTyping(false);

        setTimeout(scrollToBottom, 100);
      }, 1100);
    },
    [isTyping, scrollToBottom],
  );

  const handleSend = () => {
    submitMessage(inputText);
  };

  const handleSuggestedQuestion = question => {
    submitMessage(question);
  };

  const handleVoicePress = () => {
    Alert.alert(
      'Voice Assistant',
      'Voice recognition can be connected here. You can currently type or select a suggested question.',
    );
  };

  const handleAttachmentPress = () => {
    Alert.alert(
      'Upload Farm Image',
      'Connect your image picker here to upload crop, pest or disease photos.',
    );
  };

  const handleSwitchFarm = () => {
    Alert.alert(
      'Switch Farm',
      'Select the farm you want AI Guru to analyse.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'My Farms',
          onPress: () =>
            navigation.navigate('MyFarms'),
        },
      ],
    );
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Conversation',
      'Do you want to remove all messages from this conversation?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages(INITIAL_MESSAGES);
            setInputText('');
            setIsTyping(false);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? 0 : 0
        }>
        <AIGuruHeader
          navigation={navigation}
          onClearChat={handleClearChat}
        />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => {
            if (hasConversation) {
              scrollToBottom();
            }
          }}>
          <CurrentFarmCard
            onSwitchFarm={handleSwitchFarm}
          />

          {!hasConversation && (
            <>
              <AIReadySection
                onVoicePress={handleVoicePress}
              />

              <SuggestedQuestions
                questions={SUGGESTED_QUESTIONS}
                onQuestionPress={
                  handleSuggestedQuestion
                }
              />
            </>
          )}

          {hasConversation && (
            <View style={styles.chatSection}>
              <View style={styles.chatHeader}>
                <View>
                  <Text style={styles.chatTitle}>
                    Farm Assistant Chat
                  </Text>

                  <Text style={styles.chatSubtitle}>
                    AI answers use Patil Farm context
                  </Text>
                </View>

                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot} />

                  <Text style={styles.onlineText}>
                    Online
                  </Text>
                </View>
              </View>

              <View style={styles.messagesContainer}>
                {messages.map(message => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                  />
                ))}

                {isTyping && (
                  <TypingIndicator />
                )}
              </View>

              <SuggestedQuestions
                questions={[
                  'Should I irrigate tomorrow?',
                  'Check crop disease risk',
                  'Suggest fertilizer dose',
                ]}
                onQuestionPress={
                  handleSuggestedQuestion
                }
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.composerArea}>
          <ChatComposer
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
            onVoicePress={handleVoicePress}
            onAttachmentPress={
              handleAttachmentPress
            }
          />
        </View>

        <View style={styles.tabBarSpace} />

        <BottomTabBar
          navigation={navigation}
          active="AIGuru"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 23,
    backgroundColor: '#FFFFFF',
  },

  chatSection: {
    paddingTop: 24,
  },

  chatHeader: {
    marginHorizontal: width * 0.037,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  chatTitle: {
    fontSize: rf(18),
    lineHeight: rf(22),
    fontWeight: '900',
    color: DARK,
    letterSpacing: -0.25,
  },

  chatSubtitle: {
    marginTop: 3,
    fontSize: rf(10),
    fontWeight: '500',
    color: MUTED,
  },

  onlineBadge: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#ECFDF3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },

  onlineText: {
    fontSize: rf(9),
    fontWeight: '900',
    color: '#16883E',
  },

  messagesContainer: {
    paddingHorizontal: width * 0.037,
  },

  composerArea: {
    backgroundColor: '#FFFFFF',
  },

  tabBarSpace: {
    height: 86,
    backgroundColor: '#FFFFFF',
  },
});