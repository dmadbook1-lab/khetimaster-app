import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Keyboard,
} from 'react-native';
import {
  Mic,
  Send,
  Paperclip,
} from 'lucide-react-native';

const {width} = Dimensions.get('window');

const GREEN = '#16883E';
const DARK = '#172033';
const MUTED = '#94A3B8';
const BORDER = '#E3E8EC';

const rf = size => {
  const scale = width / 390;

  return Math.max(
    size - 2,
    Math.min(size * scale, size + 2),
  );
};

export default function ChatComposer({
  value,
  onChangeText,
  onSend,
  onVoicePress,
  onAttachmentPress,
}) {
  const canSend = value.trim().length > 0;

  const handleSend = () => {
    if (!canSend) {
      return;
    }

    Keyboard.dismiss();
    onSend();
  };

  return (
    <View style={styles.container}>
      <View style={styles.composer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAttachmentPress}
          style={styles.smallButton}>
          <Paperclip
            size={rf(19)}
            color={MUTED}
            strokeWidth={2.3}
          />
        </TouchableOpacity>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask AI Guru anything..."
          placeholderTextColor={MUTED}
          multiline
          maxLength={500}
          style={styles.input}
        />

        {!canSend && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onVoicePress}
            style={styles.smallButton}>
            <Mic
              size={rf(20)}
              color={GREEN}
              strokeWidth={2.4}
            />
          </TouchableOpacity>
        )}

        {canSend && (
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={handleSend}
            style={styles.sendButton}>
            <Send
              size={rf(18)}
              color="#FFFFFF"
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: width * 0.037,
    paddingTop: 10,
    paddingBottom: 11,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF1F3',
  },

  composer: {
    minHeight: 52,
    maxHeight: 115,
    borderRadius: 26,
    paddingHorizontal: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'flex-end',

    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },

  smallButton: {
    width: 39,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 100,
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 3,
    fontSize: rf(12),
    lineHeight: rf(18),
    fontWeight: '500',
    color: DARK,
    textAlignVertical: 'top',
  },

  sendButton: {
    width: 40,
    height: 40,
    marginBottom: 5,
    borderRadius: 20,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});