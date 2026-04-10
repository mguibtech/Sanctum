import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const ONBOARDING_STORAGE_KEY = 'sanctum:onboarding-complete';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  isHydrating: boolean;
  hydrateOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const useOnboarding = create<OnboardingState>((set) => ({
  hasCompletedOnboarding: false,
  isHydrating: true,

  hydrateOnboarding: async () => {
    try {
      const storedValue = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      set({ hasCompletedOnboarding: storedValue === 'true' });
    } finally {
      set({ isHydrating: false });
    }
  },

  completeOnboarding: async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    set({ hasCompletedOnboarding: true });
  },
}));
