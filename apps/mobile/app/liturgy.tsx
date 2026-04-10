import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, RefreshControl, ScrollView, StyleSheet, Text as RNText, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { AxiosError } from 'axios';
import { Box, Button, Icon, LiturgyText, Screen, Text, XpToast } from '../components/ui';
import { ConfettiOverlay } from '../components/ui/ConfettiOverlay';
import theme from '../constants/theme';
import { LiturgyAPI, StreakAPI } from '../services/api';
import { hapticSuccess, hapticMedium } from '../utils/haptics';
import { cancelStreakReminder } from '../hooks/useStreakNotification';

type LiturgyResponse = {
  date?: string;
  title?: string;
  reference?: string;
  gospel?: string;
  reflection?: string;
  psalm?: string;
  psalmReference?: string;
  firstReading?: string;
  firstReadingReference?: string;
  secondReading?: string;
  secondReadingReference?: string;
};

// ─── Saudação litúrgica (chamada e resposta) ──────────────────────────────────
//
// Estrutura da Missa:
//   Leituras:  "Palavra do Senhor." → "Graças a Deus."
//   Evangelho: "O Senhor esteja convosco." → "Ele está no meio de nós."
//              "Proclamação do Santo Evangelho…" → "Glória a vós, Senhor."
//              "Palavra da Salvação." → "Graças a Deus."

type GreetingLine = { minister: string; assembly: string };

type MassGreetingProps = {
  lines: GreetingLine[];
  closing?: GreetingLine;
};

function MassGreeting({ lines, closing }: MassGreetingProps) {
  return (
    <View style={greetingStyles.wrap}>
      {/* Linhas de chamada/resposta */}
      {lines.map((line, i) => (
        <View key={i} style={greetingStyles.row}>
          {/* Ministro */}
          <View style={greetingStyles.ministerRow}>
            <View style={greetingStyles.ministerDot} />
            <RNText style={greetingStyles.ministerText}>{line.minister}</RNText>
          </View>
          {/* Assembleia */}
          <View style={greetingStyles.assemblyRow}>
            <RNText style={greetingStyles.assemblyLabel}>℟</RNText>
            <RNText style={greetingStyles.assemblyText}>{line.assembly}</RNText>
          </View>
        </View>
      ))}

      {/* Linha de encerramento (depois da leitura) */}
      {closing && (
        <View style={[greetingStyles.wrap, greetingStyles.closingWrap]}>
          <View style={greetingStyles.ministerRow}>
            <View style={greetingStyles.ministerDot} />
            <RNText style={greetingStyles.ministerText}>{closing.minister}</RNText>
          </View>
          <View style={greetingStyles.assemblyRow}>
            <RNText style={greetingStyles.assemblyLabel}>℟</RNText>
            <RNText style={greetingStyles.assemblyText}>{closing.assembly}</RNText>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Seção de leitura ─────────────────────────────────────────────────────────

type SectionProps = {
  label: string;
  reference?: string;
  text: string;
  variant?: 'reading' | 'psalm';
  iconName?: string;
  greetingBefore?: GreetingLine[];
  closingGreeting?: GreetingLine;
};

function LiturgySection({
  label,
  reference,
  text,
  variant = 'reading',
  iconName = 'book-open-variant',
  greetingBefore,
  closingGreeting,
}: SectionProps) {
  return (
    <View style={styles.sectionCard}>
      {/* Cabeçalho */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconBox}>
          <Icon name={iconName} size={16} color="accent" />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="overline" color="accent">
            {label}
          </Text>
          {reference ? (
            <Text variant="bodyStrong" color="primary" mt="xs">
              {reference}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Saudação antes da leitura */}
      {greetingBefore && greetingBefore.length > 0 ? (
        <MassGreeting lines={greetingBefore} />
      ) : null}

      {/* Divisor */}
      <View style={styles.divider} />

      {/* Texto com versículos destacados */}
      <LiturgyText text={text} variant={variant} />

      {/* Aclamação de encerramento */}
      {closingGreeting ? (
        <View style={styles.closingContainer}>
          <View style={styles.divider} />
          <MassGreeting lines={[closingGreeting]} />
        </View>
      ) : null}
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function LiturgyScreen() {
  const [liturgy, setLiturgy] = useState<LiturgyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completeResult, setCompleteResult] = useState<{ totalMarked: number; contemplated: boolean } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpToast, setXpToast] = useState<{ xpGained: number; leveledUp: boolean; newLevelName: string | null; visible: boolean }>({
    xpGained: 0, leveledUp: false, newLevelName: null, visible: false,
  });

  // Animação de entrada do card de sucesso
  const successScale = useRef(new Animated.Value(0.85)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const load = async () => {
    setError(null);
    try {
      const response = await LiturgyAPI.getToday();
      setLiturgy(response.data ?? null);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string | string[] }>;
      const apiMessage = axiosError.response?.data?.message;
      const normalizedMessage = Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage;
      setLiturgy(null);
      setError(normalizedMessage ?? 'Não foi possível carregar a liturgia completa.');
    }
  };

  useEffect(() => {
    const init = async () => {
      // Carrega liturgia e verifica conclusão do dia em paralelo
      const [, completionRes] = await Promise.allSettled([
        load(),
        LiturgyAPI.getTodayCompletion(),
      ]);

      if (completionRes.status === 'fulfilled') {
        const data = completionRes.value.data;
        if (data?.completed) {
          setCompleted(true);
          setCompleteResult({
            totalMarked: data.totalMarked ?? 0,
            contemplated: data.contemplated ?? false,
          });
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleComplete = async (contemplated: boolean) => {
    setCompleting(true);
    try {
      const [completeRes] = await Promise.allSettled([
        LiturgyAPI.complete({ contemplated }),
        StreakAPI.checkIn(),
      ]);
      const result = completeRes.status === 'fulfilled' ? completeRes.value.data : null;
      const totalMarked = result?.totalMarked ?? 0;

      setCompleteResult({ totalMarked, contemplated });
      setCompleted(true);

      // Cancela notificação de risco de streak
      cancelStreakReminder();

      // Feedback tátil
      if (contemplated) {
        hapticSuccess();
      } else {
        hapticMedium();
      }

      // Animação de entrada do card de sucesso
      successScale.setValue(0.85);
      successOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(successOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();

      // Mostra toast de XP
      const xpData = result?.xp;
      if (xpData?.xpGained) {
        setXpToast({
          xpGained: xpData.xpGained,
          leveledUp: xpData.leveledUp ?? false,
          newLevelName: xpData.newLevelName ?? null,
          visible: true,
        });

        // Confetti ao subir de nível
        if (xpData.leveledUp) {
          setShowConfetti(true);
        }
      }
    } finally {
      setCompleting(false);
    }
  };

  // ── Saudações litúrgicas da Missa ──────────────────────────────────────────
  const readingClosing: GreetingLine = {
    minister: 'Palavra do Senhor.',
    assembly: 'Graças a Deus.',
  };

  const gospelGreeting: GreetingLine[] = [
    {
      minister: 'O Senhor esteja convosco.',
      assembly: 'Ele está no meio de nós.',
    },
    {
      minister: 'Proclamação do Santo Evangelho de Jesus Cristo.',
      assembly: 'Glória a vós, Senhor.',
    },
  ];

  const gospelClosing: GreetingLine = {
    minister: 'Palavra da Salvação.',
    assembly: 'Graças a Deus.',
  };

  return (
    <Screen backgroundColor="cardBlue">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Liturgia do Dia',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.white,
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        }}
      />

      {loading ? (
        <Box flex={1} justifyContent="center" alignItems="center" gap="md">
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text variant="muted" color="textMuted">
            Carregando liturgia...
          </Text>
        </Box>
      ) : error || !liturgy ? (
        <Box flex={1} justifyContent="center" px="lg">
          <Box bg="surface" borderRadius="xl" p="lg">
            <Box flexDirection="row" alignItems="center" gap="sm" mb="sm">
              <Icon name="alert-circle-outline" size={18} color="error" />
              <Text variant="label" color="error">
                Liturgia indisponível
              </Text>
            </Box>
            <Text variant="body" color="text">
              {error ?? 'Não foi possível carregar a liturgia agora.'}
            </Text>
            <Box mt="md" gap="sm">
              <Button variant="primary" onPress={onRefresh}>
                Atualizar
              </Button>
              <Pressable onPress={() => router.back()}>
                {({ pressed }) => (
                  <Box borderRadius="md" py="md" alignItems="center" style={{ opacity: pressed ? 0.7 : 1 }}>
                    <Text variant="bodyStrong" color="textMuted">
                      Voltar
                    </Text>
                  </Box>
                )}
              </Pressable>
            </Box>
          </Box>
        </Box>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />
          }
        >
          {/* ── Hero ── */}
          <View style={styles.heroCard}>
            <View style={styles.heroDecor} />
            <Text variant="overline" color="accentLight" mb="sm">
              Liturgia de hoje
            </Text>
            <Text variant="heading" color="white">
              {liturgy.title ?? 'Evangelho e meditação do dia'}
            </Text>
            {liturgy.reference ? (
              <View style={styles.heroRef}>
                <Icon name="book-cross" size={13} color="accentLight" />
                <Text variant="muted" color="accentLight" style={{ flex: 1 }}>
                  {liturgy.reference}
                </Text>
              </View>
            ) : null}
          </View>

          {/* ── Seções ── */}
          <View style={styles.sections}>

            {/* Primeira Leitura */}
            {liturgy.firstReading ? (
              <LiturgySection
                label="Primeira Leitura"
                reference={liturgy.firstReadingReference}
                text={liturgy.firstReading}
                iconName="book-open-outline"
                closingGreeting={readingClosing}
              />
            ) : null}

            {/* Salmo Responsorial — sem aclamações, pois já tem R: */}
            {liturgy.psalm ? (
              <LiturgySection
                label="Salmo Responsorial"
                reference={liturgy.psalmReference}
                text={liturgy.psalm}
                variant="psalm"
                iconName="music-note"
              />
            ) : null}

            {/* Segunda Leitura */}
            {liturgy.secondReading ? (
              <LiturgySection
                label="Segunda Leitura"
                reference={liturgy.secondReadingReference}
                text={liturgy.secondReading}
                iconName="book-open-page-variant-outline"
                closingGreeting={readingClosing}
              />
            ) : null}

            {/* Evangelho — com saudação completa antes e depois */}
            {liturgy.gospel ? (
              <LiturgySection
                label="Evangelho"
                reference={liturgy.reference}
                text={liturgy.gospel}
                iconName="book-cross"
                greetingBefore={gospelGreeting}
                closingGreeting={gospelClosing}
              />
            ) : null}

            {/* Reflexão */}
            {liturgy.reflection ? (
              <View style={styles.reflectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconBox, { backgroundColor: theme.colors.primaryDark }]}>
                    <Icon name="lightbulb-on-outline" size={16} color="accentLight" />
                  </View>
                  <Text variant="overline" color="accentLight">
                    Reflexão
                  </Text>
                </View>
                <View style={styles.dividerDark} />
                <RNText style={styles.reflectionText}>{liturgy.reflection}</RNText>
              </View>
            ) : null}

            {/* ── Card de conclusão ── */}
            {!completed ? (
              <View style={styles.completeCard}>
                <View style={styles.completeIconRow}>
                  <View style={styles.completeIconBox}>
                    <Icon name="book-cross" size={22} color="accent" />
                  </View>
                </View>
                <Text variant="subheading" color="primary" textAlign="center" mb="xs">
                  Concluiu a leitura?
                </Text>
                <Text variant="muted" color="textMuted" textAlign="center" mb="lg">
                  Registre sua leitura para atualizar o progresso da Bíblia e manter sua sequência.
                </Text>

                {/* Botão principal — lida */}
                <Pressable
                  onPress={() => handleComplete(false)}
                  disabled={completing}
                  style={({ pressed }) => [
                    styles.completeBtn,
                    { opacity: pressed || completing ? 0.8 : 1 },
                  ]}
                >
                  {completing ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <>
                      <Icon name="check-circle-outline" size={18} color="primary" />
                      <RNText style={styles.completeBtnText}>Marquei como lida</RNText>
                    </>
                  )}
                </Pressable>

                {/* Botão secundário — contemplada */}
                <Pressable
                  onPress={() => handleComplete(true)}
                  disabled={completing}
                  style={({ pressed }) => [
                    styles.contemplateBtn,
                    { opacity: pressed || completing ? 0.7 : 1 },
                  ]}
                >
                  <Icon name="hands-pray" size={16} color="primaryLight" />
                  <RNText style={styles.contemplateBtnText}>Li e contemplei</RNText>
                </Pressable>
              </View>
            ) : (
              /* ── Estado de sucesso (animado) ── */
              <Animated.View style={[styles.successCard, { opacity: successOpacity, transform: [{ scale: successScale }] }]}>
                <View style={styles.successIconBox}>
                  <Icon name="check-circle" size={32} color="success" />
                </View>
                <Text variant="subheading" color="primary" textAlign="center" mb="xs">
                  {completeResult?.contemplated ? 'Contemplação registrada!' : 'Leitura registrada!'}
                </Text>
                {completeResult?.totalMarked != null && completeResult.totalMarked > 0 ? (
                  <Text variant="muted" color="textMuted" textAlign="center">
                    {completeResult.totalMarked}{' '}
                    {completeResult.totalMarked === 1 ? 'passagem marcada' : 'passagens marcadas'} no progresso da Bíblia.
                  </Text>
                ) : (
                  <Text variant="muted" color="textMuted" textAlign="center">
                    Sequência atualizada. Continue amanhã!
                  </Text>
                )}
                <View style={styles.successDivider} />
                <View style={styles.successFooter}>
                  <Icon name="fire" size={15} color="streak" />
                  <Text variant="caption" color="streak">
                    Sua sequência foi contabilizada
                  </Text>
                </View>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      )}

      <XpToast
        xpGained={xpToast.xpGained}
        leveledUp={xpToast.leveledUp}
        newLevelName={xpToast.newLevelName}
        visible={xpToast.visible}
        onHide={() => setXpToast((prev) => ({ ...prev, visible: false }))}
      />

      <ConfettiOverlay
        visible={showConfetti}
        onHide={() => setShowConfetti(false)}
      />
    </Screen>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: theme.spacing.xl },

  heroCard: {
    backgroundColor: theme.colors.cardBlue,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing['2xl'],
    marginBottom: -theme.spacing.lg,
    overflow: 'hidden',
  },
  heroDecor: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -50,
    top: -70,
    backgroundColor: 'rgba(200,164,90,0.08)',
  },
  heroRef: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: theme.spacing.sm,
  },

  sections: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadii.xs,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  closingContainer: {
    marginTop: theme.spacing.sm,
  },

  // Card de conclusão
  completeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  completeIconRow: {
    marginBottom: theme.spacing.md,
  },
  completeIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtn: {
    width: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadii.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
    minHeight: 48,
  },
  completeBtnText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  contemplateBtn: {
    width: '100%',
    backgroundColor: theme.colors.backgroundSoft,
    borderRadius: theme.borderRadii.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 48,
  },
  contemplateBtnText: {
    color: theme.colors.primaryLight,
    fontWeight: '600',
    fontSize: 15,
  },

  // Estado de sucesso
  successCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: theme.colors.success,
  },
  successIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  successDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    width: '100%',
    marginVertical: theme.spacing.md,
  },
  successFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Reflexão
  reflectionCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
  },
  dividerDark: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: theme.spacing.md,
  },
  reflectionText: {
    fontSize: 15,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
  },
});

// ─── Estilos das saudações ────────────────────────────────────────────────────

const greetingStyles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  closingWrap: {
    marginTop: theme.spacing.xs,
    marginBottom: 0,
  },
  row: {
    gap: 4,
  },
  ministerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ministerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
    marginTop: 6,
    flexShrink: 0,
  },
  ministerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  assemblyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 14,
  },
  assemblyLabel: {
    fontSize: 13,
    color: theme.colors.accent,
    fontWeight: '700',
    lineHeight: 20,
    flexShrink: 0,
  },
  assemblyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
