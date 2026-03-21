import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/context/AppContext';
import { ExpenseCard } from '@/components/ExpenseCard';
import { UpgradeCard } from '@/components/UpgradeCard';
import { budgetService } from '@/services/budgetService';
import { Expense } from '@/types';

type CalendarView = 'daily' | 'weekly' | 'monthly';

const getDateKey = (d: Date) => d.toISOString().split('T')[0];
const getWeekKey = (d: Date) => {
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().split('T')[0];
};
const getMonthKey = (d: Date) => d.toISOString().slice(0, 7);

export default function CalendarScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { userData, isPremium, setUserData } = useApp();
  const [view, setView] = useState<CalendarView>('daily');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  if (!userData) return null;

  const trySetView = (v: CalendarView) => {
    if (v === 'weekly' || v === 'monthly') {
      if (!isPremium) {
        Alert.alert(
          'Premium Feature',
          'Weekly and Monthly calendar views are Premium only. Upgrade to unlock!',
          [{ text: 'OK' }, { text: 'Upgrade', onPress: () => router.push('/paywall') }]
        );
        return;
      }
    }
    setView(v);
  };

  const expensesForDate = (dateKey: string): Expense[] =>
    userData.expenses.filter((e) => e.dateKey === dateKey);

  const expensesForWeek = (weekStart: string): Expense[] => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return userData.expenses.filter((e) => {
      const d = new Date(e.dateKey);
      return d >= start && d <= end;
    });
  };

  const expensesForMonth = (monthKey: string): Expense[] =>
    userData.expenses.filter((e) => e.dateKey.startsWith(monthKey));

  const selectedDateKey = getDateKey(selectedDate);
  const selectedWeekKey = getWeekKey(selectedDate);
  const selectedMonthKey = getMonthKey(selectedDate);

  const displayExpenses =
    view === 'daily'
      ? expensesForDate(selectedDateKey)
      : view === 'weekly'
      ? expensesForWeek(selectedWeekKey)
      : expensesForMonth(selectedMonthKey);

  const displayTotal = displayExpenses.reduce((s, e) => s + e.amount, 0);

  const weekStart = useMemo(() => {
    const d = new Date(currentMonth);
    d.setDate(1);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }, [currentMonth.getFullYear(), currentMonth.getMonth()]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const days = last.getDate();
    const prevMonth = new Date(year, month, 0);
    const prevDays = prevMonth.getDate();
    const result: { date: Date; isCurrentMonth: boolean; dateKey: string }[] = [];
    for (let i = startPad - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevDays - i);
      result.push({ date: d, isCurrentMonth: false, dateKey: getDateKey(d) });
    }
    for (let i = 1; i <= days; i++) {
      const d = new Date(year, month, i);
      result.push({ date: d, isCurrentMonth: true, dateKey: getDateKey(d) });
    }
    const remaining = 42 - result.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      result.push({ date: d, isCurrentMonth: false, dateKey: getDateKey(d) });
    }
    return result;
  }, [currentMonth.getFullYear(), currentMonth.getMonth()]);

  const hasExpense = (dateKey: string) =>
    userData.expenses.some((e) => e.dateKey === dateKey);

  const dayCellSize = Math.min(44, Math.floor((width - 48) / 7) - 4);
  const gridGap = 4;

  return (
    <LinearGradient colors={['#0a0a0f', '#0f172a', '#1e1b4b']} style={styles.gradient}>
      <View style={styles.viewToggle}>
        {(['daily', 'weekly', 'monthly'] as const).map((v) => (
          <Pressable
            key={v}
            style={[styles.viewBtn, view === v && styles.viewBtnActive]}
            onPress={() => trySetView(v)}
          >
            <Text style={[styles.viewBtnText, view === v && styles.viewBtnTextActive]}>
              {v === 'daily' ? 'Daily' : v === 'weekly' ? 'Weekly' : 'Monthly'}
            </Text>
            {!isPremium && (v === 'weekly' || v === 'monthly') && (
              <Text style={styles.premiumBadge}>✨</Text>
            )}
          </Pressable>
        ))}
      </View>

      <View style={styles.monthNav}>
        <Pressable
          onPress={() => {
            const m = new Date(currentMonth);
            m.setMonth(m.getMonth() - 1);
            setCurrentMonth(m);
          }}
        >
          <Text style={styles.navBtn}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>
          {currentMonth.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
        </Text>
        <Pressable
          onPress={() => {
            const m = new Date(currentMonth);
            m.setMonth(m.getMonth() + 1);
            setCurrentMonth(m);
          }}
        >
          <Text style={styles.navBtn}>›</Text>
        </Pressable>
      </View>

      <View style={[styles.calendarRow, { gap: gridGap }]}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <Text key={d} style={[styles.weekday, { width: dayCellSize }]}>{d}</Text>
        ))}
      </View>
      <View style={[styles.calendarGrid, { gap: gridGap, width: 7 * dayCellSize + 6 * gridGap }]}>
        {daysInMonth.map(({ date, isCurrentMonth, dateKey }, i) => {
          const isSelected = getDateKey(selectedDate) === dateKey;
          const hasDot = hasExpense(dateKey);
          return (
            <Pressable
              key={i}
              style={[
                styles.dayCell,
                { width: dayCellSize, height: dayCellSize },
                !isCurrentMonth && styles.dayCellDimmed,
                isSelected && styles.dayCellSelected,
              ]}
              onPress={() => {
                setSelectedDate(date);
              }}
            >
              <Text
                style={[
                  styles.dayNum,
                  !isCurrentMonth && styles.dayNumDimmed,
                  isSelected && styles.dayNumSelected,
                ]}
              >
                {date.getDate()}
              </Text>
              {hasDot && <View style={styles.dot} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.selectedInfo}>
        <Text style={styles.selectedLabel}>
          {view === 'daily'
            ? selectedDate.toLocaleDateString('en-PH', { weekday: 'long', month: 'short', day: 'numeric' })
            : view === 'weekly'
            ? `Week of ${new Date(selectedWeekKey).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`
            : `${currentMonth.toLocaleDateString('en-PH', { month: 'long' })} — Total`}
        </Text>
        <Text style={styles.selectedTotal}>₱{displayTotal}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {displayExpenses.length === 0 ? (
          <Text style={styles.emptyText}>
            No expenses in this {view === 'daily' ? 'day' : view === 'weekly' ? 'week' : 'month'}.
          </Text>
        ) : (
          displayExpenses
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((e) => (
              <ExpenseCard
                key={e.id}
                expense={e}
                onEdit={(exp) => router.push(`/edit-expense/${exp.id}`)}
                onDelete={(exp) => {
                  Alert.alert('Delete Expense', `Remove ₱${exp.amount} (${exp.category})?`, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        const newData = await budgetService.deleteExpense(userData, exp.id);
                        setUserData(newData);
                      },
                    },
                  ]);
                }}
              />
            ))
        )}
      </ScrollView>

      {!isPremium && <UpgradeCard />}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    gap: 8,
  },
  viewBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  viewBtnActive: {
    backgroundColor: 'rgba(59,130,246,0.4)',
  },
  viewBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  viewBtnTextActive: { color: '#fff', fontWeight: '700' },
  premiumBadge: { fontSize: 10 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  navBtn: { color: '#fff', fontSize: 28, fontWeight: '300', padding: 8 },
  monthTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  calendarRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 4,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 4,
    alignSelf: 'center',
  },
  weekday: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  dayCellDimmed: { opacity: 0.4 },
  dayCellSelected: {
    backgroundColor: 'rgba(59,130,246,0.5)',
  },
  dayNum: { color: '#fff', fontSize: 14, fontWeight: '600' },
  dayNumDimmed: { color: 'rgba(255,255,255,0.6)' },
  dayNumSelected: { color: '#fff', fontWeight: '800' },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#22c55e',
  },
  selectedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  selectedLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '600' },
  selectedTotal: { color: '#f87171', fontSize: 18, fontWeight: '800' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
});
