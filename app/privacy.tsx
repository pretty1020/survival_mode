import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PrivacyScreen() {
  return (
    <LinearGradient colors={['#0a0a0f', '#0f172a']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: March 20, 2025</Text>
        <Text style={styles.paragraph}>
          Survival Mode Budget Challenge respects your privacy. This policy describes how we handle your data.
        </Text>
        <Text style={styles.heading}>1. Data We Collect</Text>
        <Text style={styles.paragraph}>
          We store budget and expense data you enter. Purchase status is verified via RevenueCat. We may use anonymous analytics to improve the app.
        </Text>
        <Text style={styles.heading}>2. How We Use Data</Text>
        <Text style={styles.paragraph}>
          Your data is used to provide the budgeting features, sync across devices (when Supabase is configured), and restore purchases.
        </Text>
        <Text style={styles.heading}>3. Data Storage</Text>
        <Text style={styles.paragraph}>
          Data may be stored locally on your device and optionally in Supabase when you use cloud sync.
        </Text>
        <Text style={styles.heading}>4. Third Parties</Text>
        <Text style={styles.paragraph}>
          We use RevenueCat for in-app purchases. Their privacy policy applies to purchase data. Supabase may be used for cloud storage.
        </Text>
        <Text style={styles.heading}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          You can delete your data by uninstalling the app. For Supabase users, contact support to request data deletion.
        </Text>
        <Text style={styles.paragraph}>
          For full policy, visit: https://github.com/pretty1020/survival_mode
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  updated: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 24 },
  heading: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  paragraph: { color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 24, marginBottom: 12 },
});
