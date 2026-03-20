import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import { ExpenseCard } from '@/components/ExpenseCard';
import { budgetService } from '@/services/budgetService';
import { Expense, ExpenseFilter } from '@/types';

const FILTERS: { key: ExpenseFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

const formatDate = (dateKey: string) => {
  const d = new Date(dateKey);
  return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function ExpensesScreen() {
  const { userData } = useApp();
  const [filter, setFilter] = useState<ExpenseFilter>('today');

  if (!userData) return null;

  const expenses = budgetService.getExpensesFiltered(userData, filter);
  const byDate = expenses.reduce<Record<string, Expense[]>>((acc, e) => {
    if (!acc[e.dateKey]) acc[e.dateKey] = [];
    acc[e.dateKey].push(e);
    return acc;
  }, {});
  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <LinearGradient colors={['#0a0a0f', '#0f172a', '#1e1b4b']} style={styles.gradient}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {sortedDates.length === 0 ? (
          <Text style={styles.emptyText}>No expenses in this period. Stay strong! 💪</Text>
        ) : (
          sortedDates.map((dateKey) => (
            <View key={dateKey} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{formatDate(dateKey)}</Text>
              {byDate[dateKey]
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((e) => (
                  <ExpenseCard key={e.id} expense={e} />
                ))}
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  filterRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  filterBtnActive: {
    backgroundColor: 'rgba(59,130,246,0.4)',
  },
  filterText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  dateGroup: { marginBottom: 24 },
  dateHeader: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
});
