import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { AxiosError } from 'axios';
import { router } from 'expo-router';
import { Box, Button, Card, DailyHistoryCalendar, Divider, Icon, Logo, Screen, Text, WeeklyChallengesCard } from '../../components/ui';
import { HomeScreenSkeleton } from '../../components/ui/SkeletonLoader';
import theme from '../../constants/theme';
import { useWeeklyChallenges } from '../../hooks/useWeeklyChallenges';
import { useStreakNotification } from '../../hooks/useStreakNotification';
import { useReminders, formatDaysOfWeek } from '../../hooks/useReminders';
import { useGoals, getGoalLabel } from '../../hooks/useGoals';
import { LiturgyAPI, SessionsAPI, StreakAPI, UsersAPI } from '../../services/api';

function getPreview(text?: string, limit = 160) {
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getGreetingIcon() {
  const hour = new Date().getHours();
  if (hour < 12) return 'weather-sunny';
  if (hour < 18) return 'weather-partly-cloudy';
  return 'weather-night';
}

export default function HomeScreen() {
  const [liturgy, setLiturgy] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [todaySummary, setTodaySummary] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liturgyError, setLiturgyError] = useState<string | null>(null);
  const { challenges } = useWeeklyChallenges();
  const { reminders } = useReminders();
  const { goals } = useGoals();

  // Animação de flame pulsando quando streak > 7
  const flamePulse = useRef(new Animated.Value(1)).current;
  const streakDays: number = streak?.currentStreak ?? 0;
  const checkedInToday: boolean = Boolean(todaySummary?.liturgyCompleted || todaySummary?.sessionsCompleted > 0);

  // Push notification de risco de streak
  useStreakNotification(streakDays, checkedInToday);

  useEffect(() => {
    if (streakDays > 7) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(flamePulse, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(flamePulse, { toValue: 0.85, duration: 600, useNativeDriver: true }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    } else {
      flamePulse.setValue(1);
    }
  }, [streakDays]);

  const load = async () => {
    setLiturgyError(null);

    const [litRes, strRes, summaryRes, activityRes] = await Promise.allSettled([
      LiturgyAPI.getToday(),
      StreakAPI.getMe(),
      SessionsAPI.summary(1),
      UsersAPI.getActivity(7),
    ]);

    if (litRes.status === 'fulfilled') {
      setLiturgy(litRes.value.data);
    } else {
      const axiosError = litRes.reason as AxiosError<{ message?: string | string[] }>;
      const apiMessage = axiosError.response?.data?.message;
      const normalizedMessage = Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage;
      setLiturgy(null);
      setLiturgyError(normalizedMessage ?? 'Nao foi possivel carregar a liturgia do dia.');
    }

    setStreak(strRes.status === 'fulfilled' ? strRes.value.data : null);
    setTodaySummary(summaryRes.status === 'fulfilled' ? (summaryRes.value.data?.[0] ?? null) : null);
    setActivity(activityRes.status === 'fulfilled' ? (activityRes.value.data ?? []) : []);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Screen backgroundColor="primary">
        <HomeScreenSkeleton />
      </Screen>
    );
  }

  const actions = [
    {
      title: 'Rotinas',
      subtitle: 'Monte seu plano diario',
      icon: 'calendar-clock-outline',
      iconBg: 'rgba(200,164,90,0.18)',
      bg: '#274868',
      onPress: () => router.push('/routines'),
    },
    {
      title: 'Terco do dia',
      subtitle: 'Oracao guiada no seu ritmo',
      icon: 'hands-pray',
      iconBg: 'rgba(200,164,90,0.18)',
      bg: '#1D4267',
      onPress: () => router.push('/(tabs)/rosary'),
    },
    {
      title: 'Biblia',
      subtitle: 'Continue de onde parou',
      icon: 'book-open-variant',
      iconBg: 'rgba(22,50,79,0.12)',
      bg: '#EDE3CE',
      dark: false,
      onPress: () => router.push('/(tabs)/bible'),
    },
    {
      title: 'Comunidade',
      subtitle: 'Reze por intencoes',
      icon: 'hand-heart-outline',
      iconBg: 'rgba(230,201,141,0.15)',
      bg: '#254E72',
      onPress: () => router.push('/(tabs)/community'),
    },
  ];

  return (
    <Screen backgroundColor="primary">
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.primary }}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />
        }
      >
        <Box px="lg" pt="lg">
          <Box style={styles.heroCard}>
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <Box flexDirection="row" alignItems="center" gap="xs" mb="sm">
              <Icon name={getGreetingIcon()} size={16} color="accentLight" />
              <Text variant="overline" color="accentLight">
                {getGreeting()}
              </Text>
            </Box>
            <Text variant="hero" color="white" mb="xs">
              Sanctum
            </Text>
            <Text variant="muted" color="white" opacity={0.65}>
              Sua jornada espiritual diaria
            </Text>

            <Box flexDirection="row" gap="sm" mt="lg">
              <Box style={styles.statCard}>
                <Box flexDirection="row" alignItems="center" gap="xs" mb="xs">
                  <Animated.View style={{ transform: [{ scale: flamePulse }] }}>
                    <Icon name="fire" size={15} color="accent" />
                  </Animated.View>
                  <Text variant="overline" color="accentLight">
                    Sequencia
                  </Text>
                </Box>
                <Text variant="heading" color="white">
                  {streak?.currentStreak ?? 0}
                  <Text variant="muted" color="white" opacity={0.6}>
                    {' '}dias
                  </Text>
                </Text>
              </Box>

              <Box style={styles.statCard}>
                <Box flexDirection="row" alignItems="center" gap="xs" mb="xs">
                  <Icon name="shield-check-outline" size={15} color="accent" />
                  <Text variant="overline" color="accentLight">
                    Escudos
                  </Text>
                </Box>
                <Text variant="heading" color="white">
                  {streak?.shields ?? 0}
                </Text>
              </Box>
            </Box>
          </Box>

          <Divider marginVertical="lg" />

          <Box mt="lg">
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="md">
              <Text variant="subheading" color="white">
                Atalhos Rápidos
              </Text>
            </Box>

            <Box gap="sm">
              {actions.map((action) => (
                <Pressable key={action.title} onPress={action.onPress}>
                  {({ pressed }) => (
                    <Box
                      style={[
                        styles.actionCard,
                        { backgroundColor: action.bg, opacity: pressed ? 0.88 : 1 },
                      ]}
                    >
                      <Box
                        width={44}
                        height={44}
                        borderRadius="md"
                        alignItems="center"
                        justifyContent="center"
                        style={{ backgroundColor: action.iconBg }}
                      >
                        <Icon
                          name={action.icon}
                          size={22}
                          color={action.dark === false ? 'primary' : 'accentLight'}
                        />
                      </Box>
                      <Box flex={1}>
                        <Text
                          variant="bodyStrong"
                          style={{ color: action.dark === false ? theme.colors.primary : '#fff' }}
                        >
                          {action.title}
                        </Text>
                        <Text
                          variant="caption"
                          style={{
                            color: action.dark === false ? theme.colors.textMuted : 'rgba(255,255,255,0.65)',
                            marginTop: 2,
                          }}
                        >
                          {action.subtitle}
                        </Text>
                      </Box>
                      <Icon
                        name="chevron-right"
                        size={20}
                        color={action.dark === false ? 'textMuted' : 'accentLight'}
                      />
                    </Box>
                  )}
                </Pressable>
              ))}
            </Box>
          </Box>

          <Box mt="xl">
            <Box style={styles.todayCard}>
              <Box flexDirection="row" alignItems="center" gap="sm" mb="md">
                <Box style={styles.todayIconBox}>
                  <Icon name="calendar-check-outline" size={16} color="accent" />
                </Box>
                <Box>
                  <Text variant="subheading" color="white">
                    Hoje no Sanctum
                  </Text>
                  <Text variant="caption" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Resumo das suas praticas
                  </Text>
                </Box>
              </Box>

              <Box flexDirection="row" gap="sm">
                <Box style={styles.todayStat}>
                  <Text variant="heading" color="white">
                    {todaySummary?.sessionsCompleted ?? 0}
                  </Text>
                  <Text variant="caption" style={styles.todayStatLabel}>
                    Sessoes
                  </Text>
                </Box>
                <Box style={styles.todayStat}>
                  <Text variant="heading" color="white">
                    {todaySummary?.minutesPrayed ?? 0}
                  </Text>
                  <Text variant="caption" style={styles.todayStatLabel}>
                    Minutos
                  </Text>
                </Box>
                <Box style={styles.todayStat}>
                  <Text variant="heading" color="white">
                    {todaySummary?.xpEarned ?? 0}
                  </Text>
                  <Text variant="caption" style={styles.todayStatLabel}>
                    XP hoje
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>

          {challenges.length > 0 && (
            <Box mt="xl">
              <WeeklyChallengesCard challenges={challenges} />
            </Box>
          )}

          {activity.length > 0 && (
            <Box mt="xl">
              <Box style={styles.activityCard}>
                <Box flexDirection="row" alignItems="center" gap="sm" mb="md">
                  <Icon name="chart-bubble" size={18} color="accent" />
                  <Text variant="subheading" color="white">
                    Sua atividade
                  </Text>
                </Box>
                <DailyHistoryCalendar data={activity} />
              </Box>
            </Box>
          )}

          {reminders.filter((r) => r.isEnabled).length > 0 && (
            <Box mt="xl">
              <Pressable onPress={() => router.push('/reminders')}>
                {({ pressed }) => (
                  <Box style={{ opacity: pressed ? 0.93 : 1 }}>
                    <Box style={styles.reminderCard}>
                      <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="sm">
                        <Box flexDirection="row" alignItems="center" gap="sm">
                          <Icon name="bell-outline" size={18} color="accent" />
                          <Text variant="subheading" color="white">
                            Proximos lembretes
                          </Text>
                        </Box>
                        <Icon name="chevron-right" size={20} color="accentLight" />
                      </Box>
                      <Box gap="xs">
                        {reminders
                          .filter((r) => r.isEnabled)
                          .slice(0, 2)
                          .map((reminder) => (
                            <Box key={reminder.id} flexDirection="row" alignItems="center" gap="sm">
                              <Box
                                width={28}
                                height={28}
                                borderRadius="sm"
                                alignItems="center"
                                justifyContent="center"
                                style={{ backgroundColor: 'rgba(200,164,90,0.15)' }}
                              >
                                <Icon name="clock-outline" size={14} color="accent" />
                              </Box>
                              <Box flex={1}>
                                <Text variant="caption" color="accentLight" numberOfLines={1}>
                                  {reminder.title} • {reminder.timeOfDay}
                                </Text>
                              </Box>
                            </Box>
                          ))}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Pressable>
            </Box>
          )}

          {goals.filter((g) => g.isActive).length > 0 && (
            <Box mt="xl">
              <Pressable onPress={() => router.push('/goals')}>
                {({ pressed }) => (
                  <Box style={{ opacity: pressed ? 0.93 : 1 }}>
                    <Box style={styles.goalsCard}>
                      <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="sm">
                        <Box flexDirection="row" alignItems="center" gap="sm">
                          <Icon name="target-outline" size={18} color="white" />
                          <Text variant="subheading" color="white">
                            Suas metas
                          </Text>
                        </Box>
                        <Box opacity={0.7}>
                          <Icon name="chevron-right" size={20} color="white" />
                        </Box>
                      </Box>
                      <Box gap="xs">
                        {goals
                          .filter((g) => g.isActive)
                          .slice(0, 2)
                          .map((goal) => (
                            <Box key={goal.id} flexDirection="row" alignItems="center" justifyContent="space-between">
                              <Text variant="caption" color="white" opacity={0.8}>
                                {getGoalLabel(goal.goalType)}
                              </Text>
                              <Box
                                style={{
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  backgroundColor: 'rgba(255,255,255,0.15)',
                                  borderRadius: 6,
                                }}
                              >
                                <Text variant="caption" color="white" style={{ fontWeight: '600' }}>
                                  {goal.targetValue}
                                </Text>
                              </Box>
                            </Box>
                          ))}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Pressable>
            </Box>
          )}

          <Divider marginVertical="lg" />

          <Box mt="lg">
            <Box flexDirection="row" alignItems="center" gap="sm" mb="md">
              <Text variant="subheading" color="white">
                Liturgia do Dia
              </Text>
            </Box>

            {liturgy ? (
              <Pressable onPress={() => router.push('/liturgy')}>
                {({ pressed }) => (
                  <Box style={{ opacity: pressed ? 0.93 : 1 }}>
                    <Card variant="elevated">
                    <Box flexDirection="row" alignItems="center" gap="sm" mb="md">
                      <Box
                        width={36}
                        height={36}
                        borderRadius="sm"
                        alignItems="center"
                        justifyContent="center"
                        style={{ backgroundColor: theme.colors.accentMuted }}
                      >
                        <Icon name="book-cross" size={18} color="accent" />
                      </Box>
                      <Box flex={1}>
                        <Text variant="overline" color="textMuted">
                          Evangelho do Dia
                        </Text>
                        <Text variant="bodyStrong" color="primary" numberOfLines={1}>
                          {liturgy.reference ?? 'Meditacao diaria'}
                        </Text>
                      </Box>
                    </Box>

                    <Text variant="body" color="text" numberOfLines={4} style={{ lineHeight: 22 }}>
                      {getPreview(liturgy.gospel)}
                    </Text>

                    {liturgy.reflection ? (
                      <Box mt="md" pt="md" style={{ borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                        <Text variant="muted" color="textMuted" numberOfLines={2}>
                          {getPreview(liturgy.reflection, 110)}
                        </Text>
                      </Box>
                    ) : null}

                    <Box mt="md" flexDirection="row" alignItems="center" justifyContent="space-between">
                      <Text variant="bodyStrong" color="primary">
                        Ler liturgia completa
                      </Text>
                      <Box
                        width={32}
                        height={32}
                        borderRadius="sm"
                        alignItems="center"
                        justifyContent="center"
                        style={{ backgroundColor: theme.colors.accentMuted }}
                      >
                        <Icon name="arrow-right" size={18} color="accent" />
                      </Box>
                    </Box>
                    </Card>
                  </Box>
                )}
              </Pressable>
            ) : (
              <Card variant="elevated">
                <Box flexDirection="row" alignItems="center" gap="sm" mb="sm">
                  <Box
                    width={36}
                    height={36}
                    borderRadius="sm"
                    alignItems="center"
                    justifyContent="center"
                    style={{ backgroundColor: theme.colors.errorLight }}
                  >
                    <Icon name="alert-circle-outline" size={18} color="error" />
                  </Box>
                  <Text variant="label" color="error">
                    Liturgia indisponivel
                  </Text>
                </Box>
                <Text variant="muted" color="text" mb="md">
                  {liturgyError ?? 'Nao foi possivel carregar a liturgia agora.'}
                </Text>
                <Button variant="primary" onPress={onRefresh}>
                  Tentar novamente
                </Button>
              </Card>
            )}
          </Box>
        </Box>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: theme.colors.cardBlue,
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -60,
    top: -80,
    backgroundColor: 'rgba(200,164,90,0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    left: -30,
    bottom: -40,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  statCard: {
    flex: 1,
    borderRadius: theme.borderRadii.md,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionCard: {
    borderRadius: theme.borderRadii.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  todayCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(200,164,90,0.2)',
  },
  todayIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayStat: {
    flex: 1,
    borderRadius: theme.borderRadii.md,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  todayStatLabel: {
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  liturgyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  reminderCard: {
    backgroundColor: 'rgba(29, 66, 103, 0.8)',
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(200,164,90,0.2)',
  },
  goalsCard: {
    backgroundColor: 'rgba(200, 164, 90, 0.15)',
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(200,164,90,0.3)',
  },
  activityCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(200,164,90,0.2)',
  },
});
