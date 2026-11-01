import { useTranslation } from 'react-i18next';
import React from 'react';
import {
  Animated,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Sparkles,
  Camera,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
} from 'lucide-react-native';
import {
  COLORS,
  GRADIENT,
  PressableScale,
  rf,
  useEntrance,
  width,
} from './theme';

// Gradient fill is transparent on AI / failed bubbles so their background shows
const BUBBLE_FLAT = ['transparent', 'transparent'];

const formatTime = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/*
 * message: { id, role: 'user'|'assistant', text, imageUri?, hasImage?,
 *            actions?, feedback?, isError?, pending?, failed?, createdAt }
 */
export default function ChatMessage({
  message,
  onActionPress,
  onFeedback,
  animate = true,
}) {
  const { t } = useTranslation();
  const isUser = message.role === 'user';
  const actions = message.actions || [];
  const canRate =
    !isUser && !message.isError && !message.localOnly && Boolean(onFeedback);
  const time = message.pending
    ? t('aiGuru.sending')
    : message.failed
    ? t('aiGuru.not_sent')
    : message.time || formatTime(message.createdAt);
  const entrance = useEntrance(0, 10, animate);

  const rate = rating =>
    onFeedback(message.id, message.feedback === rating ? null : rating);

  return (
    <Animated.View
      style={[styles.wrapper, isUser && styles.userWrapper, entrance]}
    >
      {!isUser && (
        <View style={styles.aiLabelRow}>
          <LinearGradient
            colors={GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiAvatar}
          >
            <Sparkles size={rf(12)} color="#FFFFFF" strokeWidth={2.4} />
          </LinearGradient>
          <Text style={styles.aiLabel}>{t('aiGuru.name')}</Text>
        </View>
      )}

      <LinearGradient
        colors={isUser && !message.failed ? GRADIENT : BUBBLE_FLAT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
          message.isError && styles.errorBubble,
          message.failed && styles.failedBubble,
          message.pending && styles.pendingBubble,
        ]}
      >
        {message.imageUri ? (
          <Image source={{ uri: message.imageUri }} style={styles.photo} />
        ) : message.hasImage ? (
          <View style={styles.photoTag}>
            <Camera
              size={rf(14)}
              color={isUser ? '#FFFFFF' : COLORS.green}
              strokeWidth={2.3}
            />
            <Text style={[styles.photoTagText, isUser && styles.userText]}>
              Photo
            </Text>
          </View>
        ) : null}

        {message.isError && (
          <AlertCircle
            size={rf(16)}
            color={COLORS.danger}
            strokeWidth={2.3}
            style={styles.errorIcon}
          />
        )}

        {!!message.text && (
          <Text
            selectable
            style={[
              styles.messageText,
              isUser && styles.userText,
              message.isError && styles.errorText,
            ]}
          >
            {message.text}
          </Text>
        )}
      </LinearGradient>

      {actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map(action => (
            <PressableScale
              key={`${action.screen}-${JSON.stringify(action.params || {})}`}
              onPress={() => onActionPress?.(action)}
              scaleTo={0.97}
              style={styles.actionButton}
            >
              <Text numberOfLines={1} style={styles.actionText}>
                {action.label}
              </Text>
              <ChevronRight
                size={rf(18)}
                color={COLORS.green}
                strokeWidth={2.5}
              />
            </PressableScale>
          ))}
        </View>
      )}

      <View style={[styles.metaRow, isUser && styles.userMetaRow]}>
        <Text style={[styles.time, message.failed && styles.failedTime]}>
          {time}
        </Text>

        {canRate && (
          <View style={styles.feedbackRow}>
            <Text style={styles.helpful}>{t('aiGuru.helpful_q')}</Text>
            <Pressable
              hitSlop={8}
              accessibilityLabel={t('aiGuru.helpful')}
              onPress={() => rate('up')}
              style={[
                styles.feedbackButton,
                message.feedback === 'up' && styles.feedbackUp,
              ]}
            >
              <ThumbsUp
                size={rf(14)}
                color={message.feedback === 'up' ? COLORS.green : COLORS.faint}
                strokeWidth={2.3}
              />
            </Pressable>
            <Pressable
              hitSlop={8}
              accessibilityLabel={t('aiGuru.not_helpful')}
              onPress={() => rate('down')}
              style={[
                styles.feedbackButton,
                message.feedback === 'down' && styles.feedbackDown,
              ]}
            >
              <ThumbsDown
                size={rf(14)}
                color={
                  message.feedback === 'down' ? COLORS.danger : COLORS.faint
                }
                strokeWidth={2.3}
              />
            </Pressable>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userWrapper: {
    alignItems: 'flex-end',
  },
  aiLabelRow: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabel: {
    fontSize: rf(12),
    fontWeight: '700',
    color: COLORS.text,
  },
  bubble: {
    maxWidth: width * 0.84,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiBubble: {
    borderTopLeftRadius: 6,
    backgroundColor: COLORS.soft,
    borderWidth: 1,
    borderColor: '#EAF0EC',
  },
  userBubble: {
    maxWidth: width * 0.78,
    borderBottomRightRadius: 6,
    shadowColor: '#16A34A',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  pendingBubble: {
    opacity: 0.7,
  },
  failedBubble: {
    backgroundColor: COLORS.faint,
  },
  errorBubble: {
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  messageText: {
    fontSize: rf(15),
    lineHeight: rf(22),
    fontWeight: '400',
    color: COLORS.text,
  },
  userText: {
    color: '#FFFFFF',
  },
  errorIcon: {
    marginBottom: 4,
  },
  errorText: {
    color: '#991B1B',
  },
  photo: {
    width: width * 0.56,
    height: width * 0.56,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: COLORS.greenLight,
  },
  photoTag: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  photoTagText: {
    fontSize: rf(12),
    fontWeight: '700',
    color: COLORS.green,
  },
  actions: {
    marginTop: 10,
    width: width * 0.84,
    gap: 8,
  },
  actionButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.greenBorder,
    backgroundColor: COLORS.greenLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionText: {
    flexShrink: 1,
    fontSize: rf(14),
    fontWeight: '700',
    color: COLORS.greenDark,
  },
  metaRow: {
    marginTop: 6,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userMetaRow: {
    justifyContent: 'flex-end',
  },
  time: {
    fontSize: rf(11),
    fontWeight: '500',
    color: COLORS.faint,
  },
  failedTime: {
    color: COLORS.danger,
    fontWeight: '700',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpful: {
    fontSize: rf(11),
    fontWeight: '500',
    color: COLORS.faint,
  },
  feedbackButton: {
    width: 30,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackUp: {
    backgroundColor: COLORS.greenLight,
    borderColor: COLORS.greenBorder,
  },
  feedbackDown: {
    backgroundColor: COLORS.dangerLight,
    borderColor: '#FECACA',
  },
});
