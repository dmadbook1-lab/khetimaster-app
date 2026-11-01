import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Plus, MessagesSquare, Trash2 } from 'lucide-react-native';
import BottomSheet from './BottomSheet';
import { COLORS, PressableScale } from './theme';

const formatWhen = value => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();

  return sameDay
    ? date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/*
 * Past AI Guru conversations.
 *
 * onOpen(sessionId), onDelete(sessionId), onNewChat(), onClearAll()
 */
export default function ChatHistorySheet({
  visible,
  sessions = [],
  loading = false,
  activeSessionId,
  onOpen,
  onDelete,
  onNewChat,
  onClearAll,
  onClose,
}) {
  return (
    <BottomSheet visible={visible} title="Your chats" onClose={onClose}>
      <PressableScale onPress={onNewChat} scaleTo={0.97} style={styles.newChat}>
        <Plus size={20} color="#FFFFFF" strokeWidth={2.6} />
        <Text style={styles.newChatText}>New chat</Text>
      </PressableScale>

      {loading && sessions.length === 0 ? (
        <ActivityIndicator color={COLORS.green} style={styles.loader} />
      ) : sessions.length === 0 ? (
        <Text style={styles.empty}>
          No chats yet. Ask AI Guru your first question.
        </Text>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {sessions.map(session => {
            const active = session.id === activeSessionId;
            return (
              <Pressable
                key={session.id}
                onPress={() => onOpen(session.id)}
                style={({ pressed }) => [
                  styles.row,
                  active && styles.activeRow,
                  pressed && styles.pressedRow,
                ]}
              >
                <View style={styles.rowIcon}>
                  <MessagesSquare
                    size={18}
                    color={COLORS.green}
                    strokeWidth={2.2}
                  />
                </View>

                <View style={styles.rowText}>
                  <Text numberOfLines={1} style={styles.rowTitle}>
                    {session.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.rowSubtitle}>
                    {session.lastMessagePreview}
                  </Text>
                </View>

                <View style={styles.rowEnd}>
                  <Text style={styles.when}>
                    {formatWhen(session.lastMessageAt)}
                  </Text>
                  <Pressable
                    hitSlop={10}
                    accessibilityLabel="Delete chat"
                    onPress={() => onDelete(session.id)}
                  >
                    <Trash2 size={16} color={COLORS.faint} strokeWidth={2.2} />
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {sessions.length > 0 && (
        <Pressable onPress={onClearAll} style={styles.clearAll}>
          <Text style={styles.clearAllText}>Clear all chats</Text>
        </Pressable>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  newChat: {
    marginBottom: 14,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newChatText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  loader: { marginVertical: 30 },
  empty: {
    marginVertical: 26,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.muted,
  },
  list: { flexGrow: 0 },
  row: {
    minHeight: 66,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeRow: {
    backgroundColor: COLORS.greenLight,
    borderRadius: 14,
    borderBottomColor: 'transparent',
    paddingHorizontal: 10,
  },
  pressedRow: { opacity: 0.6 },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  rowSubtitle: {
    marginTop: 2,
    fontSize: 12.5,
    fontWeight: '400',
    color: COLORS.muted,
  },
  rowEnd: { alignItems: 'flex-end', gap: 8 },
  when: { fontSize: 11, fontWeight: '600', color: COLORS.faint },
  clearAll: { marginTop: 10, alignSelf: 'center', padding: 8 },
  clearAllText: { fontSize: 13.5, fontWeight: '700', color: COLORS.danger },
});
