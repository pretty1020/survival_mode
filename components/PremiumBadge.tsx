import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumBadgeProps {
  size?: 'small' | 'medium';
}

export function PremiumBadge({ size = 'small' }: PremiumBadgeProps) {
  return (
    <LinearGradient
      colors={['#a16207', '#ca8a04', '#eab308']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.badge, size === 'medium' && styles.badgeMedium]}
    >
      <Text style={[styles.text, size === 'medium' && styles.textMedium]}>✦ PRO</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textMedium: {
    fontSize: 12,
  },
});
