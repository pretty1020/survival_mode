import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { FinancialEvent } from '@/types';

const { width } = Dimensions.get('window');

interface EventPopupProps {
  visible: boolean;
  event: FinancialEvent | null;
  onClose: () => void;
}

export function EventPopup({ visible, event, onClose }: EventPopupProps) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible && event) {
      scale.value = withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1)
      );
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0.5);
      opacity.value = withTiming(0);
    }
  }, [visible, event]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!event) return null;

  const isPositive = event.impact > 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={
                isPositive
                  ? ['#166534', '#15803d', '#16a34a']
                  : ['#7f1d1d', '#991b1b', '#b91c1c']
              }
              style={styles.card}
            >
              <Text style={styles.emoji}>{event.emoji}</Text>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.description}>{event.description}</Text>
              <View
                style={[
                  styles.impactBadge,
                  isPositive ? styles.impactPositive : styles.impactNegative,
                ]}
              >
                <Text
                  style={[
                    styles.impactText,
                    isPositive ? styles.impactTextPositive : styles.impactTextNegative,
                  ]}
                >
                  {isPositive ? '+' : ''}₱{Math.abs(event.impact)}
                </Text>
              </View>
              {event.isPremium && (
                <View style={styles.premiumTag}>
                  <Text style={styles.premiumTagText}>PREMIUM EVENT</Text>
                </View>
              )}
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Got it!</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: width - 48,
    maxWidth: 340,
  },
  card: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  impactBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  impactPositive: {
    backgroundColor: 'rgba(34,197,94,0.4)',
  },
  impactNegative: {
    backgroundColor: 'rgba(239,68,68,0.4)',
  },
  impactText: {
    fontSize: 24,
    fontWeight: '800',
  },
  impactTextPositive: {
    color: '#86efac',
  },
  impactTextNegative: {
    color: '#fca5a5',
  },
  premiumTag: {
    backgroundColor: 'rgba(234,179,8,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  premiumTagText: {
    color: '#fde047',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
