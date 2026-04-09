import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { AxiosError } from 'axios';
import { router } from 'expo-router';
import { Box, Button, Icon, Screen, Text } from '../../components/ui';
import theme from '../../constants/theme';
import { LiturgyAPI, StreakAPI } from '../../services/api';

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liturgyError, setLiturgyError] = useState<string | null>(null);

  const load = async () => {
    setLiturgyError(null);

    const [litRes, strRes] = await Promise.allSettled([LiturgyAPI.getToday(), StreakAPI.getMe()]);

    if (litRes.status === 'fulfilled') {
      setLiturgy(litRes.value.data);
    } else {
      const axiosError = litRes.reason as AxiosError<{ message?: string | string[] }>;
      const apiMessage = axiosError.response?.data?.message;
      const normalizedMessage = Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage;
      setLiturgy(null);
      setLiturgyError(normalizedMessage ?? 'Não foi possível carregar a liturgia do dia.');
    }

    if (strRes.status === 'fulfilled') {
      setStreak(strRes.value.data);
    } else {
      setStreak(null);
    }
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
        <Box flex={1} justifyContent="center" alignItems="center" gap="md">
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text variant="muted" color="accentLight" opacity={0.7}>
            Carregando...
          </Text>
        </Box>
      </Screen>
    );
  }

  const actions = [
    {
      title: 'Terço do dia',
      subtitle: 'Oração guiada no seu ritmo',
      icon: 'hands-pray',
      iconBg: 'rgba(200,164,90,0.18)',
      bg: '#1D4267',
      onPress: () => router.push('/(tabs)/rosary'),
    },
    {
      title: 'Bíblia',
      subtitle: 'Continue de onde parou',
      icon: 'book-open-variant',
      iconBg: 'rgba(22,50,79,0.12)',
      bg: '#EDE3CE',
      dark: false,
      onPress: () => router.push('/(tabs)/bible'),
    },
    {
      title: 'Comunidade',
      subtitle: 'Reze por intenções',
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent}
          />
        }
      >
        {/* ── Hero / Saudação ── */}
        <Box px="lg" pt="lg">
          <Box style={styles.heroCard}>
            {/* Círculos decorativos */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            {/* Saudação */}
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
              Sua jornada espiritual diária
            </Text>

            {/* Stats de sequência */}
            <Box flexDirection="row" gap="sm" mt="lg">
              <Box style={styles.statCard}>
                <Box flexDirection="row" alignItems="center" gap="xs" mb="xs">
                  <Icon name="fire" size={15} color="accent" />
                  <Text variant="overline" color="accentLight">
                    Sequência
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

          {/* ── Atalhos ── */}
          <Box mt="xl">
            <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="md">
              <Text variant="subheading" color="white">
                Atalhos
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
                            color:
                              action.dark === false
                                ? theme.colors.textMuted
                                : 'rgba(255,255,255,0.65)',
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

          {/* ── Liturgia do Dia ── */}
          <Box mt="xl">
            <Box flexDirection="row" alignItems="center" gap="sm" mb="md">
              <Text variant="subheading" color="white">
                Liturgia do Dia
              </Text>
            </Box>

            {liturgy ? (
              <Pressable onPress={() => router.push('/liturgy')}>
                {({ pressed }) => (
                  <Box style={[styles.liturgyCard, { opacity: pressed ? 0.93 : 1 }]}>
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
                          {liturgy.reference ?? 'Meditação diária'}
                        </Text>
                      </Box>
                    </Box>

                    <Text variant="body" color="text" numberOfLines={4} style={{ lineHeight: 22 }}>
                      {getPreview(liturgy.gospel)}
                    </Text>

                    {liturgy.reflection ? (
                      <Box
                        mt="md"
                        pt="md"
                        style={{ borderTopWidth: 1, borderTopColor: theme.colors.border }}
                      >
                        <Text variant="muted" color="textMuted" numberOfLines={2}>
                          {getPreview(liturgy.reflection, 110)}
                        </Text>
                      </Box>
                    ) : null}

                    <Box
                      mt="md"
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
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
                  </Box>
                )}
              </Pressable>
            ) : (
              <Box style={styles.liturgyCard}>
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
                    Liturgia indisponível
                  </Text>
                </Box>
                <Text variant="muted" color="text" mb="md">
                  {liturgyError ?? 'Não foi possível carregar a liturgia agora.'}
                </Text>
                <Button variant="primary" onPress={onRefresh}>
                  Tentar novamente
                </Button>
              </Box>
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
});
