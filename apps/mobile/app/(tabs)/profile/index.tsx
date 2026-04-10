import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, RefreshControl, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { Box, Button, Icon, Screen, Text, WeeklyActivityChart } from '../../../components/ui';
import { ProfileScreenSkeleton } from '../../../components/ui/SkeletonLoader';
import theme from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useUserStats } from '../../../hooks/useUserStats';
import { StreakAPI, UsersAPI } from '../../../services/api';

type StatCardProps = {
  iconName: string;
  value: number | string;
  label: string;
  iconBg: string;
  iconColor: string;
};

type RankingMetric = 'streak' | 'xp' | 'bible' | 'contemplation';
type RankingPeriod = 'week' | 'month' | 'allTime';

type RankingEntry = {
  rank: number;
  metric: RankingMetric;
  period: RankingPeriod;
  value: number;
  trendingDelta: number | null;
  isCurrentUser: boolean;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    xp: number;
    level: number;
    levelName: string;
  };
  currentStreak?: number;
  longestStreak?: number;
  xp?: number;
  chaptersRead?: number;
  contemplations?: number;
};

type ActivityDay = {
  date: string;
  completed: boolean;
  contemplated: boolean;
  xpEarned: number;
};

function StatCard({ iconName, value, label, iconBg, iconColor }: StatCardProps) {
  return (
    <Box flex={1} style={styles.statCard}>
      <Box
        width={36}
        height={36}
        borderRadius="sm"
        alignItems="center"
        justifyContent="center"
        mb="sm"
        style={{ backgroundColor: iconBg }}
      >
        <Icon name={iconName} size={18} color={iconColor as any} />
      </Box>
      <Text variant="heading" color="primary">
        {value}
      </Text>
      <Text variant="caption" color="textMuted" mt="xs">
        {label}
      </Text>
    </Box>
  );
}

const MEDAL_COLORS = ['#C8A45A', '#9EA3AB', '#CD7F32'];
const MEDAL_ICONS = ['trophy', 'medal', 'medal-outline'];

const LEVEL_ICONS: Record<number, string> = {
  1: 'star-outline',
  2: 'star-half-full',
  3: 'star',
  4: 'shield-star-outline',
  5: 'shield-star',
  6: 'cross-outline',
  7: 'fire',
  8: 'crown-outline',
  9: 'crown',
  10: 'fleur-de-lis',
};

const METRIC_OPTIONS: Array<{ key: RankingMetric; label: string; icon: string }> = [
  { key: 'streak', label: 'Streak', icon: 'fire' },
  { key: 'xp', label: 'XP', icon: 'star' },
  { key: 'bible', label: 'Biblia', icon: 'book-open-variant' },
  { key: 'contemplation', label: 'Contem.', icon: 'hands-pray' },
];

const PERIOD_OPTIONS: Array<{ key: RankingPeriod; label: string }> = [
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'allTime', label: 'Geral' },
];

function getMetricValue(entry: RankingEntry) {
  if (entry.metric === 'xp') return `${entry.xp ?? entry.value} XP`;
  if (entry.metric === 'bible') return `${entry.chaptersRead ?? entry.value} caps`;
  if (entry.metric === 'contemplation') return `${entry.contemplations ?? entry.value} oracoes`;
  return `${entry.currentStreak ?? entry.value} dias`;
}

function getMetricIcon(metric: RankingMetric) {
  if (metric === 'xp') return 'star';
  if (metric === 'bible') return 'book-open-variant';
  if (metric === 'contemplation') return 'hands-pray';
  return 'fire';
}

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const { gamification, badges, loading: statsLoading } = useUserStats();
  const [stats, setStats] = useState<any>(null);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [badgesExpanded, setBadgesExpanded] = useState(false);
  const [rankingMetric, setRankingMetric] = useState<RankingMetric>('streak');
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>('week');
  const xpBarAnim = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    if (!isAuthenticated) return;

    const [rankingResult, statsResult, activityResult] = await Promise.allSettled([
      StreakAPI.getRanking(rankingMetric, rankingPeriod),
      UsersAPI.getStats(),
      UsersAPI.getActivity(7),
    ]);

    setRanking(rankingResult.status === 'fulfilled' ? (rankingResult.value.data ?? []) : []);
    setStats(statsResult.status === 'fulfilled' ? statsResult.value.data : null);
    setActivity(activityResult.status === 'fulfilled' ? (activityResult.value.data ?? []) : []);
  }, [isAuthenticated, rankingMetric, rankingPeriod]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    load().finally(() => setLoading(false));
  }, [isAuthenticated, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => {
    if (!statsLoading && gamification) {
      setStats((prev: any) => ({ ...prev, gamification }));
      // Anima a barra de XP ao carregar
      xpBarAnim.setValue(0);
      Animated.timing(xpBarAnim, {
        toValue: gamification.xpProgress,
        duration: 900,
        delay: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [statsLoading, gamification]);

  const handleShareStreak = async () => {
    const days = stats?.streak?.currentStreak ?? 0;
    const level = gamification?.levelName ?? 'Fiel';
    try {
      await Share.share({
        message: `Estou no dia ${days} da minha jornada espiritual no Sanctum! 🙏🔥\nNível: ${level}\nJunte-se a mim!`,
        title: 'Minha jornada no Sanctum',
      });
    } catch {
      // Silencioso
    }
  };

  if (loading || statsLoading) {
    return (
      <Screen>
        <ProfileScreenSkeleton />
      </Screen>
    );
  }

  const initials =
    (user?.name ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n: string) => n[0]?.toUpperCase() ?? '')
      .join('') || '?';

  const gm = gamification;
  const unlockedBadges = badges.filter((b) => b.unlocked);
  const lockedBadges = badges.filter((b) => !b.unlocked);
  const displayedBadges = badgesExpanded ? badges : [...unlockedBadges, ...lockedBadges].slice(0, 6);
  const levelIcon = LEVEL_ICONS[gm?.level ?? 1] ?? 'star-outline';
  const topRanking = ranking.filter((entry) => !entry.isCurrentUser).slice(0, 10);
  const currentUserRanking = ranking.find((entry) => entry.isCurrentUser) ?? null;

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Box style={styles.profileHeader}>
          <Link href="profile/settings" asChild>
            <TouchableOpacity style={styles.headerButton} hitSlop={8}>
              <Icon name="cog-outline" size={24} color="accent" />
            </TouchableOpacity>
          </Link>
          <View style={styles.decorBubble} />
          <Box alignItems="center">
            <Box style={styles.avatarRing}>
              <Box style={styles.avatar}>
                <Text variant="title" color="primary">
                  {initials}
                </Text>
              </Box>
            </Box>
            <Text variant="heading" color="white" mt="md">
              {user?.name}
            </Text>
            <Box flexDirection="row" alignItems="center" gap="xs" mt="xs">
              <Icon name="email-outline" size={13} color="accentLight" />
              <Text variant="caption" color="accentLight" opacity={0.8}>
                {user?.email}
              </Text>
            </Box>
            {gm && (
              <Box style={styles.levelBadge} flexDirection="row" alignItems="center" gap="xs" mt="sm">
                <Icon name={levelIcon} size={13} color="#C8A45A" />
                <Text style={styles.levelBadgeText}>
                  Nivel {gm.level} - {gm.levelName}
                </Text>
              </Box>
            )}

            {/* Botão de compartilhar streak */}
            {(stats?.streak?.currentStreak ?? 0) > 0 && (
              <TouchableOpacity onPress={handleShareStreak} style={styles.shareBtn} activeOpacity={0.75}>
                <Icon name="share-variant-outline" size={14} color="accent" />
                <Text style={styles.shareBtnText}>
                  Compartilhar {stats?.streak?.currentStreak} dias
                </Text>
              </TouchableOpacity>
            )}
          </Box>
        </Box>

        <Box px="md" style={{ marginTop: -16 }}>
          {gm && (
            <Box style={styles.sectionCard} mb="md">
              <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="md">
                <Box flexDirection="row" alignItems="center" gap="sm">
                  <Box style={[styles.levelIconBox, { backgroundColor: theme.colors.accentMuted }]}>
                    <Icon name={levelIcon} size={18} color="accent" />
                  </Box>
                  <Box>
                    <Text variant="subheading" color="primary">
                      {gm.levelName}
                    </Text>
                    <Text variant="caption" color="textMuted">
                      Nivel {gm.level}
                    </Text>
                  </Box>
                </Box>
                <Box alignItems="flex-end">
                  <Text variant="heading" color="accent">
                    {gm.xp} XP
                  </Text>
                  {gm.xpForNextLevel && (
                    <Text variant="caption" color="textMuted">
                      prox. nivel: {gm.xpForNextLevel} XP
                    </Text>
                  )}
                </Box>
              </Box>

              <View style={[styles.progressTrack, { marginBottom: 4 }]}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: xpBarAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: theme.colors.accent,
                    },
                  ]}
                />
              </View>
              <Box flexDirection="row" justifyContent="space-between">
                <Text variant="caption" color="textMuted">
                  {gm.xp - gm.xpForCurrentLevel} XP neste nivel
                </Text>
                {gm.xpForNextLevel && (
                  <Text variant="caption" color="textMuted">
                    {gm.xpForNextLevel - gm.xp} XP para subir
                  </Text>
                )}
              </Box>

              <Box
                flexDirection="row"
                gap="xs"
                mt="md"
                pt="md"
                style={{ borderTopWidth: 1, borderTopColor: theme.colors.border }}
              >
                <Box flex={1} alignItems="center">
                  <Text variant="bodyStrong" color="primary">{gm.totalLiturgyRead}</Text>
                  <Text variant="caption" color="textMuted" style={{ textAlign: 'center' }}>Liturgias</Text>
                </Box>
                <Box style={styles.statDivider} />
                <Box flex={1} alignItems="center">
                  <Text variant="bodyStrong" color="primary">{gm.totalBibleChapters}</Text>
                  <Text variant="caption" color="textMuted" style={{ textAlign: 'center' }}>Capitulos</Text>
                </Box>
                <Box style={styles.statDivider} />
                <Box flex={1} alignItems="center">
                  <Text variant="bodyStrong" color="primary">{gm.totalContemplated}</Text>
                  <Text variant="caption" color="textMuted" style={{ textAlign: 'center' }}>Contemplacoes</Text>
                </Box>
                <Box style={styles.statDivider} />
                <Box flex={1} alignItems="center">
                  <Text variant="bodyStrong" color="primary">{gm.totalRosaries}</Text>
                  <Text variant="caption" color="textMuted" style={{ textAlign: 'center' }}>Tercos</Text>
                </Box>
              </Box>
            </Box>
          )}

          {activity.length > 0 && (
            <Box style={styles.sectionCard} mb="md">
              <Box flexDirection="row" alignItems="center" gap="sm" mb="md">
                <Icon name="chart-bubble" size={18} color="accent" />
                <Text variant="subheading" color="primary">
                  Atividade Semanal
                </Text>
              </Box>
              <WeeklyActivityChart activity={activity} />
            </Box>
          )}

          {badges.length > 0 && (
            <Box style={styles.sectionCard} mb="md">
              <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="md">
                <Box flexDirection="row" alignItems="center" gap="sm">
                  <Icon name="trophy-outline" size={18} color="accent" />
                  <Text variant="subheading" color="primary">
                    Conquistas
                  </Text>
                  {unlockedBadges.length > 0 && (
                    <Box style={styles.badgeCountPill}>
                      <Text style={styles.badgeCountText}>{unlockedBadges.length}/{badges.length}</Text>
                    </Box>
                  )}
                </Box>
                <TouchableOpacity onPress={() => setBadgesExpanded((v) => !v)}>
                  <Text variant="caption" color="accent">
                    {badgesExpanded ? 'Ver menos' : 'Ver todas'}
                  </Text>
                </TouchableOpacity>
              </Box>

              <Box flexDirection="row" flexWrap="wrap" gap="sm">
                {displayedBadges.map((badge) => (
                  <Box
                    key={badge.id}
                    style={[
                      styles.badgeCard,
                      !badge.unlocked && styles.badgeCardLocked,
                    ]}
                    alignItems="center"
                  >
                    <Box
                      width={40}
                      height={40}
                      borderRadius="full"
                      alignItems="center"
                      justifyContent="center"
                      mb="xs"
                      style={{
                        backgroundColor: badge.unlocked
                          ? theme.colors.accentMuted
                          : theme.colors.border,
                      }}
                    >
                      <Icon
                        name={badge.icon}
                        size={20}
                        color={badge.unlocked ? 'accent' : 'textMuted'}
                      />
                    </Box>
                    <Text
                      variant="caption"
                      style={[
                        styles.badgeName,
                        { color: badge.unlocked ? theme.colors.text : theme.colors.textMuted },
                      ]}
                    >
                      {badge.name}
                    </Text>
                    {!badge.unlocked && (
                      <Icon name="lock-outline" size={10} color="textMuted" />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {stats?.streak && (
            <Box style={styles.sectionCard} mb="md">
              <Box flexDirection="row" alignItems="center" gap="sm" mb="md">
                <Icon name="fire" size={18} color="streak" />
                <Text variant="subheading" color="primary">
                  Sequencia
                </Text>
              </Box>
              <Box flexDirection="row" gap="sm">
                <StatCard
                  iconName="fire"
                  value={stats.streak.currentStreak}
                  label="Atual"
                  iconBg={theme.colors.streakLight}
                  iconColor="streak"
                />
                <StatCard
                  iconName="trophy-outline"
                  value={stats.streak.longestStreak}
                  label="Recorde"
                  iconBg={theme.colors.accentMuted}
                  iconColor="accent"
                />
                <StatCard
                  iconName="shield-check-outline"
                  value={stats.streak.shields}
                  label="Escudos"
                  iconBg={theme.colors.successLight}
                  iconColor="success"
                />
              </Box>
            </Box>
          )}

          <Box style={styles.sectionCard} mb="md">
            <Box flexDirection="row" alignItems="center" gap="sm" mb="md">
              <Icon name="podium" size={18} color="accent" />
              <Text variant="subheading" color="primary">
                Leaderboard
              </Text>
            </Box>

            <Box flexDirection="row" gap="xs" mb="sm" style={styles.chipWrap}>
              {METRIC_OPTIONS.map((option) => {
                const active = option.key === rankingMetric;
                return (
                  <TouchableOpacity key={option.key} onPress={() => setRankingMetric(option.key)}>
                    <Box style={[styles.chip, active && styles.chipActive]} flexDirection="row" alignItems="center" gap="xs">
                      <Icon name={option.icon} size={12} color={active ? 'primary' : 'textMuted'} />
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
                    </Box>
                  </TouchableOpacity>
                );
              })}
            </Box>

            <Box flexDirection="row" gap="xs" mb="md">
              {PERIOD_OPTIONS.map((option) => {
                const active = option.key === rankingPeriod;
                return (
                  <TouchableOpacity key={option.key} onPress={() => setRankingPeriod(option.key)}>
                    <Box style={[styles.periodChip, active && styles.periodChipActive]}>
                      <Text style={[styles.periodChipText, active && styles.periodChipTextActive]}>{option.label}</Text>
                    </Box>
                  </TouchableOpacity>
                );
              })}
            </Box>

            <Box gap="xs">
              {topRanking.map((entry, index) => {
                const isMedal = index < 3;
                return (
                  <Box
                    key={`${entry.user.id}-${entry.metric}-${entry.period}`}
                    style={[styles.rankingRow, entry.isCurrentUser && styles.rankingRowMe]}
                  >
                    <Box
                      width={28}
                      height={28}
                      borderRadius="full"
                      alignItems="center"
                      justifyContent="center"
                      style={{
                        backgroundColor: isMedal
                          ? `${MEDAL_COLORS[index]}20`
                          : theme.colors.surfaceMuted,
                      }}
                    >
                      {isMedal ? (
                        <Icon name={MEDAL_ICONS[index]} size={14} color={MEDAL_COLORS[index] as any} />
                      ) : (
                        <Text variant="caption" color="textMuted" style={{ fontWeight: '700' }}>
                          {entry.rank}
                        </Text>
                      )}
                    </Box>

                    <Box flex={1}>
                      <Box flexDirection="row" alignItems="center" gap="xs">
                        <Text variant="body" color="text">
                          {entry.user.name}
                        </Text>
                        <Icon
                          name={LEVEL_ICONS[entry.user.level] ?? 'star-outline'}
                          size={12}
                          color="accent"
                        />
                      </Box>
                      <Text variant="caption" color="textMuted">
                        Nivel {entry.user.level} - {entry.user.levelName}
                      </Text>
                    </Box>

                    <Box alignItems="flex-end">
                      <Box flexDirection="row" alignItems="center" gap="xs">
                        <Icon name={getMetricIcon(entry.metric)} size={13} color="accent" />
                        <Text variant="bodyStrong" color="primary">
                          {getMetricValue(entry)}
                        </Text>
                      </Box>
                      {entry.trendingDelta !== null && (
                        <Box flexDirection="row" alignItems="center" gap="xs" mt="xs">
                          <Icon
                            name={
                              entry.trendingDelta < 0
                                ? 'arrow-up'
                                : entry.trendingDelta > 0
                                  ? 'arrow-down'
                                  : 'minus'
                            }
                            size={11}
                            color={
                              entry.trendingDelta < 0
                                ? 'success'
                                : entry.trendingDelta > 0
                                  ? 'error'
                                  : 'textMuted'
                            }
                          />
                          <Text variant="caption" color="textMuted">
                            {entry.trendingDelta === 0 ? 'estavel' : `${Math.abs(entry.trendingDelta)} pos`}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {currentUserRanking && !topRanking.some((entry) => entry.user.id === currentUserRanking.user.id) && (
              <Box mt="md" pt="md" style={{ borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                <Text variant="caption" color="textMuted" mb="sm">
                  Sua posicao
                </Text>
                <Box style={[styles.rankingRow, styles.rankingRowMe]}>
                  <Box
                    width={28}
                    height={28}
                    borderRadius="full"
                    alignItems="center"
                    justifyContent="center"
                    style={{ backgroundColor: theme.colors.accentMuted }}
                  >
                    <Text variant="caption" color="accent" style={{ fontWeight: '700' }}>
                      {currentUserRanking.rank}
                    </Text>
                  </Box>
                  <Box flex={1}>
                    <Text variant="body" color="text">
                      {currentUserRanking.user.name} (voce)
                    </Text>
                    <Text variant="caption" color="textMuted">
                      Nivel {currentUserRanking.user.level} - {currentUserRanking.user.levelName}
                    </Text>
                  </Box>
                  <Text variant="bodyStrong" color="primary">
                    {getMetricValue(currentUserRanking)}
                  </Text>
                </Box>
              </Box>
            )}
          </Box>

          <Box pb="xl">
            <Button variant="ghost" onPress={logout}>
              Sair da conta
            </Button>
          </Box>
        </Box>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    position: 'absolute',
    top: theme.spacing.xl,
    right: theme.spacing.xl,
    zIndex: 10,
  },
  profileHeader: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing['2xl'],
    overflow: 'hidden',
  },
  decorBubble: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -60,
    top: -80,
    backgroundColor: 'rgba(200,164,90,0.08)',
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(200,164,90,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    backgroundColor: 'rgba(200,164,90,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(200,164,90,0.3)',
  },
  levelBadgeText: {
    color: '#C8A45A',
    fontSize: 12,
    fontWeight: '600',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: 'rgba(200,164,90,0.12)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(200,164,90,0.25)',
  },
  shareBtnText: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  levelIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.xl,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 2,
  },
  progressTrack: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  chipWrap: {
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: theme.colors.accentMuted,
    borderColor: theme.colors.accent,
  },
  chipText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: theme.colors.primary,
  },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  periodChipActive: {
    backgroundColor: theme.colors.primary,
  },
  periodChipText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  periodChipTextActive: {
    color: theme.colors.white,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadii.sm,
  },
  rankingRowMe: {
    backgroundColor: theme.colors.accentMuted,
  },
  badgeCountPill: {
    backgroundColor: theme.colors.accentMuted,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeCountText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  badgeCard: {
    width: '30%',
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  badgeCardLocked: {
    opacity: 0.45,
  },
  badgeName: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
});
