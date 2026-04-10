import React from 'react';
import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme, { type Theme } from '../../constants/theme';

type ScreenProps = {
  children: ReactNode;
  backgroundColor?: keyof Theme['colors'];
};

export function Screen({ children, backgroundColor = 'background' }: ScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors[backgroundColor] }}>
      {children}
    </SafeAreaView>
  );
}
