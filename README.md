# Survival Mode Budget Challenge

A fun, addictive React Native (Expo) mobile app that turns budgeting into a survival game. Track daily, weekly, and monthly expenses, survive random financial events, build streaks, and share your results with friends.

## Features

- **Budget Views** – Toggle between Daily, Weekly, and Monthly budget tracking
- **Survival Meter** – Live budget health bar from safe to danger
- **Expense History** – Filter by Today, This Week, This Month; grouped by date
- **Customizable Categories** – Create, edit, delete expense categories with emojis
- **Daily Challenges** – "No milk tea day", "Zero impulse buy", and more
- **Random Events** – Fuel spikes, Lazada temptation, friend pays for lunch
- **Streaks & Badges** – Tipid Warrior, Budget Survivor, Wallet Defender
- **Premium Statistics** – Spending trends, category breakdown, streak history (premium only)
- **Shareable Results** – Beautiful cards for social media
- **Freemium Model** – Lifetime Access ₱89 via RevenueCat
- **Legal Pages** – Terms & Conditions, Privacy Policy

## Tech Stack

- React Native + Expo (SDK 51)
- Expo Router for navigation
- RevenueCat for in-app purchases
- Supabase (optional) for cloud sync
- AsyncStorage for local persistence
- React Native Reanimated for animations

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. RevenueCat Configuration

The app uses a test API key by default. For production:

1. Create a [RevenueCat](https://www.revenuecat.com) account
2. Create entitlement: `premium`
3. Create offering with a one-time product (₱89 Lifetime Access)
4. Update `REVENUECAT_API_KEY` in `services/revenuecatService.ts`

### 3. Supabase (Optional)

For cloud sync and multi-device support:

1. Create a [Supabase](https://supabase.com) project
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Enable Anonymous Auth in Authentication > Providers
4. Create `.env` with:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

Without Supabase, the app uses AsyncStorage for local-only storage.

### 4. Run the App

```bash
npx expo start
npm run web   # For browser
```

For purchases (development build):

```bash
npx expo prebuild
npx expo run:android
```

## Project Structure

```
├── app/
│   ├── index.tsx        # HomeScreen (Daily/Weekly/Monthly toggle)
│   ├── add-expense.tsx  # Add expense with category picker
│   ├── dashboard.tsx   # Survival dashboard + Premium stats
│   ├── expenses.tsx    # Expense history (Today/Week/Month)
│   ├── events.tsx      # Financial events
│   ├── results.tsx     # Shareable results
│   ├── settings.tsx    # Restore Purchases, Legal links
│   ├── categories.tsx  # Manage custom categories
│   ├── paywall.tsx     # Premium upsell
│   ├── terms.tsx       # Terms & Conditions
│   └── privacy.tsx     # Privacy Policy
├── components/
│   ├── BudgetPeriodToggle.tsx  # Daily/Weekly/Monthly
│   ├── SurvivalMeter.tsx
│   ├── ExpenseCard.tsx
│   ├── EventPopup.tsx
│   ├── PremiumBadge.tsx
│   └── UpgradeCard.tsx
├── services/
│   ├── dataService.ts    # Supabase + AsyncStorage
│   ├── budgetService.ts  # Budget logic, categories, stats
│   └── revenuecatService.ts
├── lib/supabase.ts
├── supabase/schema.sql
└── legal/
    ├── TERMS.md
    └── PRIVACY.md
```

## Legal

Terms and Privacy are in `legal/` and accessible in-app via Settings and Paywall footer. Repository: https://github.com/pretty1020/survival_mode

## License

Private / All rights reserved
