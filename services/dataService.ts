/**
 * Unified data service - uses Supabase when configured, else AsyncStorage
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserData, Category } from '@/types';
import { DEFAULT_CATEGORIES } from '@/constants/defaultCategories';
import { DAILY_CHALLENGES } from '@/constants/challenges';

const STORAGE_KEY = '@survival_budget_data';

const getDateKey = () => new Date().toISOString().split('T')[0];
const getWeekKey = () => {
  const d = new Date();
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().split('T')[0];
};
const getMonthKey = () => new Date().toISOString().slice(0, 7);

const createDefaultData = (): UserData => ({
  budgetSettings: {
    dailyBudget: 500,
    weeklyBudget: 3500,
    monthlyBudget: 15000,
    budgetPeriod: 'daily',
  },
  expenses: [],
  events: [],
  daysSurvived: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastResetDaily: getDateKey(),
  lastResetWeekly: getWeekKey(),
  lastResetMonthly: getMonthKey(),
  badges: [],
  challenges: [],
  categories: DEFAULT_CATEGORIES.map((c, i) => ({ ...c, id: `cat_${i}` })),
});

const createSampleData = (): UserData => {
  const today = getDateKey();
  const data = createDefaultData();
  data.expenses = [
    { id: '1', amount: 85, category: 'Food', note: 'Lunch', emoji: '🍔', timestamp: Date.now() - 3600000, dateKey: today },
    { id: '2', amount: 50, category: 'Transport', note: 'Jeepney', emoji: '🚌', timestamp: Date.now() - 7200000, dateKey: today },
    { id: '3', amount: 99, category: 'Load/Data', note: 'Data promo', emoji: '📱', timestamp: Date.now() - 10800000, dateKey: today },
  ];
  data.events = [
    { id: 'e1', title: 'Friend paid for lunch', description: 'Blessed!', impact: 150, emoji: '🙏', timestamp: Date.now() - 1800000, dateKey: today },
  ];
  data.daysSurvived = 12;
  data.currentStreak = 5;
  data.bestStreak = 12;
  data.badges = ['first-day', 'tipid-warrior'];
  data.challenges = [{ ...DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)], dateKey: today }];
  return data;
};

export const dataService = {
  async getUserId(): Promise<string | null> {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) return user.id;
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) return null;
      return data.user?.id ?? null;
    } catch {
      return null;
    }
  },

  async getUserData(): Promise<UserData | null> {
    if (isSupabaseConfigured() && supabase) {
      const userId = await this.getUserId();
      if (userId) {
        try {
          const [budgetRes, expensesRes, eventsRes, streaksRes] = await Promise.all([
            supabase.from('budget_settings').select('*').eq('user_id', userId).single(),
            supabase.from('expenses').select('*').eq('user_id', userId).order('timestamp', { ascending: false }),
            supabase.from('events').select('*').eq('user_id', userId).order('timestamp', { ascending: false }),
            supabase.from('streaks').select('*').eq('user_id', userId).single(),
          ]);
          if (budgetRes.data && streaksRes.data) {
            const budget = budgetRes.data;
            const streaks = streaksRes.data;
            return {
              budgetSettings: {
                dailyBudget: Number(budget.daily_budget) || 500,
                weeklyBudget: Number(budget.weekly_budget) || 3500,
                monthlyBudget: Number(budget.monthly_budget) || 15000,
                budgetPeriod: (budget.budget_period as 'daily' | 'weekly' | 'monthly') || 'daily',
              },
              expenses: (expensesRes.data ?? []).map((e: any) => ({
                id: e.id,
                amount: Number(e.amount),
                category: e.category_name,
                categoryId: e.category_id,
                note: e.note,
                emoji: e.emoji,
                timestamp: Number(e.timestamp),
                dateKey: e.date_key,
              })),
              events: (eventsRes.data ?? []).map((e: any) => ({
                id: e.id,
                title: e.title,
                description: e.description,
                impact: Number(e.impact),
                emoji: e.emoji,
                timestamp: Number(e.timestamp),
                dateKey: e.date_key,
                isPremium: e.is_premium,
              })),
              daysSurvived: streaks.days_survived ?? 0,
              currentStreak: streaks.current_streak ?? 0,
              bestStreak: streaks.best_streak ?? 0,
              lastResetDaily: streaks.last_reset_daily ?? getDateKey(),
              lastResetWeekly: streaks.last_reset_weekly ?? getWeekKey(),
              lastResetMonthly: streaks.last_reset_monthly ?? getMonthKey(),
              badges: (streaks.badges as string[]) ?? [],
              challenges: [{ ...DAILY_CHALLENGES[0], dateKey: getDateKey() }],
              categories: DEFAULT_CATEGORIES.map((c, i) => ({ ...c, id: `cat_${i}` })),
            };
          }
        } catch (e) {
          console.warn('Supabase fetch failed:', e);
        }
      }
    }

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.budgetSettings) return parsed;
        return migrateOldData(parsed);
      } catch {
        return null;
      }
    }
    return null;
  },

  async saveUserData(data: UserData): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      const userId = await this.getUserId();
      if (userId) {
        try {
          await supabase.from('budget_settings').upsert({
            user_id: userId,
            daily_budget: data.budgetSettings.dailyBudget,
            weekly_budget: data.budgetSettings.weeklyBudget,
            monthly_budget: data.budgetSettings.monthlyBudget,
            budget_period: data.budgetSettings.budgetPeriod,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
          await supabase.from('streaks').upsert({
            user_id: userId,
            days_survived: data.daysSurvived,
            current_streak: data.currentStreak,
            best_streak: data.bestStreak,
            last_reset_daily: data.lastResetDaily,
            last_reset_weekly: data.lastResetWeekly,
            last_reset_monthly: data.lastResetMonthly,
            badges: data.badges,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
        } catch (e) {
          console.warn('Supabase save failed:', e);
        }
      }
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  async getOrCreateUserData(): Promise<UserData> {
    let data = await this.getUserData();
    if (!data) {
      data = createDefaultData();
      await this.saveUserData(data);
    }
    return data;
  },

  createDefaultData,
  createSampleData,
  getDateKey,
  getWeekKey,
  getMonthKey,
};

function migrateOldData(old: any): UserData {
  return {
    budgetSettings: {
      dailyBudget: old.dailyBudget ?? 500,
      weeklyBudget: 3500,
      monthlyBudget: 15000,
      budgetPeriod: 'daily',
    },
    expenses: old.expenses ?? [],
    events: old.events ?? [],
    daysSurvived: old.daysSurvived ?? 0,
    currentStreak: old.currentStreak ?? 0,
    bestStreak: old.bestStreak ?? 0,
    lastResetDaily: old.lastResetDate ?? getDateKey(),
    lastResetWeekly: dataService.getWeekKey(),
    lastResetMonthly: dataService.getMonthKey(),
    badges: old.badges ?? [],
    challenges: old.challenges ?? [],
    categories: DEFAULT_CATEGORIES.map((c, i) => ({ ...c, id: `cat_${i}` })),
  };
}
