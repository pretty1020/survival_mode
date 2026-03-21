import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Expense } from '@/types';

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

const formatTime = (timestamp: number) => {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
};

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const showActions = onEdit || onDelete;

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Text style={styles.emoji}>{expense.emoji || '💰'}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.category}>{expense.category}</Text>
        {expense.note ? (
          <Text style={styles.note} numberOfLines={2}>{expense.note}</Text>
        ) : null}
        <Text style={styles.time}>{formatTime(expense.timestamp)}</Text>
      </View>
      <View style={styles.amountWrap}>
        <Text style={styles.amount} numberOfLines={1}>-₱{expense.amount}</Text>
        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <Pressable style={styles.actionBtn} onPress={() => onEdit(expense)}>
                <Text style={styles.actionText}>✏️</Text>
              </Pressable>
            )}
            {onDelete && (
              <Pressable style={styles.actionBtn} onPress={() => onDelete(expense)}>
                <Text style={styles.actionText}>🗑️</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
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
    minWidth: 0,
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
  amountWrap: {
    flexShrink: 0,
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  amount: {
    color: '#f87171',
    fontSize: 18,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    padding: 6,
  },
  actionText: {
    fontSize: 18,
  },
});
