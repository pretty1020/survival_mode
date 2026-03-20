/**
 * RevenueCat integration for Survival Mode Budget Challenge
 *
 * IMPORTANT: Replace REVENUECAT_API_KEY with your actual API key from RevenueCat dashboard.
 * - Use the Public API key (starts with "appl_" for iOS or "goog_" for Android)
 * - For Expo, you typically need both - configure in app.config.js or use Constants
 *
 * Setup in RevenueCat:
 * 1. Create entitlement: "premium"
 * 2. Create offering with product: Lifetime Access ₱89 (one-time purchase)
 * 3. Ensure product is configured as non-consumable / one-time in App Store / Play Store
 *
 * NOTE: react-native-purchases requires native modules. Use EAS Build / development build, not Expo Go.
 */

import { Platform } from 'react-native';

// Lazy load to avoid crash in Expo Go when native module is unavailable
let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch {
  console.warn('RevenueCat: react-native-purchases not available (e.g. Expo Go). Use dev build for purchases.');
}

import type { CustomerInfo, PurchasesOffering } from 'react-native-purchases';

// RevenueCat SDK API keys (Survival_Mode project)
// - Play Store: goog_bKMCcgrVHaHpYkeoJqWlssONymU
// - Test Store: for development/sandbox testing
// - Secret key (sk_...) must NEVER be used in the app - backend only
const REVENUECAT_API_KEY_ANDROID = 'goog_bKMCcgrVHaHpYkeoJqWlssONymU';
const REVENUECAT_API_KEY_IOS = 'appl_YOUR_IOS_KEY_HERE'; // Add when App Store app is configured

export const ENTITLEMENT_PREMIUM = 'premium';
export const LIFETIME_PRODUCT_ID = 'Lifetime_89'; // Match your RevenueCat product ID (premium:p1)

let isInitialized = false;
let configured = false; // True only when Purchases was successfully configured

export const revenuecatService = {
  async initialize(userId?: string): Promise<boolean> {
    if (isInitialized) return configured;

    try {
      // Skip init if Purchases not available (e.g. Expo Go)
      if (!Purchases) {
        console.warn('RevenueCat: Native module not available. Use dev build for purchases.');
        isInitialized = true;
        configured = false;
        return false;
      }

      const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
      const keyToUse = apiKey.includes('YOUR_') ? REVENUECAT_API_KEY_ANDROID : apiKey;
      await Purchases.configure({
        apiKey: keyToUse,
        appUserID: userId ?? undefined,
      });

      isInitialized = true;
      configured = true;
      return true;
    } catch (error) {
      console.warn('RevenueCat init failed:', error);
      isInitialized = true;
      configured = false;
      return false;
    }
  },

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!configured) return null;
    try {
      const info = await Purchases.getCustomerInfo();
      return info;
    } catch (error) {
      console.warn('RevenueCat getCustomerInfo failed:', error);
      return null;
    }
  },

  async isPremium(): Promise<boolean> {
    if (!configured) return false;
    const info = await this.getCustomerInfo();
    return (info?.entitlements.active[ENTITLEMENT_PREMIUM] != null) || false;
  },

  async getOfferings(): Promise<PurchasesOffering | null> {
    if (!configured) return null;
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.warn('RevenueCat getOfferings failed:', error);
      return null;
    }
  },

  async purchaseLifetime(): Promise<{ success: boolean; error?: string }> {
    if (!configured) return { success: false, error: 'RevenueCat not configured' };
    try {
      const offerings = await this.getOfferings();
      const packageToBuy = offerings?.availablePackages.find(
        (p) =>
          p.identifier === 'Lifetime_89' ||
          p.identifier === 'lifetime' ||
          p.packageType === 'LIFETIME' ||
          p.identifier?.toLowerCase().includes('lifetime')
      ) ?? offerings?.availablePackages[0];

      if (!packageToBuy) {
        return { success: false, error: 'No lifetime package available' };
      }

      const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
      const isNowPremium = customerInfo.entitlements.active[ENTITLEMENT_PREMIUM] != null;
      return { success: isNowPremium };
    } catch (error: any) {
      if (error?.userCancelled) {
        return { success: false, error: 'cancelled' };
      }
      const message = error?.message ?? 'Purchase failed';
      return { success: false, error: message };
    }
  },

  isConfigured(): boolean {
    return configured;
  },

  async getStatus(): Promise<{ configured: boolean; isPremium: boolean }> {
    const isPremium = await this.isPremium();
    return { configured, isPremium };
  },

  async restorePurchases(): Promise<{ success: boolean; isPremium: boolean; error?: string }> {
    if (!configured) return { success: false, isPremium: false, error: 'RevenueCat not configured' };
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = customerInfo.entitlements.active[ENTITLEMENT_PREMIUM] != null;
      return { success: true, isPremium };
    } catch (error: any) {
      const message = error?.message ?? 'Restore failed';
      return { success: false, isPremium: false, error: message };
    }
  },
};
