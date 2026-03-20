import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import { revenuecatService } from '@/services/revenuecatService';

export default function SettingsScreen() {
  const router = useRouter();
  const { isPremium, refreshPremium, refreshUserData } = useApp();
  const [restoring, setRestoring] = useState(false);
  const [rcStatus, setRcStatus] = useState<{ configured: boolean; isPremium: boolean } | null>(null);

  useEffect(() => {
    revenuecatService.getStatus().then(setRcStatus);
  }, [isPremium]);

  const handleRestore = async () => {
    setRestoring(true);
    const result = await revenuecatService.restorePurchases();
    setRestoring(false);
    if (result.success && result.isPremium) {
      await refreshPremium();
      await refreshUserData();
      Alert.alert('Restored!', 'Your Lifetime Access has been restored.');
    } else if (result.success && !result.isPremium) {
      Alert.alert('No Purchase Found', "We couldn't find a previous purchase for this account.");
    } else {
      Alert.alert('Restore Failed', result.error ?? 'Please try again.');
    }
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#0f172a']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RevenueCat Status</Text>
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>SDK Configured</Text>
            <Text style={[styles.statusValue, rcStatus?.configured ? styles.statusOk : styles.statusError]}>
              {rcStatus ? (rcStatus.configured ? '✓ Yes' : '✗ No (use dev build)') : '...'}
            </Text>
          </View>
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Premium Status</Text>
            <Text style={[styles.statusValue, rcStatus?.isPremium ? styles.statusOk : styles.statusNeutral]}>
              {rcStatus ? (rcStatus.isPremium ? '✓ Active' : 'Free') : '...'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purchases</Text>
          <Pressable
            style={[styles.row, restoring && styles.rowDisabled]}
            onPress={handleRestore}
            disabled={restoring}
          >
            <Text style={styles.rowText}>Restore Purchases</Text>
            {restoring ? (
              <ActivityIndicator color="#3b82f6" size="small" />
            ) : (
              <Text style={styles.rowArrow}>→</Text>
            )}
          </Pressable>
          {!isPremium && (
            <Pressable style={styles.row} onPress={() => router.push('/paywall')}>
              <Text style={styles.rowText}>Upgrade to Lifetime</Text>
              <Text style={styles.rowArrow}>→</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <Pressable style={styles.row} onPress={() => router.push('/terms')}>
            <Text style={styles.rowText}>Terms and Conditions</Text>
            <Text style={styles.rowArrow}>→</Text>
          </Pressable>
          <Pressable style={styles.row} onPress={() => router.push('/privacy')}>
            <Text style={styles.rowText}>Privacy Policy</Text>
            <Text style={styles.rowArrow}>→</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 32 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  rowDisabled: { opacity: 0.6 },
  rowText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  rowArrow: { color: 'rgba(255,255,255,0.5)', fontSize: 18 },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  statusValue: { fontSize: 14, fontWeight: '600' },
  statusOk: { color: '#4ade80' },
  statusError: { color: '#f87171' },
  statusNeutral: { color: 'rgba(255,255,255,0.7)' },
});
