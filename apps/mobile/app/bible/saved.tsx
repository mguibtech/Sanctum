import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { BibleAPI } from '../../services/api';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { useAppAlert } from '../../hooks/useAppAlert';

type SavedPassage = {
  id: string;
  bookId: string;
  bookName: string;
  chapterNum: number;
  verseStart: number;
  verseEnd: number;
  reference: string;
  text: string;
  rangeLabel: string;
  createdAt: string;
};

export default function SavedBiblePassagesScreen() {
  const { showError, showSuccess } = useAppAlert();
  const [items, setItems] = useState<SavedPassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await BibleAPI.getSavedPassages();
    setItems(response.data ?? []);
  }, []);

  useEffect(() => {
    load()
      .catch((error: any) => {
        showError('Nao foi possivel carregar', error?.response?.data?.message ?? 'Tente novamente.');
      })
      .finally(() => setLoading(false));
  }, [load, showError]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await BibleAPI.removeSavedPassage(id);
      setItems((current) => current.filter((item) => item.id !== id));
      showSuccess('Trecho removido', 'A passagem foi retirada dos seus salvos.');
    } catch (error: any) {
      showError('Nao foi possivel remover', error?.response?.data?.message ?? 'Tente novamente.');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={items.length === 0 ? styles.emptyContent : styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      showsVerticalScrollIndicator={false}
    >
      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <RNText style={styles.emptyTitle}>Nenhuma passagem salva ainda</RNText>
          <RNText style={styles.emptyText}>
            Ao guardar um versiculo ou trecho da Biblia, ele aparece aqui para voce revisitar depois.
          </RNText>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.82 : 1 }]}
            onPress={() => router.replace('/(tabs)/bible')}
          >
            <RNText style={styles.primaryBtnText}>Abrir a Biblia</RNText>
          </Pressable>
        </View>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.86 : 1 }]}
              onPress={() =>
                router.push({
                  pathname: '/bible/[bookId]/[chapterNum]',
                  params: {
                    bookId: item.bookId,
                    chapterNum: String(item.chapterNum),
                    bookName: item.bookName,
                  },
                })
              }
            >
              <RNText style={styles.reference}>{item.reference}</RNText>
              <RNText style={styles.preview} numberOfLines={4}>
                {item.text}
              </RNText>
            </Pressable>

            <View style={styles.metaRow}>
              <RNText style={styles.metaText}>{item.rangeLabel}</RNText>
              <RNText style={styles.metaText}>
                {new Date(item.createdAt).toLocaleDateString('pt-BR')}
              </RNText>
            </View>

            <View style={styles.actionsRow}>
              <Pressable
                style={({ pressed }) => [styles.secondaryBtn, { opacity: pressed ? 0.82 : 1 }]}
                onPress={() =>
                  router.push({
                    pathname: '/bible/[bookId]/[chapterNum]',
                    params: {
                      bookId: item.bookId,
                      chapterNum: String(item.chapterNum),
                      bookName: item.bookName,
                    },
                  })
                }
              >
                <RNText style={styles.secondaryBtnText}>Abrir no contexto</RNText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.removeBtn, { opacity: pressed || removingId === item.id ? 0.72 : 1 }]}
                onPress={() => handleRemove(item.id)}
                disabled={removingId === item.id}
              >
                <RNText style={styles.removeBtnText}>
                  {removingId === item.id ? 'Removendo...' : 'Remover'}
                </RNText>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md },
  emptyContent: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.primary, textAlign: 'center' },
  emptyText: { fontSize: 15, lineHeight: 22, color: Colors.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  reference: { fontSize: 17, fontWeight: '700', color: Colors.primary, marginBottom: Spacing.sm },
  preview: { fontSize: 15, lineHeight: 23, color: Colors.text },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  secondaryBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
  removeBtn: {
    backgroundColor: 'rgba(194,65,65,0.10)',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  removeBtnText: { color: Colors.red, fontSize: 14, fontWeight: '700' },
});
