import { useColorScheme } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeModeStore {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  hydrateTheme: () => Promise<void>;
  isHydrating: boolean;
}

export const useThemeModeStore = create<ThemeModeStore>()(
  persist(
    (set) => ({
      themeMode: 'auto',
      setThemeMode: (mode: ThemeMode) => set({ themeMode: mode }),
      hydrateTheme: async () => {
        // Zustand persist middleware will handle hydration
      },
      isHydrating: false,
    }),
    {
      name: 'theme-mode-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.log('an error happened during hydration', error);
      },
    }
  )
);

export function useThemeMode() {
  const systemColorScheme = useColorScheme();
  const themeMode = useThemeModeStore((state) => state.themeMode);
  const setThemeMode = useThemeModeStore((state) => state.setThemeMode);

  const isDark =
    themeMode === 'dark' || (themeMode === 'auto' && systemColorScheme === 'dark');

  return {
    themeMode,
    setThemeMode,
    isDark,
    systemColorScheme,
  };
}
