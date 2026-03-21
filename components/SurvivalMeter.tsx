import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SurvivalStatus } from '@/types';

interface SurvivalMeterProps {
  status: SurvivalStatus;
  size?: 'small' | 'medium' | 'large';
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function SurvivalMeter({ status, size = 'large' }: SurvivalMeterProps) {
  const progress = useSharedValue(status.percentRemaining / 100);
  const pulse = useSharedValue(1);

  useEffect(() => {
    progress.value = withSpring(status.percentRemaining / 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [status.percentRemaining]);

  useEffect(() => {
    if (status.status === 'critical' || status.status === 'danger') {
      pulse.value = withTiming(1.02, { duration: 500 }, () => {
        pulse.value = withTiming(1, { duration: 500 });
      });
    }
  }, [status.status]);

  const height = size === 'small' ? 12 : size === 'medium' ? 20 : 32;

  const fillStyle = useAnimatedStyle(() => {
    const colors = {
      safe: ['#22c55e', '#16a34a'],
      warning: ['#eab308', '#ca8a04'],
      danger: ['#f97316', '#ea580c'],
      critical: ['#ef4444', '#dc2626'],
    };
    return {
      width: `${Math.max(0, Math.min(100, progress.value * 100))}%`,
    };
  });

  const barColors =
    status.status === 'safe'
      ? ['#22c55e', '#16a34a']
      : status.status === 'warning'
      ? ['#eab308', '#ca8a04']
      : status.status === 'danger'
      ? ['#f97316', '#ea580c']
      : ['#ef4444', '#dc2626'];

  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.track, { height }]}>
        <LinearGradient
          colors={barColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${Math.max(0, Math.min(100, status.percentRemaining))}%`, height }]}
        />
      </View>
      <Text style={[styles.label, size === 'small' && styles.labelSmall]}>
        {Math.round(status.percentRemaining)}% budget left
      </Text>
      <View style={styles.messageContainer}>
        <Text style={[styles.message, size === 'small' && styles.messageSmall]}>{status.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: {
    borderRadius: 16,
    minWidth: 4,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  labelSmall: {
    fontSize: 12,
  },
  messageContainer: {
    marginTop: 6,
    marginBottom: 20,
    minHeight: 36,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  message: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 20,
  },
  messageSmall: {
    fontSize: 11,
    lineHeight: 16,
  },
});
