import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export function UpgradeCard() {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.push('/paywall')}>
      <LinearGradient
        colors={['#1e3a5f', '#0f172a', '#1e293b']}
        style={styles.card}
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>✨</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Unlock Lifetime Access</Text>
            <Text style={styles.price}>₱89 one-time • No subscription</Text>
            <Text style={styles.subtitle}>
              Unlimited history, premium events, full stats & more
            </Text>
          </View>
        </View>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Upgrade Now</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.3)',
    marginVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 36,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  price: {
    color: '#fde047',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  cta: {
    backgroundColor: 'rgba(234,179,8,0.3)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fde047',
    fontSize: 16,
    fontWeight: '700',
  },
});
