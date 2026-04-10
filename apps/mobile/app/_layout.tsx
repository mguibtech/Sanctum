import { ThemeProvider } from '@shopify/restyle';
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { lightTheme, darkTheme } from '../constants/theme';
import { AppAlertProvider } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useOnboarding } from '../hooks/useOnboarding';
import { useThemeMode, useThemeModeStore } from '../hooks/useThemeMode';
import { setupNotificationHandler } from '../hooks/useStreakNotification';

// Configura handler de notificações na inicialização do app
setupNotificationHandler();

export default function RootLayout() {
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const hasCompletedOnboarding = useOnboarding((state) => state.hasCompletedOnboarding);
  const isHydratingOnboarding = useOnboarding((state) => state.isHydrating);
  const { isDark } = useThemeMode();
  const router = useRouter();
  const segments = useSegments();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const currentTheme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await Promise.all([
          useAuth.getState().hydrateSession(),
          useOnboarding.getState().hydrateOnboarding(),
          useThemeModeStore.getState().hydrateTheme(),
        ]);
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (isBootstrapping || isHydratingOnboarding) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (hasCompletedOnboarding && inOnboarding) {
      router.replace(isAuthenticated ? '/(tabs)' : '/(auth)/login');
      return;
    }

    if (!isAuthenticated && !inAuthGroup && !inOnboarding) {
      router.replace('/(auth)/login');
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [
    hasCompletedOnboarding,
    isAuthenticated,
    isBootstrapping,
    isHydratingOnboarding,
    router,
    segments,
  ]);

  return (
    <ThemeProvider theme={currentTheme}>
      <AppAlertProvider>
        <StatusBar
          style={isDark ? 'light' : 'dark'}
          backgroundColor={currentTheme.colors.primary}
        />
        <Stack screenOptions={{ headerShown: false }} />
      </AppAlertProvider>
    </ThemeProvider>
  );
}
