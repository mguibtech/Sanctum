import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const NOTIFICATION_ID = 'sanctum-streak-risk';

// ─── Configurar handler global (chamar uma vez no _layout) ───────────────────
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// ─── Solicitar permissão ──────────────────────────────────────────────────────
async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('streak-reminder', {
      name: 'Lembrete de Streak',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const { status: asked } = await Notifications.requestPermissionsAsync();
  return asked === 'granted';
}

// ─── Agendar notificação às 21h ───────────────────────────────────────────────
export async function scheduleStreakReminder(streakDays: number): Promise<void> {
  try {
    const granted = await requestPermission();
    if (!granted) return;

    // Cancela notificação anterior antes de reagendar
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID).catch(() => {});

    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_ID,
      content: {
        title: `Seu streak de ${streakDays} ${streakDays === 1 ? 'dia' : 'dias'} está em risco! 🔥`,
        body: 'Faça sua leitura antes de meia-noite para não perder sua sequência no Sanctum.',
        sound: 'default',
      },
      trigger: {
        hour: 21,
        minute: 0,
        repeats: true,
      } as any,
    });
  } catch {
    // Notificações não são críticas — falha silenciosa
  }
}

// ─── Cancelar ao fazer check-in ───────────────────────────────────────────────
export async function cancelStreakReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
  } catch {
    // Silencioso
  }
}

// ─── Hook para uso nas telas ──────────────────────────────────────────────────
export function useStreakNotification(streakDays: number | undefined, checkedInToday: boolean) {
  useEffect(() => {
    if (streakDays === undefined) return;

    if (checkedInToday) {
      cancelStreakReminder();
    } else {
      scheduleStreakReminder(streakDays);
    }
  }, [streakDays, checkedInToday]);
}
