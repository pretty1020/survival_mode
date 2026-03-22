export type BudgetPeriod = 'daily' | 'weekly' | 'monthly';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  categoryId?: string;
  note?: string;
  emoji?: string;
  timestamp: number;
  dateKey: string;
}

export interface FinancialEvent {
  id: string;
  title: string;
  description: string;
  impact: number;
  emoji: string;
  timestamp: number;
  dateKey: string;
  isPremium?: boolean;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  dateKey: string;
  completed?: boolean;
}

export interface BudgetSettings {
  dailyBudget: number;
  weeklyBudget: number;
  monthlyBudget: number;
  budgetPeriod: BudgetPeriod;
}

export interface UserData {
  budgetSettings: BudgetSettings;
  expenses: Expense[];
  events: FinancialEvent[];
  daysSurvived: number;
  currentStreak: number;
  bestStreak: number;
  lastResetDaily: string;
  lastResetWeekly: string;
  lastResetMonthly: string;
  badges: string[];
  challenges: DailyChallenge[];
  categories: Category[];
}

export interface SurvivalStatus {
  percentRemaining: number;
  status: 'safe' | 'warning' | 'danger' | 'critical';
}

export type ExpenseFilter = 'today' | 'week' | 'month';
