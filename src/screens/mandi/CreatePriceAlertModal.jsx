import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Pressable,
} from 'react-native';
import {
  ChevronDown,
  Home,
  TrendingUp,
  TrendingDown,
  Bell,
  MessageCircle,
  Smartphone,
} from 'lucide-react-native';
import { COLORS, rf } from '../../components/mandi/theme';
export default function CreatePriceAlertModal({ visible, onClose }) {
  const [direction, setDirection] = useState('above');
  const [methods, setMethods] = useState(['Push', 'WhatsApp']);
  const toggleMethod = m =>
    setMethods(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m],
    );
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <Text style={styles.title}>Create Price Alert</Text>
          <Text style={styles.sub}>
            We'll notify you when your target price is reached.
          </Text>

          {}
          <Text style={styles.label}>Select Crop</Text>
          <View style={styles.selector}>
            <View style={styles.dot} />
            <Text style={styles.selectorText}>Choose a crop...</Text>
            <ChevronDown size={rf(15)} color={COLORS.MUTED} strokeWidth={2.3} />
          </View>

          {}
          <Text style={styles.label}>Select Market</Text>
          <View style={styles.selector}>
            <Home size={rf(14)} color={COLORS.MUTED} strokeWidth={2.3} />
            <Text style={styles.selectorText}>Choose a mandi...</Text>
            <ChevronDown size={rf(15)} color={COLORS.MUTED} strokeWidth={2.3} />
          </View>

          {}
          <Text style={styles.label}>Target Price (per quintal)</Text>
          <View style={styles.selector}>
            <Text
              style={{
                fontSize: rf(14),
                fontWeight: '900',
                color: COLORS.MUTED,
              }}
            >
              ₹
            </Text>
            <TextInput
              placeholder="Enter target price"
              placeholderTextColor={COLORS.MUTED}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          {}
          <Text style={styles.label}>Notify When Price</Text>
          <View style={styles.dirRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setDirection('above')}
              style={[
                styles.dirBtn,
                direction === 'above' && styles.dirBtnActiveGreen,
              ]}
            >
              <TrendingUp
                size={rf(13)}
                color={direction === 'above' ? COLORS.DARK_GREEN : COLORS.MUTED}
                strokeWidth={2.4}
              />
              <Text
                style={[
                  styles.dirText,
                  direction === 'above' && {
                    color: COLORS.DARK_GREEN,
                  },
                ]}
              >
                Goes Above
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setDirection('below')}
              style={[
                styles.dirBtn,
                direction === 'below' && styles.dirBtnActiveGreen,
              ]}
            >
              <TrendingDown
                size={rf(13)}
                color={direction === 'below' ? COLORS.DARK_GREEN : COLORS.MUTED}
                strokeWidth={2.4}
              />
              <Text
                style={[
                  styles.dirText,
                  direction === 'below' && {
                    color: COLORS.DARK_GREEN,
                  },
                ]}
              >
                Goes Below
              </Text>
            </TouchableOpacity>
          </View>

          {}
          <Text style={styles.label}>Notification Method</Text>
          <View style={styles.methodRow}>
            {[
              {
                id: 'Push',
                label: 'Push',
                icon: Bell,
              },
              {
                id: 'WhatsApp',
                label: 'WhatsApp',
                icon: MessageCircle,
              },
              {
                id: 'SMS',
                label: 'SMS',
                icon: Smartphone,
              },
            ].map(m => {
              const Icon = m.icon;
              const active = methods.includes(m.id);
              return (
                <TouchableOpacity
                  key={m.id}
                  activeOpacity={0.85}
                  onPress={() => toggleMethod(m.id)}
                  style={[styles.methodBtn, active && styles.methodBtnActive]}
                >
                  <Icon
                    size={rf(15)}
                    color={active ? COLORS.DARK_GREEN : COLORS.MUTED}
                    strokeWidth={2.4}
                  />
                  <Text
                    style={[
                      styles.methodText,
                      active && {
                        color: COLORS.DARK_GREEN,
                      },
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onClose}
            style={styles.saveBtn}
          >
            <Bell size={rf(15)} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.saveText}>Save Alert</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  title: {
    fontSize: rf(17),
    fontWeight: '900',
    color: COLORS.DARK,
  },
  sub: {
    marginTop: 4,
    fontSize: rf(11),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  label: {
    marginTop: 16,
    fontSize: rf(12),
    fontWeight: '900',
    color: COLORS.DARK,
    marginBottom: 8,
  },
  selector: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectorText: {
    flex: 1,
    fontSize: rf(12),
    fontWeight: '500',
    color: COLORS.MUTED,
  },
  input: {
    flex: 1,
    fontSize: rf(12),
    fontWeight: '500',
    color: COLORS.DARK,
    padding: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.MUTED,
  },
  dirRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dirBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dirBtnActiveGreen: {
    backgroundColor: '#EAFBF0',
    borderColor: COLORS.DARK_GREEN,
  },
  dirText: {
    fontSize: rf(11.5),
    fontWeight: '900',
    color: COLORS.MUTED,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    height: 66,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  methodBtnActive: {
    backgroundColor: '#EAFBF0',
    borderColor: COLORS.DARK_GREEN,
  },
  methodText: {
    fontSize: rf(10.5),
    fontWeight: '900',
    color: COLORS.MUTED,
  },
  saveBtn: {
    marginTop: 22,
    height: 54,
    borderRadius: 12,
    backgroundColor: COLORS.DARK_GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.DARK_GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },
  saveText: {
    fontSize: rf(13.5),
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
