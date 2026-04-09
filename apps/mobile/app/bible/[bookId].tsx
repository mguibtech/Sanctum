import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Text as RNText,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { BibleAPI } from '../../services/api';
import { Colors, Spacing, Radius } from '../../constants/theme';

type Chapter = { id: string; number: string; reference: string };

export default function ChaptersScreen() {
  const { bookId, bookName } = useLocalSearchParams<{ bookId: string; bookName?: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookName) {
      navigation.setOptions({ title: String(bookName) });
    }
  }, [bookName]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await BibleAPI.getChapters(bookId);
        setChapters(res.data ?? []);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? e?.message ?? 'Erro ao carregar capitulos.');
        setChapters([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <RNText style={styles.loadingText}>Carregando capitulos...</RNText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <RNText style={styles.errorIcon}>📖</RNText>
        <RNText style={styles.errorText}>{error}</RNText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chapters}
        keyExtractor={(chapter) => chapter.id}
        numColumns={5}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chapterBtn}
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: `/bible/[bookId]/[chapterNum]`,
                params: {
                  bookId,
                  chapterNum: item.number,
                  bookName: bookName ?? bookId,
                },
              })
            }
          >
            <RNText style={styles.chapterNum}>{item.number}</RNText>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <RNText style={styles.errorText}>Nenhum capitulo encontrado.</RNText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { marginTop: Spacing.md, color: Colors.textSecondary, fontSize: 14 },
  errorIcon: { fontSize: 48, marginBottom: Spacing.md },
  errorText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  list: { padding: Spacing.md },
  chapterBtn: {
    flex: 1,
    margin: Spacing.xs,
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent,
    maxWidth: '18%',
  },
  chapterNum: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
});
