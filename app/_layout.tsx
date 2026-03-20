import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from '@/context/AppContext';
import { HeaderLogo } from '@/components/HeaderLogo';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AppProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0a0f' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          contentStyle: { backgroundColor: '#0a0a0f' },
          animation: 'slide_from_right',
          headerRight: () => <HeaderLogo />,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="add-expense" options={{ title: 'Add Expense' }} />
        <Stack.Screen name="dashboard" options={{ title: 'Survival Dashboard' }} />
        <Stack.Screen name="expenses" options={{ title: 'Expense History' }} />
        <Stack.Screen name="events" options={{ title: 'Financial Events' }} />
        <Stack.Screen name="results" options={{ title: 'Your Results' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="categories" options={{ title: 'Categories' }} />
        <Stack.Screen name="terms" options={{ title: 'Terms & Conditions' }} />
        <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
        <Stack.Screen
          name="paywall"
          options={{
            title: 'Unlock Premium',
            presentation: 'modal',
          }}
        />
      </Stack>
    </AppProvider>
  );
}
