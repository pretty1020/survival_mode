import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserData } from '@/types';
import { budgetService } from '@/services/budgetService';
import { revenuecatService } from '@/services/revenuecatService';

interface AppContextType {
  userData: UserData | null;
  isPremium: boolean;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
  refreshPremium: () => Promise<void>;
  setUserData: (data: UserData | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPremium = useCallback(async () => {
    const premium = await revenuecatService.isPremium();
    setIsPremium(premium);
  }, []);

  const refreshUserData = useCallback(async () => {
    const premium = await revenuecatService.isPremium();
    const data = await budgetService.getOrCreateUserData(premium);
    setUserData(data);
    setIsPremium(premium);
  }, []);

  useEffect(() => {
    (async () => {
      await revenuecatService.initialize();
      await refreshUserData();
      setIsLoading(false);
    })();
  }, [refreshUserData]);

  return (
    <AppContext.Provider
      value={{
        userData,
        isPremium,
        isLoading,
        refreshUserData,
        refreshPremium,
        setUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
