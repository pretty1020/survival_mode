import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface BudgetSurvivorLogoProps {
  size?: number;
  showGlow?: boolean;
}

export function BudgetSurvivorLogo({ size = 100, showGlow = true }: BudgetSurvivorLogoProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2200 }), -1, true);
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: showGlow ? interpolate(pulse.value, [0, 1], [0.3, 0.7]) : 0,
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.15]) }],
  }));

  return (
    <View style={[styles.container, { width: size * 1.5, height: size * 1.5 }]}>
      {showGlow && (
        <Animated.View
          style={[
            styles.glow,
            glowStyle,
            {
              width: size * 1.5,
              height: size * 1.5,
              borderRadius: size * 0.75,
            },
          ]}
        />
      )}
      <View style={[styles.logoInner, { width: size, height: size }]}>
        <Text style={[styles.emoji, { fontSize: size * 0.55 }]}>👛</Text>
        <View style={styles.fireOverlay}>
          <Text style={[styles.fireEmoji, { fontSize: size * 0.35 }]}>🔥</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: '#f97316',
  },
  logoInner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249,115,22,0.2)',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: 'rgba(251,191,36,0.5)',
  },
  emoji: {
    textAlign: 'center',
  },
  fireOverlay: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  fireEmoji: {},
});
