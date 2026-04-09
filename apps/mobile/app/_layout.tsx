import { ThemeProvider } from '@shopify/restyle';
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import theme from '../constants/theme';
import { AppAlertProvider } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export default function RootLayout() {
  const { isAuthenticated, hydrateSession } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await hydrateSession();
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, [hydrateSession]);

  useEffect(() => {
    if (isBootstrapping) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isBootstrapping, router, segments]);

  return (
    <ThemeProvider theme={theme}>
      <AppAlertProvider>
        <StatusBar style="light" backgroundColor={theme.colors.primary} />
        <Stack screenOptions={{ headerShown: false }} />
      </AppAlertProvider>
    </ThemeProvider>
  );
}
