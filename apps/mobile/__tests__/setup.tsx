import { render as rtlRender } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from '@shopify/restyle';
import theme from '../constants/theme';

/**
 * Custom render function that wraps components with ThemeProvider
 * Use this instead of render() for components that depend on theme
 */
export function renderWithTheme(
  component: React.ReactElement,
  options?: any
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    );
  }

  return rtlRender(component, { wrapper: Wrapper, ...options });
}

// Re-export everything from RTL
export * from '@testing-library/react-native';
export { renderWithTheme as render };
