# RevenueCat Setup Guide

## 1. Fix the Code Error ✓
The `isPremium is not defined` error has been fixed in `revenuecatService.ts`.

---

## 2. Fix "Could not check" & Attach Entitlement

### Step 1: Attach Product to Entitlement
1. Go to [RevenueCat Dashboard](https://app.revenuecat.com) → **Survival_Mode** project
2. Open **Products** (or **Offerings**)
3. Find **Lifetime_89** (premium:p1)
4. Click **"Attach"** next to Entitlements
5. Select or create the **"premium"** entitlement
6. Save

### Step 2: Fix "Could not check" (Google Play)
This usually means RevenueCat can't verify the product with Google Play. Check:

**A. Link Google Play to RevenueCat**
1. RevenueCat → **Project Settings** → **Apps**
2. Select **Survival_Mode (Play Store)**
3. Ensure **Service Credentials** (JSON key) is uploaded
4. Get the key from [Google Play Console](https://play.google.com/console) → **Setup** → **API access** → **Create new service account** → Download JSON

**B. Create Product in Google Play Console**
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app → **Monetize** → **Products** → **In-app products**
3. Create product:
   - **Product ID:** `Lifetime_89` (must match RevenueCat)
   - **Type:** One-time product (non-consumable)
   - **Price:** ₱89
   - **Status:** Active

**C. App Must Be Published (or Internal Testing)**
- RevenueCat can only verify products for apps in at least **Internal testing** track
- Upload a build to Internal testing if you haven't

### Step 3: Create Offering in RevenueCat
1. RevenueCat → **Offerings**
2. Create or edit **Current** offering
3. Add package:
   - **Identifier:** `lifetime` or `Lifetime_89`
   - **Product:** Select `Lifetime_89`
   - **Type:** Lifetime

---

## 3. Test Checklist
- [ ] Product attached to "premium" entitlement
- [ ] Google Play service account linked
- [ ] Product exists in Play Console with ID `Lifetime_89`
- [ ] App in Internal/Closed/Open testing
- [ ] Run app on Android device/emulator (not web) with dev build
