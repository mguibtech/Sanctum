// Wrapper seguro para expo-haptics — falha silenciosamente em ambientes sem suporte
let Haptics: typeof import('expo-haptics') | null = null;

try {
  Haptics = require('expo-haptics');
} catch {
  // expo-haptics não instalado — haptics desabilitado
}

export async function hapticLight() {
  try {
    await Haptics?.impactAsync(Haptics.ImpactFeedbackStyle?.Light);
  } catch {}
}

export async function hapticMedium() {
  try {
    await Haptics?.impactAsync(Haptics.ImpactFeedbackStyle?.Medium);
  } catch {}
}

export async function hapticHeavy() {
  try {
    await Haptics?.impactAsync(Haptics.ImpactFeedbackStyle?.Heavy);
  } catch {}
}

export async function hapticSuccess() {
  try {
    await Haptics?.notificationAsync(Haptics.NotificationFeedbackType?.Success);
  } catch {}
}

export async function hapticError() {
  try {
    await Haptics?.notificationAsync(Haptics.NotificationFeedbackType?.Error);
  } catch {}
}
