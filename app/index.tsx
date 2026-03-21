import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { BudgetSurvivorLogo } from '@/components/BudgetSurvivorLogo';
import { useApp } from '@/context/AppContext';
import { revenuecatService } from '@/services/revenuecatService';

export default function LandingScreen() {
  const router = useRouter();
  const { refreshPremium, refreshUserData } = useApp();
  const logoOpacity = useSharedValue(1);
  const logoY = useSharedValue(0);
  const headlineOpacity = useSharedValue(1);
  const headlineY = useSharedValue(0);
  const subOpacity = useSharedValue(1);
  const subY = useSharedValue(0);
  const buttonsOpacity = useSharedValue(1);
  const buttonsY = useSharedValue(0);
  const [restoring, setRestoring] = React.useState(false);


  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }));

  const headlineStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
    transform: [{ translateY: headlineY.value }],
  }));

  const subStyle = useAnimatedStyle(() => ({
    opacity: subOpacity.value,
    transform: [{ translateY: subY.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsY.value }],
  }));

  const handleStartSurviving = () => {
    router.replace('/home');
  };

  const handleRestorePurchases = async () => {
    setRestoring(true);
    const result = await revenuecatService.restorePurchases();
    setRestoring(false);
    if (result.success && result.isPremium) {
      await refreshPremium();
      await refreshUserData();
      Alert.alert('Restored!', 'Your Lifetime Access has been restored.');
      router.replace('/home');
    } else if (result.success && !result.isPremium) {
      Alert.alert('No Purchase Found', "We couldn't find a previous purchase for this account.");
    } else {
      Alert.alert('Restore Failed', result.error ?? 'Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#0a0a0f', '#0f172a', '#1e1b4b', '#312e81']}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.logoSection, logoStyle]}>
          <BudgetSurvivorLogo size={110} showGlow={true} />
        </Animated.View>

        <Animated.View style={[styles.headlineSection, headlineStyle]}>
          <Text style={styles.headline}>💀 Can You Survive Your Daily Budget?</Text>
        </Animated.View>

        <Animated.View style={[styles.subSection, subStyle]}>
          <Text style={styles.subheadline}>
            Turn your spending into a survival game—track expenses, beat challenges, and see how long you last.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonsSection, buttonsStyle]}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={handleStartSurviving}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>Start Surviving</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.paymentButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/paywall')}
          >
            <Text style={styles.paymentButtonText}>✨ Unlock Lifetime — ₱89</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={handleRestorePurchases}
            disabled={restoring}
          >
            {restoring ? (
              <ActivityIndicator color="rgba(255,255,255,0.9)" size="small" />
            ) : (
              <Text style={styles.secondaryButtonText}>Restore Purchases</Text>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  logoSection: {
    marginBottom: 32,
  },
  headlineSection: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  headline: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 34,
  },
  subSection: {
    marginBottom: 40,
    paddingHorizontal: 12,
  },
  subheadline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsSection: {
    width: '100%',
    maxWidth: 320,
    gap: 14,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  paymentButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(234,179,8,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.5)',
  },
  paymentButtonText: {
    color: '#fde047',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
