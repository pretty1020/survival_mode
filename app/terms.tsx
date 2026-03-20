import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TermsScreen() {
  return (
    <LinearGradient colors={['#0a0a0f', '#0f172a']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <Text style={styles.updated}>Last updated: March 2025</Text>
        <Text style={styles.paragraph}>
          Welcome to Survival Mode Budget Challenge. By using this app, you agree to these terms.
        </Text>
        <Text style={styles.heading}>1. Acceptance</Text>
        <Text style={styles.paragraph}>
          By accessing or using the app, you agree to be bound by these Terms and Conditions.
        </Text>
        <Text style={styles.heading}>2. Service Description</Text>
        <Text style={styles.paragraph}>
          Survival Mode Budget Challenge is a budgeting and expense tracking app that helps users manage daily finances through a gamified experience.
        </Text>
        <Text style={styles.heading}>3. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          You are responsible for the accuracy of data you enter. The app is for personal use only.
        </Text>
        <Text style={styles.heading}>4. Purchases</Text>
        <Text style={styles.paragraph}>
          Lifetime Access is a one-time purchase. Refunds are subject to the policies of the platform (Google Play / App Store).
        </Text>
        <Text style={styles.heading}>5. Disclaimer</Text>
        <Text style={styles.paragraph}>
          The app is provided "as is" without warranties. We are not responsible for financial decisions you make based on the app.
        </Text>
        <Text style={styles.paragraph}>
          For full terms, visit: https://github.com/pretty1020/survival_mode
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
