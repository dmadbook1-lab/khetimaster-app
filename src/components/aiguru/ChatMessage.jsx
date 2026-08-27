import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Bot,
  UserRound,
  Sparkles,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const GREEN = '#16883E';
const DARK = '#172033';
const MUTED = '#8791A1';

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size - 2,
    Math.min(size * scale, size + 2),
  );
};

export default function ChatMessage({message}) {
  const isUser = message.sender === 'user';

  return (
    <View
      style={[
        styles.wrapper,
        isUser
          ? styles.userWrapper
          : styles.aiWrapper,
      ]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Bot
            size={rf(17)}
            color="#FFFFFF"
            strokeWidth={2.3}
          />
        </View>
      )}

      <View
        style={[
          styles.messageArea,
          isUser && styles.userMessageArea,
        ]}>
        {!isUser && (
          <View style={styles.aiLabelRow}>
            <Sparkles
              size={rf(11)}
              color={GREEN}
              strokeWidth={2.3}
            />

            <Text style={styles.aiLabel}>
              AI Guru
            </Text>
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isUser
              ? styles.userBubble
              : styles.aiBubble,
          ]}>
          <Text
            style={[
              styles.messageText,
              isUser &&
                styles.userMessageText,
            ]}>
            {message.text}
          </Text>
        </View>

        <Text
          style={[
            styles.time,
            isUser && styles.userTime,
          ]}>
          {message.time}
        </Text>
      </View>

      {isUser && (
        <View style={styles.userAvatar}>
          <UserRound
            size={rf(17)}
            color={GREEN}
            strokeWidth={2.3}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  aiWrapper: {
    justifyContent: 'flex-start',
  },

  userWrapper: {
    justifyContent: 'flex-end',
  },

  aiAvatar: {
    width: 35,
    height: 35,
    marginRight: 9,
    borderRadius: 18,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  userAvatar: {
    width: 35,
    height: 35,
    marginLeft: 9,
    borderRadius: 18,
    backgroundColor: '#ECF8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  messageArea: {
    maxWidth: width * 0.73,
  },

  userMessageArea: {
    alignItems: 'flex-end',
  },

  aiLabelRow: {
    marginLeft: 3,
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  aiLabel: {
    fontSize: rf(9),
    fontWeight: '900',
    color: GREEN,
  },

  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  aiBubble: {
    borderBottomLeftRadius: 5,
    backgroundColor: '#F1F8F3',
    borderWidth: 1,
    borderColor: '#DCEFE2',
  },

  userBubble: {
    borderBottomRightRadius: 5,
    backgroundColor: GREEN,
  },

  messageText: {
    fontSize: rf(12),
    lineHeight: rf(18),
    fontWeight: '500',
    color: DARK,
  },

  userMessageText: {
    color: '#FFFFFF',
  },

  time: {
    marginTop: 5,
    marginLeft: 5,
    fontSize: rf(8),
    fontWeight: '500',
    color: MUTED,
  },

  userTime: {
    marginLeft: 0,
    marginRight: 5,
  },
});