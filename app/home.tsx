import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput, Modal, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { SurvivalMeter } from '@/components/SurvivalMeter';
import { BudgetPeriodToggle } from '@/components/BudgetPeriodToggle';
import { UpgradeCard } from '@/components/UpgradeCard';
import { BudgetSurvivorLogo } from '@/components/BudgetSurvivorLogo';
import { budgetService } from '@/services/budgetService';
import { BudgetPeriod } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { userData, isPremium, isLoading, setUserData } = useApp();
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [editBudget, setEditBudget] = useState('500');
  const isNarrow = width < 380;

  if (isLoading || !userData) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading your survival stats...</Text>
      </View>
    );
  }

  const budgetPeriod = userData.budgetSettings.budgetPeriod;

  const handlePeriodChange = async (period: BudgetPeriod) => {
    const newData = await budgetService.updateBudgetPeriod(userData, period);
    setUserData(newData);
  };

  const budget = budgetPeriod === 'daily' ? userData.budgetSettings.dailyBudget
    : budgetPeriod === 'weekly' ? userData.budgetSettings.weeklyBudget
    : userData.budgetSettings.monthlyBudget;
  const status = budgetService.getSurvivalStatus(userData, budgetPeriod);
  const totalSpent = budgetService.getTotalSpent(userData, budgetPeriod);
  const remaining = Math.max(0, budget - totalSpent);
  const periodExpenses = budgetService.getExpensesForPeriod(userData, budgetPeriod);
  const latestEvent = userData.events.find((e) => e.dateKey === new Date().toISOString().split('T')[0]);
  const dailyChallenge = userData.challenges[0];

  const handleSaveBudget = async () => {
    const num = parseInt(editBudget, 10);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid', 'Please enter a valid budget amount');
      return;
    }
    const newData = await budgetService.updateBudget(userData, budgetPeriod, num);
    setUserData(newData);
    setBudgetModalVisible(false);
  };

  const openBudgetModal = () => {
    const amt = budgetPeriod === 'daily' ? userData.budgetSettings.dailyBudget
      : budgetPeriod === 'weekly' ? userData.budgetSettings.weeklyBudget
      : userData.budgetSettings.monthlyBudget;
    setEditBudget(String(amt));
    setBudgetModalVisible(true);
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#0f172a', '#1e1b4b']} style={styles.gradient}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <BudgetSurvivorLogo size={48} showGlow={false} />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Budget Survivor</Text>
            <Text style={styles.tagline}>Can you survive the day? 💀</Text>
          </View>
        </View>

        <BudgetPeriodToggle value={budgetPeriod} onChange={handlePeriodChange} />

        <View style={styles.meterSection}>
          <SurvivalMeter status={status} size="large" />
        </View>

        <View style={[styles.quickStats, isNarrow && styles.quickStatsNarrow]}>
          <Pressable style={[styles.statCard, isNarrow && styles.statCardNarrow]} onPress={openBudgetModal}>
            <View style={styles.statCardContent}>
              <Text style={[styles.statValue, isNarrow && styles.statValueNarrow]} numberOfLines={1} adjustsFontSizeToFit>
                ₱{remaining}
              </Text>
              <Text style={[styles.statLabel, isNarrow && styles.statLabelNarrow]} numberOfLines={1}>Budget Left</Text>
              <Text style={[styles.statHint, isNarrow && styles.statHintNarrow]} numberOfLines={1}>Tap to edit</Text>
            </View>
          </Pressable>
          {budgetPeriod !== 'daily' && (
            <View style={[styles.statCard, isNarrow && styles.statCardNarrow]}>
              <View style={styles.statCardContent}>
                <Text style={[styles.statValue, isNarrow && styles.statValueNarrow]} numberOfLines={1} adjustsFontSizeToFit>
                  {userData.daysSurvived}
                </Text>
                <Text style={[styles.statLabel, isNarrow && styles.statLabelNarrow]} numberOfLines={1}>Days Survived</Text>
              </View>
            </View>
          )}
          <View style={[styles.statCard, isNarrow && styles.statCardNarrow]}>
            <View style={styles.statCardContent}>
              <Text style={[styles.statValue, isNarrow && styles.statValueNarrow]} numberOfLines={1} adjustsFontSizeToFit>
                🔥 {userData.currentStreak}
              </Text>
              <Text style={[styles.statLabel, isNarrow && styles.statLabelNarrow]} numberOfLines={1}>Streak</Text>
            </View>
          </View>
        </View>

        {dailyChallenge && (
          <View style={styles.challengeBanner}>
            <Text style={styles.challengeEmoji}>{dailyChallenge.emoji}</Text>
            <View style={styles.challengeText}>
              <Text style={styles.challengeTitle}>Today's Challenge</Text>
              <Text style={styles.challengeDesc} numberOfLines={2}>{dailyChallenge.title}: {dailyChallenge.description}</Text>
            </View>
          </View>
        )}

        <View style={styles.ctaGrid}>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/add-expense')}>
            <Text style={styles.ctaEmoji}>➕</Text>
            <Text style={styles.ctaLabel}>Add Expense</Text>
          </Pressable>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/dashboard')}>
            <Text style={styles.ctaEmoji}>📊</Text>
            <Text style={styles.ctaLabel}>Dashboard</Text>
          </Pressable>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/expenses')}>
            <Text style={styles.ctaEmoji}>📋</Text>
            <Text style={styles.ctaLabel}>Expenses</Text>
          </Pressable>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/calendar')}>
            <Text style={styles.ctaEmoji}>📅</Text>
            <Text style={styles.ctaLabel}>Calendar</Text>
          </Pressable>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/events')}>
            <Text style={styles.ctaEmoji}>⚡</Text>
            <Text style={styles.ctaLabel}>Events</Text>
          </Pressable>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/results')}>
            <Text style={styles.ctaEmoji}>🏆</Text>
            <Text style={styles.ctaLabel}>Results</Text>
          </Pressable>
          <Pressable style={styles.ctaButton} onPress={() => router.push('/settings')}>
            <Text style={styles.ctaEmoji}>⚙️</Text>
            <Text style={styles.ctaLabel}>Settings</Text>
          </Pressable>
        </View>

        {latestEvent && (
          <View style={styles.latestEvent}>
            <Text style={styles.latestEventTitle}>Latest Event</Text>
            <View style={styles.latestEventCard}>
              <Text style={styles.latestEventEmoji}>{latestEvent.emoji}</Text>
              <View style={styles.latestEventContent}>
                <Text style={styles.latestEventName} numberOfLines={1}>{latestEvent.title}</Text>
                <Text style={[styles.latestEventImpact, latestEvent.impact > 0 ? styles.impactPos : styles.impactNeg]}>
                  {latestEvent.impact > 0 ? '+' : ''}₱{latestEvent.impact}
                </Text>
              </View>
            </View>
          </View>
        )}

        {!isPremium && <UpgradeCard />}

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>
            {budgetPeriod === 'daily' ? "Today's" : budgetPeriod === 'weekly' ? "This Week's" : "This Month's"} Expenses
          </Text>
          {periodExpenses.length === 0 ? (
            <Text style={styles.emptyText}>No expenses yet. You're crushing it! 🎉</Text>
          ) : (
            periodExpenses.slice(0, 3).map((e) => (
              <View key={e.id} style={styles.miniExpense}>
                <Text style={styles.miniEmoji}>{e.emoji || '💰'}</Text>
                <View style={styles.miniTextWrap}>
                  <Text style={styles.miniCategory} numberOfLines={1}>{e.category}</Text>
                  {e.note ? <Text style={styles.miniNote} numberOfLines={1}>{e.note}</Text> : null}
                </View>
                <Text style={styles.miniAmount}>-₱{e.amount}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={budgetModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setBudgetModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              Set {budgetPeriod === 'daily' ? 'Daily' : budgetPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Budget (₱)
            </Text>
            <TextInput
              style={styles.modalInput}
              value={editBudget}
              onChangeText={setEditBudget}
              keyboardType="numeric"
              placeholder="500"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancel} onPress={() => setBudgetModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={handleSaveBudget}>
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' },
  loadingText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 14,
  },
  headerText: { flex: 1 },
  greeting: { color: '#fff', fontSize: 24, fontWeight: '800' },
  tagline: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
  meterSection: { marginBottom: 0 },
  quickStats: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 20 },
  quickStatsNarrow: { gap: 6 },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  statCardNarrow: { minWidth: 0, padding: 8, paddingVertical: 10 },
  statCardContent: {
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center', width: '100%' },
  statValueNarrow: { fontSize: 14 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4, textAlign: 'center', width: '100%' },
  statLabelNarrow: { fontSize: 10, marginTop: 2 },
  statHint: { color: 'rgba(255,255,255,0.4)', fontSize: 9, marginTop: 2, textAlign: 'center', width: '100%' },
  statHintNarrow: { fontSize: 8, marginTop: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#1e293b', borderRadius: 20, padding: 24, width: '100%', maxWidth: 320 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, fontSize: 18, color: '#fff', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  modalCancelText: { color: '#fff', fontSize: 16 },
  modalSave: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#22c55e' },
  modalSaveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  challengeBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  challengeEmoji: { fontSize: 32, marginRight: 14 },
  challengeText: { flex: 1, minWidth: 0 },
  challengeTitle: { color: '#a78bfa', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  challengeDesc: { color: '#fff', fontSize: 14 },
  ctaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  ctaButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  ctaEmoji: { fontSize: 28, marginBottom: 8 },
  ctaLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  latestEvent: { marginBottom: 20 },
  latestEventTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 8 },
  latestEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  latestEventEmoji: { fontSize: 32, marginRight: 14 },
  latestEventContent: { flex: 1, minWidth: 0 },
  latestEventName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  latestEventImpact: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  impactPos: { color: '#4ade80' },
  impactNeg: { color: '#f87171' },
  recentSection: { marginTop: 8 },
  sectionTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 12 },
  emptyText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontStyle: 'italic' },
  miniExpense: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  miniEmoji: { fontSize: 20, marginRight: 12 },
  miniTextWrap: { flex: 1, minWidth: 0 },
  miniCategory: { color: '#fff', fontSize: 14, fontWeight: '600' },
  miniNote: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  miniAmount: { color: '#f87171', fontSize: 14, fontWeight: '600', marginLeft: 8, flexShrink: 0 },
});
