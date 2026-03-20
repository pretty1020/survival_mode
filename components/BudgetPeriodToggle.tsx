import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BudgetPeriod } from '@/types';

interface BudgetPeriodToggleProps {
  value: BudgetPeriod;
  onChange: (period: BudgetPeriod) => void;
}

export function BudgetPeriodToggle({ value, onChange }: BudgetPeriodToggleProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, value === 'daily' && styles.tabActive]}
        onPress={() => onChange('daily')}
      >
        <Text style={[styles.tabText, value === 'daily' && styles.tabTextActive]}>
          Daily
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tab, value === 'weekly' && styles.tabActive]}
        onPress={() => onChange('weekly')}
      >
        <Text style={[styles.tabText, value === 'weekly' && styles.tabTextActive]}>
          Weekly
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tab, value === 'monthly' && styles.tabActive]}
        onPress={() => onChange('monthly')}
      >
        <Text style={[styles.tabText, value === 'monthly' && styles.tabTextActive]}>
          Monthly
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(59,130,246,0.4)',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
