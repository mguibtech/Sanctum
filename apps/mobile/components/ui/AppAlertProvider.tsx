import React from 'react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable } from 'react-native';
import { useTheme } from '@shopify/restyle';
import type { Theme } from '../../constants/theme';
import { Box } from './Box';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

type AppAlertType = 'error' | 'success' | 'warning';
type AppAlertActionVariant = 'primary' | 'secondary' | 'ghost';

export type AppAlertAction = {
  label: string;
  onPress?: () => void;
  variant?: AppAlertActionVariant;
};

export type AppAlertInput = {
  type: AppAlertType;
  title: string;
  message?: string;
  actions?: AppAlertAction[];
};

type AlertState = AppAlertInput | null;

type AppAlertContextValue = {
  hideAlert: () => void;
  showAlert: (input: AppAlertInput) => void;
  showConfirm: (input: AppAlertInput) => void;
  showError: (title: string, message?: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
};

const AppAlertContext = createContext<AppAlertContextValue | null>(null);

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const theme = useTheme<Theme>();
  const [alert, setAlert] = useState<AlertState>(null);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const showAlert = useCallback((input: AppAlertInput) => {
    setAlert(input);
  }, []);

  const showConfirm = useCallback((input: AppAlertInput) => {
    setAlert(input);
  }, []);

  const showError = useCallback((title: string, message?: string) => {
    setAlert({ type: 'error', title, message });
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    setAlert({ type: 'success', title, message });
  }, []);

  const showWarning = useCallback((title: string, message?: string) => {
    setAlert({ type: 'warning', title, message });
  }, []);

  const value = useMemo(
    () => ({ hideAlert, showAlert, showConfirm, showError, showSuccess, showWarning }),
    [hideAlert, showAlert, showConfirm, showError, showSuccess, showWarning],
  );

  const palette = alert
    ? {
        error: {
          backgroundColor: 'rgba(194,65,65,0.12)',
          borderColor: theme.colors.red,
          icon: 'close-circle',
          iconColor: 'red' as const,
        },
        success: {
          backgroundColor: 'rgba(31,138,91,0.12)',
          borderColor: theme.colors.green,
          icon: 'check-circle',
          iconColor: 'green' as const,
        },
        warning: {
          backgroundColor: 'rgba(212,160,23,0.14)',
          borderColor: theme.colors.yellow,
          icon: 'alert',
          iconColor: 'yellow' as const,
        },
      }[alert.type]
    : null;

  const actions = alert?.actions ?? [];

  return (
    <AppAlertContext.Provider value={value}>
      {children}

      <Modal
        transparent
        animationType="fade"
        visible={Boolean(alert)}
        onRequestClose={hideAlert}
      >
        <Pressable
          onPress={hideAlert}
          style={{
            flex: 1,
            backgroundColor: 'rgba(17,24,39,0.55)',
            justifyContent: 'center',
            padding: theme.spacing.lg,
          }}
        >
          {alert && palette ? (
            <Pressable onPress={(event) => event.stopPropagation()}>
              <Box
                bg="surface"
                borderRadius="xl"
                p="xl"
                style={{
                  borderWidth: 1,
                  borderColor: palette.borderColor,
                  shadowColor: '#000',
                  shadowOpacity: 0.16,
                  shadowRadius: 24,
                  shadowOffset: { width: 0, height: 12 },
                  elevation: 12,
                }}
              >
                <Box
                  width={58}
                  height={58}
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                  mb="md"
                  style={{ backgroundColor: palette.backgroundColor }}
                >
                  <Icon name={palette.icon} size={30} color={palette.iconColor} />
                </Box>

                <Text variant="heading" color="primary">
                  {alert.title}
                </Text>

                {alert.message ? (
                  <Text variant="body" color="textMuted" mt="sm">
                    {alert.message}
                  </Text>
                ) : null}

                {actions.length > 0 ? (
                  <Box mt="lg" gap="sm">
                    {actions.map((action) => (
                      <Button
                        key={action.label}
                        variant={action.variant ?? 'primary'}
                        onPress={() => {
                          hideAlert();
                          action.onPress?.();
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Box>
                ) : null}
              </Box>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
    </AppAlertContext.Provider>
  );
}

export function useAppAlertContext() {
  const context = useContext(AppAlertContext);

  if (!context) {
    throw new Error('useAppAlertContext must be used within AppAlertProvider');
  }

  return context;
}
