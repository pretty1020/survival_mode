import { Category } from '@/types';

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Food', emoji: '🍔', isDefault: true, sortOrder: 0 },
  { name: 'Transport', emoji: '🚌', isDefault: true, sortOrder: 1 },
  { name: 'Bills', emoji: '📄', isDefault: true, sortOrder: 2 },
  { name: 'Shopping', emoji: '🛒', isDefault: true, sortOrder: 3 },
  { name: 'Load/Data', emoji: '📱', isDefault: true, sortOrder: 4 },
  { name: 'Emergency', emoji: '🚨', isDefault: true, sortOrder: 5 },
  { name: 'Fun', emoji: '🎮', isDefault: true, sortOrder: 6 },
];
