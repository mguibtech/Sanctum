import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text as RNText,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { BibleAPI } from '../../../services/api';
import { Colors, Spacing, Radius } from '../../../constants/theme';
import { useAppAlert } from '../../../hooks/useAppAlert';

type Verse = { id: string; text: string; reference: string };

export default function ChapterReaderScreen() {
  const { bookId, chapterNum, bookName } = useLocalSearchParams<{
    bookId: string;
    chapterNum: string;
    bookName?: string;
  }>();
  const router = useRouter();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const { showSuccess } = useAppAlert();

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const title = bookName ? `${bookName} ${chapterNum}` : `Capitulo ${chapterNum}`;

  useEffect(() => {
    navigation.setOptions({ title });
  }, [title]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await BibleAPI.getChapter(bookId, Number(chapterNum));
        const rawVerses: Verse[] = res.data?.verses ?? res.data ?? [];
        setVerses(rawVerses);
      } catch (e: any) {
        const msg = e?.response?.data?.message ?? e?.message ?? 'Erro ao carregar capitulo.';
        setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
        setVerses([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookId, chapterNum]);

  const handleMarkRead = async (contemplated = false) => {
    if (saved) return;

    setSaving(true);
    try {
      await BibleAPI.saveProgress({
        bookId,
        bookName: String(bookName ?? bookId),
        chapterNum: Number(chapterNum),
        contemplated,
      });
      setSaved(true);
      if (contemplated) {
        showSuccess('Contemplado', 'Capitulo marcado como contemplado.');
      }
    } catch {
      // progresso e secundario para a leitura
    } finally {
      setSaving(false);
    }
  };

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
      <View style={styles.center}>
        <RNText style={styles.errorIcon}>📖</RNText>
        <RNText style={styles.errorTitle}>Nao foi possivel carregar</RNText>
        <RNText style={styles.errorText}>{error}</RNText>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <RNText style={styles.backBtnText}>Voltar</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.chapterHeader}>
          <RNText style={styles.chapterTitle}>{title}</RNText>
        </View>

        {verses.length > 0 ? (
          verses.map((verse, index) => {
            const verseNum = verse.id?.split('.')?.pop() ?? String(index + 1);
            return (
              <View key={verse.id ?? index} style={styles.verseRow}>
                <RNText style={styles.verseNum}>{verseNum}</RNText>
                <RNText style={styles.verseText}>{verse.text}</RNText>
              </View>
            );
          })
        ) : (
          <View style={styles.center}>
            <RNText style={styles.errorText}>
              Texto do capitulo nao disponivel na base local atual.
            </RNText>
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        {saved ? (
          <View style={styles.savedBadge}>
            <RNText style={styles.savedText}>Capitulo registrado</RNText>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, styles.readBtn]}
              activeOpacity={0.8}
              onPress={() => handleMarkRead(false)}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <RNText style={styles.actionBtnText}>Marcar como lido</RNText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.contemplateBtn]}
              activeOpacity={0.8}
              onPress={() => handleMarkRead(true)}
              disabled={saving}
            >
              <RNText style={[styles.actionBtnText, { color: Colors.primary }]}>
                Contemplei
              </RNText>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  loadingText: { marginTop: Spacing.md, color: Colors.textSecondary, fontSize: 14 },
  errorIcon: { fontSize: 48, marginBottom: Spacing.md },
  errorTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginBottom: Spacing.sm },
  errorText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  backBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
  },
  backBtnText: { color: '#fff', fontWeight: '700' },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg },
  chapterHeader: {
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
  },
  chapterTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
  },
  verseRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  verseNum: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    minWidth: 28,
    marginTop: 3,
    lineHeight: 20,
  },
  verseText: {
    flex: 1,
    fontSize: 17,
    color: Colors.text ?? '#1a1a2e',
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  footerSpacer: { height: 120 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readBtn: { backgroundColor: Colors.primary },
  contemplateBtn: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  savedBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
  },
  savedText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
});
