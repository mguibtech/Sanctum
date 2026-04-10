import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Text as RNText,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { BibleAPI } from '../../services/api';
import { Colors, Spacing, Radius } from '../../constants/theme';

type Chapter = { id: string; number: string; reference: string };

type BookProgress = {
  chapters: Array<{
    chapterNum: number;
    contemplated: boolean;
    lastReadAt: string;
  }>;
  percentage: number;
  contemplatedPercentage: number;
  chaptersRead: number;
  chaptersContemplated: number;
  totalChapters: number;
};

export default function ChaptersScreen() {
  const { bookId, bookName } = useLocalSearchParams<{ bookId: string; bookName?: string }>();
  const router = useRouter();

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<BookProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const [chaptersRes, progressRes] = await Promise.all([
        BibleAPI.getChapters(bookId),
        BibleAPI.getBookProgress(bookId),
      ]);
      setChapters(chaptersRes.data ?? []);
      setProgress(progressRes.data ?? null);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Erro ao carregar capitulos.');
      setChapters([]);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [bookId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [bookId]),
  );

  const getChapterStatus = (chapterNum: number): 'contemplated' | 'read' | 'unread' => {
    if (!progress) return 'unread';
    const chapter = progress.chapters.find((c) => c.chapterNum === Number(chapterNum));
    if (!chapter) return 'unread';
    return chapter.contemplated ? 'contemplated' : 'read';
  };

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
        ListHeaderComponent={
          progress ? (
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <RNText style={styles.progressLabel}>Progresso do livro</RNText>
                <RNText style={styles.progressPercentage}>{progress.percentage}%</RNText>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progress.percentage}%` },
                  ]}
                />
              </View>
              <View style={styles.progressStats}>
                <View style={styles.progressStatItem}>
                  <RNText style={styles.progressStatDot}>●</RNText>
                  <RNText style={styles.progressStatText}>
                    {progress.chaptersRead} de {progress.totalChapters}
                  </RNText>
                </View>
                {progress.chaptersContemplated > 0 && (
                  <View style={styles.progressStatItem}>
                    <RNText style={[styles.progressStatDot, { color: Colors.accent }]}>●</RNText>
                    <RNText style={styles.progressStatText}>{progress.chaptersContemplated} contemplados</RNText>
                  </View>
                )}
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const status = getChapterStatus(Number(item.number));
          const isContemplated = status === 'contemplated';
          const isRead = status === 'read';

          return (
            <TouchableOpacity
              style={[
                styles.chapterBtn,
                isContemplated && styles.chapterBtnContemplated,
                isRead && styles.chapterBtnRead,
              ]}
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
              <RNText
                style={[
                  styles.chapterNum,
                  isContemplated && styles.chapterNumContemplated,
                ]}
              >
                {item.number}
              </RNText>
              {isContemplated && <RNText style={styles.chapterCheckmark}>✓</RNText>}
            </TouchableOpacity>
          );
        }}
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

  // Progress header
  progressHeader: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  progressInfo: {
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  progressStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressStatDot: {
    fontSize: 8,
    color: Colors.primary,
  },
  progressStatText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },

  // Chapter buttons
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
  chapterBtnRead: {
    backgroundColor: 'rgba(210, 180, 140, 0.15)',
    borderBottomWidth: 3,
  },
  chapterBtnContemplated: {
    backgroundColor: Colors.accent,
    borderBottomColor: Colors.accent,
    borderBottomWidth: 2,
  },
  chapterNum: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  chapterNumContemplated: {
    color: '#fff',
  },
  chapterCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
