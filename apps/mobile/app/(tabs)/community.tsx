import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text as RNText,
  View,
} from 'react-native';
import { Box, Button, Icon, Screen, Text, TextField } from '../../components/ui';
import theme from '../../constants/theme';
import { useAppAlert } from '../../hooks/useAppAlert';
import { CommunityAPI } from '../../services/api';
import { hapticLight, hapticSuccess } from '../../utils/haptics';

function formatRelativeTime(dateStr: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `há ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <Box
      flex={1}
      bg="surfaceElevated"
      p="md"
      borderRadius="md"
      alignItems="center"
      gap="xs"
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <Box
        width={36}
        height={36}
        borderRadius="full"
        alignItems="center"
        justifyContent="center"
        bg="accentMuted"
        mb="xs"
      >
        <Icon name={icon} size={18} color="accent" />
      </Box>
      <Text variant="subheading" color="primary">
        {value}
      </Text>
      <Text variant="caption" color="textMuted" textAlign="center">
        {label}
      </Text>
    </Box>
  );
}

export default function CommunityScreen() {
  const { showSuccess, showWarning } = useAppAlert();
  const [prayers, setPrayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await CommunityAPI.getPrayerRequests();
    setPrayers(data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handlePray = async (id: string) => {
    hapticLight();
    await CommunityAPI.pray(id);
    setPrayers((previous) =>
      previous.map((prayer) =>
        prayer.id === id ? { ...prayer, prayerCount: prayer.prayerCount + 1 } : prayer,
      ),
    );
  };

  const handleSubmit = async () => {
    if (content.length < 10) {
      showWarning('Pedido muito curto', 'Escreva pelo menos 10 caracteres na sua intenção.');
      return;
    }
    setSubmitting(true);
    try {
      await CommunityAPI.createPrayerRequest({ content, isAnonymous });
      setContent('');
      setIsAnonymous(false);
      setModalVisible(false);
      hapticSuccess();
      showSuccess('Intenção publicada', 'Seu pedido foi enviado para a comunidade.');
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate statistics
  const totalPrayers = prayers.reduce((sum, prayer) => sum + (prayer.prayerCount || 0), 0);

  return (
    <Screen>
      <Box flex={1} bg="background">
        {loading ? (
          <Box flex={1} justifyContent="center" alignItems="center">
            <ActivityIndicator color={theme.colors.accent} />
          </Box>
        ) : (
          <FlatList
            data={prayers}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.accent}
              />
            }
            ListHeaderComponent={
              <Box gap="lg" mb="lg">
                {/* Hero Section */}
                <Box
                  bg="primary"
                  p="lg"
                  borderRadius="lg"
                  gap="md"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 10,
                    elevation: 3,
                  }}
                >
                  <Box flexDirection="row" alignItems="flex-start" gap="md">
                    <Box
                      width={50}
                      height={50}
                      borderRadius="md"
                      alignItems="center"
                      justifyContent="center"
                      bg="accent"
                    >
                      <Icon name="hands-pray" size={26} color="primary" />
                    </Box>
                    <Box flex={1}>
                      <Text variant="subheading" color="accent" mb="xs">
                        Comunidade Sanctum
                      </Text>
                      <Text variant="caption" color="accentLight">
                        Compartilhe suas intenções e ore pelos pedidos da comunidade
                      </Text>
                    </Box>
                  </Box>
                </Box>

                {/* Statistics */}
                <Box gap="md">
                  <Text variant="subheading" color="primary" px="md">
                    Estatísticas
                  </Text>
                  <Box flexDirection="row" gap="md" px="md">
                    <StatCard
                      icon="lightbulb-outline"
                      label="Intenções"
                      value={prayers.length}
                    />
                    <StatCard icon="hands-pray" label="Orações" value={totalPrayers} />
                  </Box>
                </Box>

                {/* Header Text */}
                <Box px="md">
                  <Text variant="heading" color="text" mb="xs">
                    Pedidos de Oração
                  </Text>
                  <Text variant="muted" color="textMuted">
                    {prayers.length === 0
                      ? 'Nenhum pedido ainda. Seja o primeiro!'
                      : `${prayers.length} ${prayers.length === 1 ? 'intenção' : 'intenções'} na comunidade`}
                  </Text>
                </Box>
              </Box>
            }
            ListEmptyComponent={
              <Box
                flex={1}
                alignItems="center"
                justifyContent="center"
                px="xl"
                style={{ paddingTop: 80, paddingBottom: 80 }}
              >
                <Box
                  width={72}
                  height={72}
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                  mb="lg"
                  style={{ backgroundColor: theme.colors.accentMuted }}
                >
                  <Icon name="hand-heart-outline" size={36} color="accent" />
                </Box>
                <Text variant="subheading" color="primary" textAlign="center" mb="sm">
                  Nenhuma intenção ainda
                </Text>
                <Text variant="muted" color="textMuted" textAlign="center" mb="lg">
                  Seja o primeiro a compartilhar um pedido de oração com a comunidade Sanctum.
                </Text>
                <Pressable
                  onPress={() => setModalVisible(true)}
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.8 : 1,
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      backgroundColor: theme.colors.accent,
                      borderRadius: theme.borderRadii.md,
                    },
                  ]}
                >
                  <RNText
                    style={{
                      color: theme.colors.primary,
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    Criar primeira intenção
                  </RNText>
                </Pressable>
              </Box>
            }
            contentContainerStyle={{
              padding: theme.spacing.md,
              gap: theme.spacing.sm,
              paddingBottom: theme.spacing.xl + 80,
            }}
            renderItem={({ item }) => (
              <View style={styles.prayerCard}>
                {/* Header do card */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardAvatar}>
                    <RNText style={styles.cardAvatarText}>
                      {item.isAnonymous
                        ? '✝'
                        : (item.user?.name?.[0] ?? 'F').toUpperCase()}
                    </RNText>
                  </View>
                  <View style={styles.cardMeta}>
                    <RNText style={styles.cardAuthor}>
                      {item.isAnonymous ? 'Anônimo' : (item.user?.name ?? 'Fiel')}
                    </RNText>
                    {item.createdAt ? (
                      <RNText style={styles.cardTime}>
                        {formatRelativeTime(item.createdAt)}
                      </RNText>
                    ) : null}
                  </View>
                  {item.isAnonymous && (
                    <View style={styles.anonBadge}>
                      <RNText style={styles.anonBadgeText}>Anônimo</RNText>
                    </View>
                  )}
                </View>

                {/* Conteúdo */}
                <RNText style={styles.cardContent}>{item.content}</RNText>

                {/* Ação de rezar */}
                <Pressable
                  onPress={() => handlePray(item.id)}
                  style={({ pressed }) => [
                    styles.prayButton,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Icon name="hands-pray" size={15} color="accent" />
                  <RNText style={styles.prayButtonText}>
                    Rezar por esta intenção
                  </RNText>
                  <View style={styles.prayCount}>
                    <RNText style={styles.prayCountText}>{item.prayerCount}</RNText>
                  </View>
                </Pressable>
              </View>
            )}
          />
        )}

        {/* ── FAB — Novo Pedido ── */}
        <View style={styles.fabWrapper}>
          <Pressable
            onPress={() => setModalVisible(true)}
            style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Icon name="plus" size={20} color="primary" />
            <RNText style={styles.fabText}>Novo pedido</RNText>
          </Pressable>
        </View>

        {/* ── Modal ── */}
        <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
          <Screen backgroundColor="surface">
            <Box flex={1} p="xl" gap="md">
              {/* Header do modal */}
              <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="sm">
                <Text variant="heading" color="primary">
                  Nova Intenção
                </Text>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Box
                    width={32}
                    height={32}
                    borderRadius="full"
                    alignItems="center"
                    justifyContent="center"
                    style={{ backgroundColor: theme.colors.surfaceMuted }}
                  >
                    <Icon name="close" size={18} color="textMuted" />
                  </Box>
                </Pressable>
              </Box>

              <Text variant="muted" color="textMuted" mb="xs">
                Compartilhe sua intenção com a comunidade Sanctum.
              </Text>

              <TextField
                placeholder="Escreva aqui sua intenção de oração..."
                value={content}
                onChangeText={setContent}
                multiline
                maxLength={500}
              />

              <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Text variant="bodyStrong" color="text">
                    Publicar anonimamente
                  </Text>
                  <Text variant="caption" color="textMuted">
                    Seu nome não será exibido
                  </Text>
                </Box>
                <Switch
                  value={isAnonymous}
                  onValueChange={setIsAnonymous}
                  thumbColor={isAnonymous ? theme.colors.accent : theme.colors.surfaceStrong}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.accentMuted,
                  }}
                />
              </Box>

              <Box
                flexDirection="row"
                justifyContent="flex-end"
                style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 16 }}
              >
                <RNText style={styles.charCount}>{content.length}/500</RNText>
              </Box>

              <Button variant="secondary" onPress={handleSubmit} loading={submitting}>
                Publicar Intenção
              </Button>
              <Button variant="ghost" onPress={() => setModalVisible(false)}>
                Cancelar
              </Button>
            </Box>
          </Screen>
        </Modal>
      </Box>
    </Screen>
  );
}

const styles = StyleSheet.create({
  prayerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadii.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cardAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
  },
  cardAvatarText: {
    color: theme.colors.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  cardMeta: { flex: 1 },
  cardAuthor: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  cardTime: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  anonBadge: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.borderRadii.xs,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  anonBadgeText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  cardContent: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  prayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.accentMuted,
    borderRadius: theme.borderRadii.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginTop: 2,
  },
  prayButtonText: {
    flex: 1,
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  prayCount: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadii.full,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  prayCountText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  fabWrapper: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    left: theme.spacing.lg,
  },
  fab: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadii.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  charCount: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
});
