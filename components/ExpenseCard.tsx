import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Expense } from '@/types';

interface ExpenseCardProps {
  expense: Expense;
}

const formatTime = (timestamp: number) => {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
};

export function ExpenseCard({ expense }: ExpenseCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Text style={styles.emoji}>{expense.emoji || '💰'}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.category}>{expense.category}</Text>
        <Text style={styles.note} numberOfLines={1}>
          {expense.note || 'Expense'}
        </Text>
        <Text style={styles.time}>{formatTime(expense.timestamp)}</Text>
      </View>
      <Text style={styles.amount}>-₱{expense.amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  category: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 2,
  },
  time: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 4,
  },
  amount: {
    color: '#f87171',
    fontSize: 18,
    fontWeight: '700',
  },
});
