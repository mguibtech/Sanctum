import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SectionList,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BibleAPI } from '../../services/api';
import { Colors, Spacing, Radius } from '../../constants/theme';

type Book = { id: string; name: string; abbreviation: string };
type Progress = {
  percentage: number;
  contemplatedPercentage: number;
  chaptersRead: number;
  chaptersContemplated: number;
  totalChapters: number;
};

// Abreviações do Antigo Testamento (correspondências comuns em PT)
const OLD_TESTAMENT_ABBRS = [
  'Gn','Ex','Lv','Nm','Dt','Js','Jz','Rt','1Sm','2Sm','1Rs','2Rs',
  '1Cr','2Cr','Ed','Ne','Tb','Jdt','Et','1Mc','2Mc','Jó','Sl','Pv',
  'Ecl','Ct','Sb','Eclo','Is','Jr','Lm','Br','Ez','Dn','Os','Jl',
  'Am','Ab','Jn','Mq','Na','Hb','Sf','Ag','Zc','Ml',
];

function groupBooks(books: Book[]) {
  const old = books.filter((b) => OLD_TESTAMENT_ABBRS.includes(b.abbreviation));
  const newT = books.filter((b) => !OLD_TESTAMENT_ABBRS.includes(b.abbreviation));
  const sections: { title: string; data: Book[][] }[] = [];
  if (old.length > 0) sections.push({ title: 'Antigo Testamento', data: [old] });
  if (newT.length > 0) sections.push({ title: 'Novo Testamento', data: [newT] });
  if (sections.length === 0 && books.length > 0) {
    sections.push({ title: 'Livros', data: [books] });
  }
  return sections;
}

export default function BibleScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksRes, progressRes] = await Promise.all([
        BibleAPI.getBooks(),
        BibleAPI.getProgress(),
      ]);
      setBooks(booksRes.data ?? []);
      setProgress(progressRes.data ?? null);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ?? e?.message ?? 'Não foi possível carregar a Bíblia.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
      setBooks([]);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <RNText style={styles.loadingText}>Carregando escrituras...</RNText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconBox}>
          <RNText style={styles.errorIcon}>📖</RNText>
        </View>
        <RNText style={styles.errorTitle}>Bíblia indisponível</RNText>
        <RNText style={styles.errorMsg}>{error}</RNText>

        <View style={styles.hintBox}>
          <RNText style={styles.hintTitle}>Base local obrigatória</RNText>
          <RNText style={styles.hintText}>
            O app usa apenas a base internalizada do Sanctum. Se algum livro ou capítulo
            estiver indisponível, revise a importação do `bible_chapter_cache` no backend.
          </RNText>
        </View>

        <Pressable
          style={({ pressed }) => [styles.retryBtn, { opacity: pressed ? 0.85 : 1 }]}
          onPress={load}
        >
          <RNText style={styles.retryText}>Tentar novamente</RNText>
        </Pressable>
      </View>
    );
  }

  const sections = groupBooks(books);

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(_, index) => String(index)}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          progress ? (
            <View style={styles.progressHeader}>
              {/* Chips de stat */}
              <View style={styles.progressStats}>
                <View style={styles.progressStatChip}>
                  <View style={[styles.progressStatDot, { backgroundColor: Colors.accent }]} />
                  <View>
                    <RNText style={styles.progressStatValue}>{progress.percentage}%</RNText>
                    <RNText style={styles.progressStatLabel}>Lida</RNText>
                  </View>
                </View>
                <View style={styles.progressStatChip}>
                  <View style={[styles.progressStatDot, { backgroundColor: '#6EA8D4' }]} />
                  <View>
                    <RNText style={styles.progressStatValue}>
                      {progress.contemplatedPercentage}%
                    </RNText>
                    <RNText style={styles.progressStatLabel}>Contemplada</RNText>
                  </View>
                </View>
                <View style={styles.progressStatChip}>
                  <View style={[styles.progressStatDot, { backgroundColor: 'rgba(255,255,255,0.4)' }]} />
                  <View>
                    <RNText style={styles.progressStatValue}>{progress.chaptersRead}</RNText>
                    <RNText style={styles.progressStatLabel}>Capítulos</RNText>
                  </View>
                </View>
              </View>

              {/* Barra de progresso */}
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progress.percentage}%` }]} />
              </View>
            </View>
          ) : null
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLine} />
            <View style={styles.sectionHeaderPill}>
              <RNText style={styles.sectionHeaderText}>{section.title}</RNText>
            </View>
            <View style={styles.sectionHeaderLine} />
          </View>
        )}
        renderItem={({ item: bookList }) => (
          <FlatList
            data={bookList}
            keyExtractor={(book) => book.id}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.bookCard, { opacity: pressed ? 0.8 : 1 }]}
                onPress={() =>
                  router.push({
                    pathname: '/bible/[bookId]',
                    params: { bookId: item.id, bookName: item.name },
                  })
                }
              >
                <View style={styles.bookCardInner}>
                  <View style={styles.bookAccentBar} />
                  <View style={styles.bookCardContent}>
                    <RNText style={styles.bookAbbr}>{item.abbreviation}</RNText>
                    <RNText style={styles.bookName} numberOfLines={2}>
                      {item.name}
                    </RNText>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  loadingText: { marginTop: Spacing.md, color: Colors.textSecondary, fontSize: 14 },

  errorContainer: {
    flex: 1, backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center',
    padding: Spacing.xl, gap: Spacing.md,
  },
  errorIconBox: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  errorIcon: { fontSize: 36 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, textAlign: 'center' },
  errorMsg: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  hintBox: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.lg, width: '100%',
    borderLeftWidth: 3, borderLeftColor: Colors.accent, gap: 6,
  },
  hintTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  hintText: { fontSize: 13, color: Colors.text, lineHeight: 20 },
  retryBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Progress header
  progressHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  progressStats: { flexDirection: 'row', gap: Spacing.sm },
  progressStatChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.sm, padding: Spacing.sm,
  },
  progressStatDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  progressStatValue: { color: '#fff', fontWeight: '700', fontSize: 15, lineHeight: 18 },
  progressStatLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 1 },
  progressBarTrack: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3, overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', backgroundColor: Colors.accent, borderRadius: 3,
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  sectionHeaderLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  sectionHeaderPill: {
    paddingVertical: 5, paddingHorizontal: 14,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
  },
  sectionHeaderText: {
    color: '#fff', fontWeight: '700', fontSize: 11,
    letterSpacing: 0.5,
  },

  // Book grid
  grid: { paddingHorizontal: Spacing.sm, paddingBottom: Spacing.lg },
  bookCard: { flex: 1, margin: 4, minHeight: 80 },
  bookCardInner: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: Radius.md, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  bookAccentBar: { height: 3, backgroundColor: Colors.accent },
  bookCardContent: {
    flex: 1, padding: Spacing.sm,
    alignItems: 'center', justifyContent: 'center', gap: 3,
  },
  bookAbbr: {
    fontSize: 10, fontWeight: '700', color: Colors.accent,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  bookName: {
    fontSize: 12, fontWeight: '600', color: Colors.primary,
    textAlign: 'center', lineHeight: 16,
  },
});
