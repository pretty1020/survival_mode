import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import { revenuecatService } from '@/services/revenuecatService';

const FEATURES = [
  { emoji: '📊', text: 'Unlimited history', free: '7 days', premium: 'Unlimited' },
  { emoji: '⚡', text: 'Random events', free: 'Limited', premium: 'Unlimited' },
  { emoji: '📈', text: 'Advanced charts', free: 'Basic', premium: 'Full insights' },
  { emoji: '🎨', text: 'Premium themes', free: '—', premium: '✓' },
  { emoji: '🏆', text: 'Streak analytics', free: 'Basic', premium: 'Full stats' },
  { emoji: '📤', text: 'Share templates', free: 'Basic', premium: 'Extra styles' },
  { emoji: '🎮', text: 'Challenge modes', free: 'Limited', premium: 'All modes' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { refreshUserData, refreshPremium, isPremium } = useApp();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    const result = await revenuecatService.purchaseLifetime();
    setLoading(false);

    if (result.success) {
      await refreshPremium();
      await refreshUserData();
      router.back();
    } else if (result.error === 'cancelled') {
      // User cancelled, do nothing
    } else {
      Alert.alert('Purchase Failed', result.error ?? 'Something went wrong. Please try again.');
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const result = await revenuecatService.restorePurchases();
    setRestoring(false);

    if (result.success && result.isPremium) {
      await refreshPremium();
      await refreshUserData();
      Alert.alert('Restored!', 'Your Lifetime Access has been restored.');
      router.back();
    } else if (result.success && !result.isPremium) {
      Alert.alert('No Purchase Found', 'We couldn\'t find a previous purchase for this account.');
    } else {
      Alert.alert('Restore Failed', result.error ?? 'Please try again.');
    }
  };

  if (isPremium) {
    return (
      <LinearGradient colors={['#0a0a0f', '#0f172a']} style={styles.gradient}>
      <View style={styles.premiumContainer}>
        <Text style={styles.premiumText}>You already have Lifetime Access! ✨</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a0a0f', '#0f172a', '#1e1b4b']} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.title}>Unlock Lifetime Access</Text>
          <Text style={styles.subtitle}>
            One-time payment. No subscription. Forever.
          </Text>
        </View>

        <View style={styles.priceCard}>
          <LinearGradient
            colors={['#1e3a5f', '#0f172a']}
            style={styles.priceGradient}
          >
            <Text style={styles.price}>₱89</Text>
            <Text style={styles.priceLabel}>One-time • Lifetime unlock</Text>
            <Text style={styles.priceNote}>Never pay again. Unlock everything forever.</Text>
          </LinearGradient>
        </View>

        <View style={styles.comparison}>
          <Text style={styles.comparisonTitle}>Free vs Lifetime</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.comparisonRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
              <Text style={styles.freeCol}>{f.free}</Text>
              <Text style={styles.premiumCol}>{f.premium}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={[styles.buyButton, loading && styles.buttonDisabled]}
          onPress={handlePurchase}
          disabled={loading}
        >
          <LinearGradient
            colors={['#22c55e', '#16a34a']}
            style={styles.buyGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buyText}>Unlock Lifetime — ₱89</Text>
            )}
          </LinearGradient>
        </Pressable>

        <Pressable
          style={[styles.restoreButton, restoring && styles.buttonDisabled]}
          onPress={handleRestore}
          disabled={restoring}
        >
          {restoring ? (
            <ActivityIndicator color="rgba(255,255,255,0.8)" size="small" />
          ) : (
            <Text style={styles.restoreText}>Restore Purchases</Text>
          )}
        </Pressable>

        <Pressable style={styles.continueFree} onPress={() => router.back()}>
          <Text style={styles.continueFreeText}>Continue with Free</Text>
        </Pressable>

        <View style={styles.legalLinks}>
          <Pressable onPress={() => router.push('/terms')}>
            <Text style={styles.legalLink}>Terms & Conditions</Text>
          </Pressable>
          <Text style={styles.legalDivider}>•</Text>
          <Pressable onPress={() => router.push('/privacy')}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  premiumContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  premiumText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  priceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 28,
    borderWidth: 2,
    borderColor: 'rgba(234,179,8,0.4)',
  },
  priceGradient: {
    padding: 24,
    alignItems: 'center',
  },
  price: {
    color: '#fde047',
    fontSize: 42,
    fontWeight: '800',
  },
  priceLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginTop: 4,
  },
  priceNote: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 8,
  },
  comparison: {
    marginBottom: 28,
  },
  comparisonTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  featureEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  freeCol: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    width: 70,
    textAlign: 'right',
  },
  premiumCol: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '600',
    width: 80,
    textAlign: 'right',
  },
  buyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buyGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
  },
  buyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  restoreButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  restoreText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  continueFree: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueFreeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  legalLink: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  legalDivider: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
});
