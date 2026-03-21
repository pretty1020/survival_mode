import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import { SurvivalMeter } from '@/components/SurvivalMeter';
import { BudgetPeriodToggle } from '@/components/BudgetPeriodToggle';
import { ExpenseCard } from '@/components/ExpenseCard';
import { UpgradeCard } from '@/components/UpgradeCard';
import { PremiumBadge } from '@/components/PremiumBadge';
import { budgetService } from '@/services/budgetService';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { BudgetPeriod } from '@/types';

const chartConfig = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: 'transparent',
  backgroundGradientTo: 'transparent',
  color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
  labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 0,
};

export default function SurvivalDashboardScreen() {
  const router = useRouter();
  const { userData, isPremium, setUserData } = useApp();

  const handleEditExpense = (expense: import('@/types').Expense) => {
    router.push(`/edit-expense/${expense.id}`);
  };

  const handleDeleteExpense = (expense: import('@/types').Expense) => {
    Alert.alert('Delete Expense', `Remove ₱${expense.amount} (${expense.category})?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!userData) return;
          const newData = await budgetService.deleteExpense(userData, expense.id);
          setUserData(newData);
        },
      },
    ]);
  };

  if (!userData) return null;

  const period = userData.budgetSettings.budgetPeriod;
  const handlePeriodChange = async (p: BudgetPeriod) => {
    const newData = await budgetService.updateBudgetPeriod(userData, p);
    setUserData(newData);
  };

  const budget = period === 'daily' ? userData.budgetSettings.dailyBudget
    : period === 'weekly' ? userData.budgetSettings.weeklyBudget
    : userData.budgetSettings.monthlyBudget;
  const status = budgetService.getSurvivalStatus(userData, period);
  const totalExpenses = budgetService.getTotalExpenses(userData, period);
  const remaining = Math.max(0, budget - budgetService.getTotalSpent(userData, period));
  const periodExpenses = budgetService.getExpensesForPeriod(userData, period);
  const historyLimit = budgetService.getHistoryLimit(isPremium);

  const categoryTotals: Record<string, number> = {};
  periodExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const chartData = Object.entries(categoryTotals).map(([name, amount], i) => ({
    name,
    population: amount,
    color: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'][i % 7],
    legendFontColor: '#fff',
    legendFontSize: 12,
  }));

  const getInsight = () => {
    const pct = budget > 0 ? Math.max(0, (totalExpenses / budget) * 100) : 0;
    if (pct <= 0) return "You haven't spent anything yet. Legendary restraint! 💪";
    if (pct < 50) return "You're under 50% budget. Tipid warrior energy! ⚔️";
    if (pct < 80) return "Solid spending. Still in the safe zone. Keep it up!";
    if (pct < 100) return "Budget getting tight. Every peso counts now. 🎯";
    return "Budget exceeded. Tomorrow is a new day to survive! 😮‍💨";
  };

  const stats = isPremium ? budgetService.getPremiumStats(userData) : null;

  return (
    <LinearGradient colors={['#0a0a0f', '#0f172a', '#1e1b4b']} style={styles.gradient}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BudgetPeriodToggle value={period} onChange={handlePeriodChange} />
        <View style={styles.meterSection}>
          <SurvivalMeter status={status} size="large" />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₱{budget}</Text>
            <Text style={styles.statLabel}>{period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly'} Budget</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, styles.spentValue]}>₱{totalExpenses}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, styles.remainingValue]}>₱{remaining}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>

        <View style={styles.streakSection}>
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakValue}>{userData.currentStreak}</Text>
            <Text style={styles.streakLabel}>Current Streak</Text>
          </View>
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>🏆</Text>
            <Text style={styles.streakValue}>{userData.bestStreak}</Text>
            <Text style={styles.streakLabel}>Best Streak</Text>
          </View>
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>📅</Text>
            <Text style={styles.streakValue}>{userData.daysSurvived}</Text>
            <Text style={styles.streakLabel}>Days Survived</Text>
          </View>
        </View>

        {chartData.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={chartData}
                width={Dimensions.get('window').width - 80}
                height={180}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="20"
                absolute
              />
            </View>
          </View>
        )}

        <View style={styles.insightSection}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightTitle}>💡 Budget Insight</Text>
            {isPremium && <PremiumBadge size="small" />}
          </View>
          <Text style={styles.insightText}>{getInsight()}</Text>
          {!isPremium && (
            <Text style={styles.insightUpgrade}>
              Unlock smart tips & premium stats with Lifetime Access
            </Text>
          )}
        </View>

        {isPremium && stats && (
          <View style={styles.statsSection}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>📊 Premium Statistics</Text>
              <PremiumBadge size="small" />
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Best Streak</Text>
              <Text style={styles.statValue}>{stats.streakHistory.best} days</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Days Survived</Text>
              <Text style={styles.statValue}>{stats.streakHistory.daysSurvived}</Text>
            </View>
            {stats.worstPeriod && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Highest Spend Day</Text>
                <Text style={styles.statValue}>₱{stats.worstPeriod.amount}</Text>
              </View>
            )}
            {stats.bestPeriod && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Lowest Spend Day</Text>
                <Text style={styles.statValue}>₱{stats.bestPeriod.amount}</Text>
              </View>
            )}
            {Object.keys(stats.categoryBreakdown).length > 0 && (
              <View style={styles.categoryBreakdown}>
                <Text style={styles.breakdownTitle}>Category Breakdown (All Time)</Text>
                {Object.entries(stats.categoryBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([name, amt]) => (
                    <View key={name} style={styles.breakdownRow}>
                      <Text style={styles.breakdownName}>{name}</Text>
                      <Text style={styles.breakdownAmount}>₱{amt}</Text>
                    </View>
                  ))}
              </View>
            )}
          </View>
        )}

        {!isPremium && <UpgradeCard />}

        <View style={styles.expensesSection}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          {periodExpenses.length === 0 ? (
            <Text style={styles.emptyText}>No expenses in this period. Living the dream! ✨</Text>
          ) : (
            periodExpenses
              .slice(0, historyLimit === Infinity ? 20 : historyLimit)
              .map((e) => <ExpenseCard key={e.id} expense={e} onEdit={handleEditExpense} onDelete={handleDeleteExpense} />)
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  meterSection: { marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 20 },
  statBox: {
    flex: 1,
    minWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  spentValue: { color: '#f87171' },
  remainingValue: { color: '#4ade80' },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4 },
  streakSection: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  streakCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  streakEmoji: { fontSize: 24, marginBottom: 4 },
  streakValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  streakLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
  chartSection: { marginBottom: 24 },
  sectionTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  chartContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  insightSection: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  insightTitle: { color: '#a78bfa', fontSize: 15, fontWeight: '700' },
  insightText: { color: '#fff', fontSize: 14, lineHeight: 22 },
  insightUpgrade: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 10 },
  statsSection: {
    backgroundColor: 'rgba(234,179,8,0.1)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.3)',
  },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  statsTitle: { color: '#fde047', fontSize: 16, fontWeight: '700' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  expensesSection: { marginTop: 8 },
  emptyText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontStyle: 'italic' },
  categoryBreakdown: { marginTop: 16 },
  breakdownTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 12 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  breakdownName: { color: '#fff', fontSize: 14 },
  breakdownAmount: { color: '#fde047', fontSize: 14, fontWeight: '600' },
});
