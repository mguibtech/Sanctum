import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Box, Button, Icon, Screen, Text } from '../../components/ui';
import theme from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { StreakAPI, UsersAPI } from '../../services/api';

type StatCardProps = {
  iconName: string;
  value: number | string;
  label: string;
  iconBg: string;
  iconColor: string;
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

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    // Use allSettled so a 500 in one endpoint doesn't block the other
    Promise.allSettled([UsersAPI.getStats(), StreakAPI.getRanking()])
      .then(([statsResult, rankingResult]) => {
        setStats(statsResult.status === 'fulfilled' ? (statsResult.value?.data ?? {}) : {});
        setRanking(rankingResult.status === 'fulfilled' ? (rankingResult.value?.data ?? []) : []);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (loading) {
    return (
      <Screen>
        <Box flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator color={theme.colors.accent} />
        </Box>
      </Screen>
    );
  }

  // Safely compute initials even when user is null (bootstrap race condition)
  const initials =
    (user?.name ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n: string) => n[0]?.toUpperCase() ?? '')
      .join('') || '?';

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header do perfil ── */}
        <Box style={styles.profileHeader}>
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
          </Box>
        </Box>

        <Box px="md" style={{ marginTop: -16 }}>
          {/* ── Stats de Sequência ── */}
          {stats?.streak && (
            <Box style={styles.sectionCard} mb="md">
              <Box flexDirection="row" alignItems="center" gap="sm" mb="md">
                <Icon name="fire" size={18} color="streak" />
                <Text variant="subheading" color="primary">
                  Sequência
                </Text>
              </Box>
              <Box flexDirection="row" gap="sm">
                <StatCard
                  iconName="fire"
                  value={stats.streak.currentStreak}
                  label="Ofensiva atual"
                  iconBg={theme.colors.streakLight}
                  iconColor="streak"
                />
                <StatCard
                  iconName="trophy-outline"
                  value={stats.streak.longestStreak}
                  label="Recorde pessoal"
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

          {/* ── Progresso na Bíblia ── */}
          {stats?.bible && (
            <Box style={styles.sectionCard} mb="md">
              <Box flexDirection="row" alignItems="center" gap="sm" mb="md">
                <Icon name="book-open-variant" size={18} color="primary" />
                <Text variant="subheading" color="primary">
                  Progresso na Bíblia
                </Text>
              </Box>

              <Box mb="sm">
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb="sm"
                >
                  <Text variant="muted" color="textMuted">
                    Lida
                  </Text>
                  <Text variant="bodyStrong" color="primary">
                    {stats.bible.percentage}%
                  </Text>
                </Box>
                <Box style={styles.progressTrack}>
                  <Box
                    style={[
                      styles.progressFill,
                      {
                        width: `${stats.bible.percentage}%`,
                        backgroundColor: theme.colors.accent,
                      },
                    ]}
                  />
                </Box>
              </Box>

              <Box>
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb="sm"
                >
                  <Text variant="muted" color="textMuted">
                    Contemplada
                  </Text>
                  <Text variant="bodyStrong" color="primaryLight">
                    {stats.bible.contemplatedPercentage}%
                  </Text>
                </Box>
                <Box style={styles.progressTrack}>
                  <Box
                    style={[
                      styles.progressFill,
                      {
                        width: `${stats.bible.contemplatedPercentage}%`,
                        backgroundColor: theme.colors.primaryLight,
                      },
                    ]}
                  />
                </Box>
              </Box>

              <Box
                flexDirection="row"
                alignItems="center"
                gap="xs"
                mt="md"
                pt="md"
                style={{ borderTopWidth: 1, borderTopColor: theme.colors.border }}
              >
                <Icon name="book-check-outline" size={14} color="textMuted" />
                <Text variant="caption" color="textMuted">
                  {stats.bible.chaptersRead} de {stats.bible.totalChapters} capítulos lidos
                </Text>
              </Box>
            </Box>
          )}

          {/* ── Ranking da Semana ── */}
          {ranking.length > 0 && (
            <Box style={styles.sectionCard} mb="md">
              <Box flexDirection="row" alignItems="center" gap="sm" mb="md">
                <Icon name="podium" size={18} color="accent" />
                <Text variant="subheading" color="primary">
                  Ranking da Semana
                </Text>
              </Box>
              <Box gap="xs">
                {ranking.slice(0, 10).map((entry, index) => {
                  const isMedal = index < 3;
                  const isMe = entry.user.id === user?.id;
                  return (
                    <Box
                      key={entry.user.id}
                      style={[
                        styles.rankingRow,
                        isMe && styles.rankingRowMe,
                      ]}
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
                          <Icon
                            name={MEDAL_ICONS[index]}
                            size={14}
                            color={MEDAL_COLORS[index] as any}
                          />
                        ) : (
                          <Text variant="caption" color="textMuted" style={{ fontWeight: '700' }}>
                            {index + 1}
                          </Text>
                        )}
                      </Box>
                      <Text variant="body" color="text" flex={1}>
                        {entry.user.name}
                        {isMe ? ' (você)' : ''}
                      </Text>
                      <Box flexDirection="row" alignItems="center" gap="xs">
                        <Icon name="fire" size={13} color="streak" />
                        <Text variant="bodyStrong" color="streak">
                          {entry.currentStreak}
                        </Text>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* ── Sair ── */}
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
    backgroundColor: theme.colors.backgroundSoft,
    borderRadius: theme.borderRadii.md,
    padding: theme.spacing.md,
    alignItems: 'flex-start',
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
});
