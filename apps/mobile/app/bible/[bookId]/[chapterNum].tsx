import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { BibleAPI } from '../../../services/api';
import { XpToast, Icon } from '../../../components/ui';
import { Colors, Radius, Spacing } from '../../../constants/theme';
import { useAppAlert } from '../../../hooks/useAppAlert';

type Verse = { id: string; text: string; reference: string };
type ChapterLoadIssue = {
  code: string | null;
  cachedChapters?: number;
  credentialsConfigured?: boolean;
};

type SavedPassage = {
  id: string;
  verseStart: number;
  verseEnd: number;
  rangeLabel: string;
};

export default function ChapterReaderScreen() {
  const { bookId, chapterNum, bookName } = useLocalSearchParams<{
    bookId: string;
    chapterNum: string;
    bookName?: string;
  }>();
  const router = useRouter();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const { showError, showSuccess } = useAppAlert();

  const [verses, setVerses] = useState<Verse[]>([]);
  const [savedPassages, setSavedPassages] = useState<SavedPassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issue, setIssue] = useState<ChapterLoadIssue | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<number | null>(null);
  const [xpToast, setXpToast] = useState<{
    xpGained: number;
    leveledUp: boolean;
    newLevelName: string | null;
    visible: boolean;
  }>({
    xpGained: 0,
    leveledUp: false,
    newLevelName: null,
    visible: false,
  });

  const title = bookName ? `${bookName} ${chapterNum}` : `Capitulo ${chapterNum}`;
  const selectedRange = useMemo(() => {
    if (selectedStart === null) return null;
    const start = selectedEnd === null ? selectedStart : Math.min(selectedStart, selectedEnd);
    const end = selectedEnd === null ? selectedStart : Math.max(selectedStart, selectedEnd);
    return { start, end };
  }, [selectedEnd, selectedStart]);

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  const loadChapter = async () => {
    try {
      setLoading(true);
      setError(null);
      setIssue(null);
      const [chapterRes, savedRes] = await Promise.all([
        BibleAPI.getChapter(bookId, Number(chapterNum)),
        BibleAPI.getChapterSavedPassages(bookId, Number(chapterNum)),
      ]);
      const rawVerses: Verse[] = chapterRes.data?.verses ?? chapterRes.data ?? [];
      setVerses(rawVerses);
      setSavedPassages(savedRes.data ?? []);
    } catch (e: any) {
      const payload = e?.response?.data;
      const msg = payload?.message ?? e?.message ?? 'Erro ao carregar capitulo.';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
      setIssue({
        code: payload?.code ?? null,
        cachedChapters: payload?.details?.cachedChapters,
        credentialsConfigured: payload?.details?.credentialsConfigured,
      });
      setVerses([]);
      setSavedPassages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChapter();
    setScrolledToBottom(false);
    setSelectedStart(null);
    setSelectedEnd(null);
  }, [bookId, chapterNum]);

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPosition = contentOffset.y + layoutMeasurement.height;
    const threshold = 50;

    if (scrollPosition >= contentSize.height - threshold) {
      setScrolledToBottom(true);
    }
  };

  const handleMarkRead = async (contemplated = false) => {
    if (saved && !contemplated) return;

    setSaving(true);
    try {
      const response = await BibleAPI.saveProgress({
        bookId,
        bookName: String(bookName ?? bookId),
        chapterNum: Number(chapterNum),
        contemplated,
      });
      const data = response.data;
      setSaved(true);

      if (data?.xp?.xpGained) {
        setXpToast({
          xpGained: data.xp.xpGained,
          leveledUp: data.xp.leveledUp ?? false,
          newLevelName: data.xp.newLevelName ?? null,
          visible: true,
        });
      }

      if (data?.alreadyRecorded) {
        showSuccess(
          contemplated ? 'Atualizado' : 'Ja registrado',
          contemplated && data?.newlyContemplated
            ? 'Capitulo promovido para contemplado.'
            : 'Esse capitulo ja estava no seu progresso.',
        );
      } else if (contemplated) {
        showSuccess('Contemplado', 'Capitulo marcado como contemplado.');
      } else {
        showSuccess('Registrado', 'Capitulo marcado como lido.');
      }
    } catch {
      // progresso e secundario para a leitura
    } finally {
      setSaving(false);
    }
  };

  const handleVersePress = (verseNum: number) => {
    if (selectedStart === null || (selectedStart !== null && selectedEnd !== null)) {
      setSelectedStart(verseNum);
      setSelectedEnd(null);
      return;
    }

    if (selectedStart === verseNum) {
      setSelectedStart(null);
      setSelectedEnd(null);
      return;
    }

    setSelectedEnd(verseNum);
  };

  const clearSelection = () => {
    setSelectedStart(null);
    setSelectedEnd(null);
  };

  const handleSavePassage = async () => {
    if (!selectedRange) return;

    setSaving(true);
    try {
      await BibleAPI.savePassage({
        bookId,
        bookName: String(bookName ?? bookId),
        chapterNum: Number(chapterNum),
        verseStart: selectedRange.start,
        verseEnd: selectedRange.end,
      });

      showSuccess(
        'Trecho salvo',
        selectedRange.start === selectedRange.end
          ? `Versiculo ${selectedRange.start} guardado nos seus salvos.`
          : `Versiculos ${selectedRange.start}-${selectedRange.end} guardados nos seus salvos.`,
      );

      clearSelection();
      const savedRes = await BibleAPI.getChapterSavedPassages(bookId, Number(chapterNum));
      setSavedPassages(savedRes.data ?? []);
    } catch (error: any) {
      showError(
        'Nao foi possivel salvar',
        error?.response?.data?.message ?? 'Tente novamente em instantes.',
      );
    } finally {
      setSaving(false);
    }
  };

  const isVerseInSelection = (verseNum: number) =>
    selectedRange ? verseNum >= selectedRange.start && verseNum <= selectedRange.end : false;

  const isVerseSaved = (verseNum: number) =>
    savedPassages.some((item) => verseNum >= item.verseStart && verseNum <= item.verseEnd);

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
        <Icon name="alert-circle-outline" size={48} color="primary" />
        <RNText style={styles.errorTitle}>Nao foi possivel carregar</RNText>
        <RNText style={styles.errorText}>{error}</RNText>
        {issue?.code === 'BIBLE_SOURCE_UNAUTHORIZED' ? (
          <RNText style={styles.errorHint}>
            Este ambiente esta sem fonte biblica disponivel: o cache local esta vazio e a
            credencial externa foi recusada. Cache atual: {issue.cachedChapters ?? 0} capitulos.
          </RNText>
        ) : null}
        {issue?.code === 'BIBLE_SOURCE_NOT_CONFIGURED' ? (
          <RNText style={styles.errorHint}>
            Este ambiente esta sem fonte biblica configurada e o cache local ainda nao foi populado.
          </RNText>
        ) : null}
        <TouchableOpacity style={styles.retryBtn} onPress={loadChapter}>
          <RNText style={styles.retryBtnText}>Tentar novamente</RNText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <RNText style={styles.backBtnText}>Voltar</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.chapterHeader}>
            <RNText style={styles.chapterTitle}>{title}</RNText>
            <RNText style={styles.chapterHint}>
              Toque em um versiculo para iniciar a selecao. Toque em outro para fechar o trecho.
            </RNText>
            {savedPassages.length > 0 ? (
              <TouchableOpacity style={styles.savedInlineCard} onPress={() => router.push('/bible/saved')}>
                <RNText style={styles.savedInlineTitle}>
                  {savedPassages.length} trecho{savedPassages.length > 1 ? 's' : ''} guardado{savedPassages.length > 1 ? 's' : ''} neste capitulo
                </RNText>
                <RNText style={styles.savedInlineSubtitle}>Ver todos os salvos</RNText>
              </TouchableOpacity>
            ) : null}
          </View>

          {verses.length > 0 ? (
            verses.map((verse, index) => {
              const verseNum = Number(verse.id?.split('.')?.pop() ?? String(index + 1));
              const isSelected = isVerseInSelection(verseNum);
              const alreadySaved = isVerseSaved(verseNum);

              return (
                <Pressable key={verse.id ?? index} onPress={() => handleVersePress(verseNum)}>
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.verseRow,
                        isSelected && styles.verseRowSelected,
                        alreadySaved && styles.verseRowSaved,
                        pressed && styles.verseRowPressed,
                      ]}
                    >
                      <RNText style={[styles.verseNum, (isSelected || alreadySaved) && styles.verseNumSelected]}>
                        {verseNum}
                      </RNText>
                      <RNText style={[styles.verseText, isSelected && styles.verseTextSelected]}>
                        {verse.text}
                      </RNText>
                    </View>
                  )}
                </Pressable>
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
          {selectedRange ? (
            <View style={styles.selectionFooter}>
              <View style={styles.selectionInfo}>
                <RNText style={styles.selectionEyebrow}>Trecho selecionado</RNText>
                <RNText style={styles.selectionTitle}>
                  {selectedRange.start === selectedRange.end
                    ? `Versiculo ${selectedRange.start}`
                    : `Versiculos ${selectedRange.start}-${selectedRange.end}`}
                </RNText>
              </View>

              <View style={styles.selectionActions}>
                <TouchableOpacity style={styles.clearBtn} activeOpacity={0.8} onPress={clearSelection}>
                  <RNText style={styles.clearBtnText}>Limpar</RNText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.savePassageBtn}
                  activeOpacity={0.8}
                  onPress={handleSavePassage}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <RNText style={styles.savePassageBtnText}>Guardar trecho</RNText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : saved ? (
            <View style={styles.savedBadge}>
              <RNText style={styles.savedText}>Capitulo registrado</RNText>
            </View>
          ) : !scrolledToBottom ? (
            <View style={styles.lockedBadge}>
              <Icon name="lock-outline" size={24} color="textSecondary" />
              <RNText style={styles.lockedText}>Leia ate o final para registrar</RNText>
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

      <XpToast
        xpGained={xpToast.xpGained}
        leveledUp={xpToast.leveledUp}
        newLevelName={xpToast.newLevelName}
        visible={xpToast.visible}
        onHide={() => setXpToast((prev) => ({ ...prev, visible: false }))}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: Spacing.md },
  loadingText: { marginTop: Spacing.md, color: Colors.textSecondary, fontSize: 14 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginBottom: Spacing.sm },
  errorText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  errorHint: {
    marginTop: Spacing.md,
    color: Colors.text,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  retryBtnText: { color: Colors.primary, fontWeight: '700' },
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
  chapterHint: {
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  savedInlineCard: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  savedInlineTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  savedInlineSubtitle: { marginTop: 4, color: Colors.textSecondary, fontSize: 12 },
  verseRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  verseRowSelected: { backgroundColor: 'rgba(22,50,79,0.08)' },
  verseRowSaved: { backgroundColor: 'rgba(200,164,90,0.10)' },
  verseRowPressed: { opacity: 0.82 },
  verseNum: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    minWidth: 28,
    marginTop: 3,
    lineHeight: 20,
  },
  verseNumSelected: { color: Colors.primary },
  verseText: {
    flex: 1,
    fontSize: 17,
    color: Colors.text ?? '#1a1a2e',
    lineHeight: 28,
    letterSpacing: 0.2,
  },
  verseTextSelected: { color: Colors.primary, fontWeight: '500' },
  footerSpacer: { height: 140 },
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
  selectionFooter: { flex: 1, gap: Spacing.sm },
  selectionInfo: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  selectionEyebrow: {
    color: Colors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  selectionTitle: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  selectionActions: { flexDirection: 'row', gap: Spacing.sm },
  clearBtn: {
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  clearBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  savePassageBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savePassageBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
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
  lockedBadge: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(210, 180, 140, 0.15)',
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  lockedText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 13, textAlign: 'center' },
});
