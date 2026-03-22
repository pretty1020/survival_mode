import {
  UserData,
  Expense,
  FinancialEvent,
  SurvivalStatus,
  BudgetPeriod,
  Category,
} from '@/types';
import { dataService } from './dataService';
import { FREE_EVENTS, PREMIUM_EVENTS } from '@/constants/events';
import { DAILY_CHALLENGES } from '@/constants/challenges';
import { BADGES } from '@/constants/badges';
import { DEFAULT_CATEGORIES } from '@/constants/defaultCategories';

const getDateKey = () => new Date().toISOString().split('T')[0];
const getWeekKey = () => {
  const d = new Date();
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().split('T')[0];
};
const getMonthKey = () => new Date().toISOString().slice(0, 7);

const getBudgetForPeriod = (data: UserData, period: BudgetPeriod): number => {
  const s = data.budgetSettings;
  if (period === 'daily') return s.dailyBudget;
  if (period === 'weekly') return s.weeklyBudget;
  return s.monthlyBudget;
};

const getPeriodKey = (period: BudgetPeriod): string => {
  if (period === 'daily') return getDateKey();
  if (period === 'weekly') return getWeekKey();
  return getMonthKey();
};

const getLastResetKey = (data: UserData, period: BudgetPeriod): string => {
  if (period === 'daily') return data.lastResetDaily;
  if (period === 'weekly') return data.lastResetWeekly;
  return data.lastResetMonthly;
};

const expenseInPeriod = (dateKey: string, period: BudgetPeriod, periodKey: string): boolean => {
  if (period === 'daily') return dateKey === periodKey;
  if (period === 'weekly') {
    const expDate = new Date(dateKey);
    const periodStart = new Date(periodKey);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 6);
    return expDate >= periodStart && expDate <= periodEnd;
  }
  return dateKey.startsWith(periodKey);
};

export const budgetService = {
  async getOrCreateUserData(isPremium: boolean): Promise<UserData> {
    let data = await dataService.getOrCreateUserData();
    data = await this.checkResets(data);
    return data;
  },

  async checkResets(data: UserData): Promise<UserData> {
    const today = getDateKey();
    const thisWeek = getWeekKey();
    const thisMonth = getMonthKey();
    let newData = { ...data };

    // Daily reset
    if (data.lastResetDaily !== today) {
      const lastDay = data.lastResetDaily;
      const lastDayExpenses = data.expenses
        .filter((e) => e.dateKey === lastDay)
        .reduce((s, e) => s + e.amount, 0);
      const lastDayEventImpact = data.events
        .filter((e) => e.dateKey === lastDay)
        .reduce((s, e) => s + e.impact, 0);
      // Expenses deduct; positive event impact = income (adds), negative = expense
      const netDrain = lastDayExpenses - lastDayEventImpact;
      const survived = netDrain <= data.budgetSettings.dailyBudget;
      newData = {
        ...newData,
        daysSurvived: survived ? newData.daysSurvived + 1 : newData.daysSurvived,
        currentStreak: survived ? newData.currentStreak + 1 : 0,
        bestStreak: Math.max(newData.bestStreak, survived ? newData.currentStreak + 1 : newData.currentStreak),
        lastResetDaily: today,
        challenges: [{ ...DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)], dateKey: today }],
      };
      const newBadges = BADGES.filter(
        (b) => !newData.badges.includes(b.id) && newData.currentStreak >= b.minStreak
      ).map((b) => b.id);
      newData.badges = [...newData.badges, ...newBadges];
    }

    // Weekly reset
    if (data.lastResetWeekly !== thisWeek) {
      newData = { ...newData, lastResetWeekly: thisWeek };
    }

    // Monthly reset
    if (data.lastResetMonthly !== thisMonth) {
      newData = { ...newData, lastResetMonthly: thisMonth };
    }

    await dataService.saveUserData(newData);
    return newData;
  },

  getSurvivalStatus(data: UserData, period: BudgetPeriod = 'daily'): SurvivalStatus {
    const periodKey = getPeriodKey(period);
    const budget = getBudgetForPeriod(data, period);
    const expenses = data.expenses.filter((e) => expenseInPeriod(e.dateKey, period, periodKey));
    const events = data.events.filter((e) => expenseInPeriod(e.dateKey, period, periodKey));
    // Expenses DEDUCT; events: positive impact = income (ADD), negative = expense (DEDUCT)
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netEventImpact = events.reduce((s, e) => s + e.impact, 0);
    const totalSpent = totalExpenses - netEventImpact;
    const remaining = Math.max(0, budget - totalSpent);
    const percentRemaining = budget > 0 ? (remaining / budget) * 100 : 0;

    let status: SurvivalStatus['status'] = 'safe';
    if (percentRemaining <= 0) {
      status = 'critical';
    } else if (percentRemaining <= 15) {
      status = 'critical';
    } else if (percentRemaining <= 35) {
      status = 'danger';
    } else if (percentRemaining <= 60) {
      status = 'warning';
    }
    return { percentRemaining, status };
  },

  getTotalSpent(data: UserData, period: BudgetPeriod): number {
    const periodKey = getPeriodKey(period);
    const expenses = data.expenses.filter((e) => expenseInPeriod(e.dateKey, period, periodKey));
    const events = data.events.filter((e) => expenseInPeriod(e.dateKey, period, periodKey));
    // Expenses deduct; events: positive impact = income (adds), negative = expense (deducts)
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netEventImpact = events.reduce((s, e) => s + e.impact, 0);
    return totalExpenses - netEventImpact;
  },

  getTotalExpenses(data: UserData, period: BudgetPeriod): number {
    const periodKey = getPeriodKey(period);
    const expenses = data.expenses.filter((e) => expenseInPeriod(e.dateKey, period, periodKey));
    return expenses.reduce((s, e) => s + e.amount, 0);
  },

  getTotalExpensesFiltered(data: UserData, filter: 'today' | 'week' | 'month'): number {
    const expenses = this.getExpensesFiltered(data, filter);
    return expenses.reduce((s, e) => s + e.amount, 0);
  },

  didSurviveDay(data: UserData, dateKey: string): boolean {
    const today = getDateKey();
    if (dateKey >= today) return false;
    const dayExpenses = data.expenses.filter((e) => e.dateKey === dateKey).reduce((s, e) => s + e.amount, 0);
    const dayEventImpact = data.events.filter((e) => e.dateKey === dateKey).reduce((s, e) => s + e.impact, 0);
    const netDrain = dayExpenses - dayEventImpact;
    return netDrain <= data.budgetSettings.dailyBudget;
  },

  getExpensesForPeriod(data: UserData, period: BudgetPeriod) {
    const periodKey = getPeriodKey(period);
    return data.expenses.filter((e) => expenseInPeriod(e.dateKey, period, periodKey));
  },

  getExpensesFiltered(data: UserData, filter: 'today' | 'week' | 'month') {
    const today = getDateKey();
    const weekStart = getWeekKey();
    const monthStart = getMonthKey();
    if (filter === 'today') return data.expenses.filter((e) => e.dateKey === today);
    if (filter === 'week') return data.expenses.filter((e) => {
      const d = new Date(e.dateKey);
      const start = new Date(weekStart);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return d >= start && d <= end;
    });
    return data.expenses.filter((e) => e.dateKey.startsWith(monthStart));
  },

  async addExpense(data: UserData, expense: Omit<Expense, 'id' | 'timestamp' | 'dateKey'>): Promise<UserData> {
    const today = getDateKey();
    const newExpense: Expense = {
      ...expense,
      id: `exp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      dateKey: today,
    };
    const newData: UserData = {
      ...data,
      expenses: [newExpense, ...data.expenses],
    };
    await dataService.saveUserData(newData);
    return newData;
  },

  async updateExpense(data: UserData, id: string, updates: Partial<Pick<Expense, 'amount' | 'category' | 'note' | 'emoji'>>): Promise<UserData> {
    const idx = data.expenses.findIndex((e) => e.id === id);
    if (idx < 0) return data;
    const updated = [...data.expenses];
    updated[idx] = { ...updated[idx], ...updates };
    const newData = { ...data, expenses: updated };
    await dataService.saveUserData(newData);
    return newData;
  },

  async deleteExpense(data: UserData, id: string): Promise<UserData> {
    const newData = {
      ...data,
      expenses: data.expenses.filter((e) => e.id !== id),
    };
    await dataService.saveUserData(newData);
    return newData;
  },

  async addEvent(data: UserData, event: FinancialEvent): Promise<UserData> {
    const newData: UserData = { ...data, events: [event, ...data.events] };
    await dataService.saveUserData(newData);
    return newData;
  },

  generateRandomEvent(isPremium: boolean): FinancialEvent {
    const pool = isPremium ? [...FREE_EVENTS, ...PREMIUM_EVENTS] : FREE_EVENTS;
    const template = pool[Math.floor(Math.random() * pool.length)];
    const today = getDateKey();
    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title: template.title,
      description: template.description,
      impact: template.impact,
      emoji: template.emoji,
      timestamp: Date.now(),
      dateKey: today,
      isPremium: template.isPremium,
    };
  },

  getHistoryLimit(isPremium: boolean): number {
    return isPremium ? Infinity : 30;
  },

  async updateBudget(data: UserData, period: BudgetPeriod, amount: number): Promise<UserData> {
    if (amount <= 0) return data;
    const newData = { ...data, budgetSettings: { ...data.budgetSettings } };
    if (period === 'daily') newData.budgetSettings.dailyBudget = amount;
    else if (period === 'weekly') newData.budgetSettings.weeklyBudget = amount;
    else newData.budgetSettings.monthlyBudget = amount;
    await dataService.saveUserData(newData);
    return newData;
  },

  async updateBudgetPeriod(data: UserData, period: BudgetPeriod): Promise<UserData> {
    const newData = {
      ...data,
      budgetSettings: { ...data.budgetSettings, budgetPeriod: period },
    };
    await dataService.saveUserData(newData);
    return newData;
  },

  getCategories(data: UserData): Category[] {
    return data.categories?.length ? data.categories : DEFAULT_CATEGORIES.map((c, i) => ({ ...c, id: `cat_${i}` }));
  },

  async addCategory(data: UserData, name: string, emoji: string): Promise<UserData> {
    const trimmed = name.trim();
    if (!trimmed) return data;
    const existing = data.categories?.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return data;
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: trimmed,
      emoji: emoji || '💰',
      isDefault: false,
    };
    const newData = {
      ...data,
      categories: [...(data.categories || []), newCat],
    };
    await dataService.saveUserData(newData);
    return newData;
  },

  async updateCategory(data: UserData, id: string, updates: Partial<Category>): Promise<UserData> {
    const cats = data.categories || [];
    const idx = cats.findIndex((c) => c.id === id);
    if (idx < 0) return data;
    const updated = [...cats];
    if (updates.name?.trim()) {
      const dup = cats.find((c) => c.id !== id && c.name.toLowerCase() === updates.name!.toLowerCase());
      if (dup) return data;
      updated[idx] = { ...updated[idx], ...updates, name: updates.name.trim() };
    } else {
      updated[idx] = { ...updated[idx], ...updates };
    }
    const newData = { ...data, categories: updated };
    await dataService.saveUserData(newData);
    return newData;
  },

  async deleteCategory(data: UserData, id: string): Promise<UserData> {
    const cat = data.categories?.find((c) => c.id === id);
    if (cat?.isDefault) return data;
    const newData = {
      ...data,
      categories: (data.categories || []).filter((c) => c.id !== id),
    };
    await dataService.saveUserData(newData);
    return newData;
  },

  getPremiumStats(data: UserData) {
    const expenses = data.expenses;
    const byCategory: Record<string, number> = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    const byDate: Record<string, number> = {};
    expenses.forEach((e) => {
      byDate[e.dateKey] = (byDate[e.dateKey] || 0) + e.amount;
    });
    const sorted = Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0]));
    const worstDay = sorted.reduce((worst, [k, v]) => (v > (worst?.amount ?? 0) ? { date: k, amount: v } : worst), null as { date: string; amount: number } | null);
    const bestDay = sorted.reduce((best, [k, v]) => (v < (best?.amount ?? Infinity) && v > 0 ? { date: k, amount: v } : best), null as { date: string; amount: number } | null);
    return {
      categoryBreakdown: byCategory,
      dailyTrend: sorted.slice(-14),
      worstPeriod: worstDay,
      bestPeriod: bestDay,
      streakHistory: { current: data.currentStreak, best: data.bestStreak, daysSurvived: data.daysSurvived },
    };
  },
};
