export interface EventTemplate {
  title: string;
  description: string;
  impact: number;
  emoji: string;
  isPremium?: boolean;
}

// Free events (limited pool)
export const FREE_EVENTS: EventTemplate[] = [
  { title: 'Fuel Price Spike', description: 'Gas prices went up again!', impact: -120, emoji: '⛽' },
  { title: 'Office Treat Temptation', description: 'Someone brought donuts...', impact: -180, emoji: '🍩' },
  { title: 'Unexpected Load Top-Up', description: 'Data ran out mid-meeting', impact: -99, emoji: '📱' },
  { title: 'Friend paid for lunch', description: 'Blessed by a friend!', impact: 150, emoji: '🙏' },
  { title: 'Cashback unlocked', description: 'Your card gave you cashback!', impact: 80, emoji: '💰' },
  { title: 'Grab surge pricing', description: 'Rush hour hit hard', impact: -85, emoji: '🚗' },
  { title: 'Milk tea craving', description: 'The boba called your name', impact: -150, emoji: '🧋' },
  { title: 'Found loose change', description: 'Pocket treasure!', impact: 45, emoji: '🪙' },
];

// Premium events (more dramatic)
export const PREMIUM_EVENTS: EventTemplate[] = [
  { title: 'Lazada Flash Sale', description: 'Everything was 50% off...', impact: -350, emoji: '📦', isPremium: true },
  { title: 'Shopee Free Shipping', description: 'You know what that means', impact: -280, emoji: '🛍️', isPremium: true },
  { title: 'Tax Refund', description: 'Surprise money from BIR!', impact: 500, emoji: '📋', isPremium: true },
  { title: '13th Month Advance', description: 'Early Christmas!', impact: 2000, emoji: '🎄', isPremium: true },
  { title: 'Car Maintenance', description: 'Brake pads said goodbye', impact: -2500, emoji: '🔧', isPremium: true },
  { title: 'Medical Emergency', description: 'Unexpected hospital visit', impact: -1200, emoji: '🏥', isPremium: true },
];
