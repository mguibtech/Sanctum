import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { RosaryAPI } from '../../services/api';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import { XpToast } from '../../components/ui';
import { Colors, Spacing, Radius } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Orações completas ────────────────────────────────────────────────────
const PRAYERS: Record<string, { title: string; text: string }> = {
  creed: {
    title: 'Creio em Deus',
    text: 'Creio em Deus Pai todo-poderoso, criador do céu e da terra; e em Jesus Cristo, seu único Filho, nosso Senhor; que foi concebido pelo poder do Espírito Santo; nasceu da Virgem Maria; padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado; desceu à mansão dos mortos; ressuscitou ao terceiro dia; subiu aos céus, está sentado à direita de Deus Pai todo-poderoso, donde há de vir a julgar os vivos e os mortos. Creio no Espírito Santo, na santa Igreja Católica, na comunhão dos santos, na remissão dos pecados, na ressurreição da carne, na vida eterna. Amém.',
  },
  ourFather: {
    title: 'Pai Nosso',
    text: 'Pai Nosso que estais no céu, santificado seja o Vosso nome, venha a nós o Vosso reino, seja feita a Vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje, perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido, e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.',
  },
  hailMary: {
    title: 'Ave Maria',
    text: 'Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora da nossa morte. Amém.',
  },
  glory: {
    title: 'Glória',
    text: 'Glória ao Pai, ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre, e pelos séculos dos séculos. Amém.',
  },
  fatima: {
    title: 'Oração de Fátima',
    text: 'Ó meu Jesus, perdoai-nos os nossos pecados, preservai-nos do fogo do inferno, levai as almas todas para o céu, principalmente as que mais precisarem da Vossa misericórdia. Amém.',
  },
};

// ─── Estrutura de um mistério ─────────────────────────────────────────────
// Sequência: Pai Nosso → 10 Ave Maria → Glória → Fátima
type PrayerStep =
  | { type: 'mystery'; mysteryIndex: number }
  | { type: 'prayer'; prayerKey: string };

function buildRosarySteps(mysteries: string[]): PrayerStep[] {
  const steps: PrayerStep[] = [{ type: 'prayer', prayerKey: 'creed' }];
  for (let i = 0; i < mysteries.length; i++) {
    steps.push({ type: 'mystery', mysteryIndex: i });
    steps.push({ type: 'prayer', prayerKey: 'ourFather' });
    for (let j = 0; j < 10; j++) steps.push({ type: 'prayer', prayerKey: 'hailMary' });
    steps.push({ type: 'prayer', prayerKey: 'glory' });
    steps.push({ type: 'prayer', prayerKey: 'fatima' });
  }
  return steps;
}

// ─── Componente de contas do rosário ─────────────────────────────────────
function BeadRow({ total, current, color }: { total: number; current: number; color: string }) {
  return (
    <View style={beadStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            beadStyles.bead,
            i < current && { backgroundColor: color },
            i === current - 1 && beadStyles.beadActive,
          ]}
        />
      ))}
    </View>
  );
}

const beadStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  bead: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  beadActive: {
    transform: [{ scale: 1.3 }],
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    shadowOpacity: 0.9,
    elevation: 4,
  },
});

// ─── Tela de Introdução ───────────────────────────────────────────────────
function IntroScreen({
  mysteries,
  onStart,
}: {
  mysteries: { name: string; mysteries: string[] };
  onStart: () => void;
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.introContent}>
      <View style={styles.introHeader}>
        <Text style={styles.introEmoji}>📿</Text>
        <Text style={styles.introTitle}>{mysteries.name}</Text>
        <Text style={styles.introSub}>Terço de hoje</Text>
      </View>

      <View style={styles.mysteriesContainer}>
        {mysteries.mysteries.map((m, i) => (
          <View key={i} style={styles.mysteryRow}>
            <View style={styles.mysteryBullet}>
              <Text style={styles.mysteryBulletText}>{i + 1}</Text>
            </View>
            <Text style={styles.mysteryText}>{m}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sequenceBox}>
        <Text style={styles.sequenceTitle}>Sequência de cada mistério</Text>
        <Text style={styles.sequenceItem}>✝  Pai Nosso</Text>
        <Text style={styles.sequenceItem}>⟳  10 Ave Marias</Text>
        <Text style={styles.sequenceItem}>✦  Glória</Text>
        <Text style={styles.sequenceItem}>✧  Oração de Fátima</Text>
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.85}>
        <Text style={styles.startBtnText}>Começar o Terço 🙏</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Tela de Mistério (anúncio entre sequências) ──────────────────────────
function MysteryAnnouncement({
  num,
  text,
  onNext,
}: {
  num: number;
  text: string;
  onNext: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.mysteryScreen, { opacity: fadeAnim }]}>
      <Text style={styles.mysteryAnnouncementLabel}>{num}° Mistério</Text>
      <Text style={styles.mysteryAnnouncementText}>{text}</Text>
      <TouchableOpacity style={styles.mysteryNextBtn} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.mysteryNextBtnText}>Iniciar meditação →</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Tela de Oração ───────────────────────────────────────────────────────
function PrayerScreen({
  step,
  stepIndex,
  totalSteps,
  mysteries,
  currentMysteryIndex,
  hailMaryCount,
  onPrevious,
  onNext,
  isLast,
}: {
  step: PrayerStep & { type: 'prayer' };
  stepIndex: number;
  totalSteps: number;
  mysteries: string[];
  currentMysteryIndex: number;
  hailMaryCount: number;
  onPrevious: () => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const prayer = PRAYERS[step.prayerKey];

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [stepIndex]);

  const progress = stepIndex / (totalSteps - 1);
  const isHailMary = step.prayerKey === 'hailMary';

  return (
    <View style={styles.prayerContainer}>
      {/* Barra de progresso geral */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Cabeçalho: mistério atual */}
      <View style={styles.prayerHeader}>
        <Text style={styles.prayerMysteryLabel} numberOfLines={2}>
          {currentMysteryIndex >= 0 ? `${currentMysteryIndex + 1}° Mistério: ${mysteries[currentMysteryIndex]}` : 'Início do Terço'}
        </Text>
      </View>

      {/* Contagem de Ave-Marias */}
      {isHailMary && (
        <View style={styles.beadContainer}>
          <BeadRow total={10} current={hailMaryCount} color={Colors.accent} />
          <Text style={styles.beadLabel}>{hailMaryCount} / 10</Text>
        </View>
      )}

      {/* Card da oração */}
      <Animated.View style={[styles.prayerCard, { opacity: fadeAnim }]}>
        <Text style={styles.prayerTitle}>{prayer.title}</Text>
        <ScrollView style={styles.prayerScrollArea} showsVerticalScrollIndicator={false}>
          <Text style={styles.prayerText}>{prayer.text}</Text>
        </ScrollView>
      </Animated.View>

      {/* Navegação */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navBtnBack} onPress={onPrevious} activeOpacity={0.7}>
          <Text style={styles.navBtnBackText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtnNext, isLast && styles.navBtnFinish]}
          onPress={onNext}
          activeOpacity={0.85}
        >
          <Text style={styles.navBtnNextText}>
            {isLast ? '✝  Concluir Terço' : 'Próximo  ›'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Tela de Conclusão ────────────────────────────────────────────────────
function DoneScreen({ onRestart }: { onRestart: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1, tension: 60, friction: 8, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.doneContainer}>
      <Animated.Text style={[styles.doneCross, { transform: [{ scale: scaleAnim }] }]}>
        ✝️
      </Animated.Text>
      <Text style={styles.doneTitle}>Terço concluído!</Text>
      <Text style={styles.doneSub}>
        Que Nossa Senhora interceda por você e por todos por quem você rezou hoje.
      </Text>
      <View style={styles.doneQuote}>
        <Text style={styles.doneQuoteText}>
          "O Rosário é a arma mais poderosa contra os males do mundo."
        </Text>
        <Text style={styles.doneQuoteAuthor}>— São Padre Pio</Text>
      </View>
      <TouchableOpacity style={styles.startBtn} onPress={onRestart} activeOpacity={0.85}>
        <Text style={styles.startBtnText}>Rezar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────
export default function RosaryScreen() {
  const [mysteries, setMysteries] = useState<{ name: string; mysteries: string[] } | null>(null);
  const [phase, setPhase] = useState<'loading' | 'intro' | 'praying' | 'done'>('loading');
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<PrayerStep[]>([]);
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

  useEffect(() => {
    RosaryAPI.getToday().then((res) => {
      setMysteries(res.data);
      setPhase('intro');
    });
  }, []);

  const start = useCallback(() => {
    if (!mysteries) return;
    const built = buildRosarySteps(mysteries.mysteries);
    setSteps(built);
    setStepIndex(0);
    setPhase('praying');
  }, [mysteries]);

  const goNext = useCallback(async () => {
    hapticLight();
    if (stepIndex >= steps.length - 1) {
      const response = await RosaryAPI.complete();
      hapticSuccess();
      const xp = response.data?.xp;
      if (xp?.xpGained) {
        setXpToast({
          xpGained: xp.xpGained,
          leveledUp: xp.leveledUp ?? false,
          newLevelName: xp.newLevelName ?? null,
          visible: true,
        });
      }
      setPhase('done');
      return;
    }
    setStepIndex((i) => i + 1);
  }, [stepIndex, steps.length]);

  const goPrev = useCallback(() => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }, [stepIndex]);

  const restart = useCallback(() => {
    setStepIndex(0);
    setPhase('intro');
  }, []);

  // ── Renders ──────────────────────────────────────────────────────────────
  let content = null;

  if (phase === 'loading') {
    content = (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  } else if (phase === 'intro' && mysteries) {
    content = <IntroScreen mysteries={mysteries} onStart={start} />;
  } else if (phase === 'done') {
    content = <DoneScreen onRestart={restart} />;
  } else if (phase === 'praying' && steps.length > 0) {
    const currentStep = steps[stepIndex];

    // Calcula o mistério atual (qual dos 5 estamos)
    let currentMysteryIndex = -1;
    for (let i = stepIndex; i >= 0; i--) {
      if (steps[i].type === 'mystery') {
        currentMysteryIndex = (steps[i] as { type: 'mystery'; mysteryIndex: number }).mysteryIndex;
        break;
      }
    }

    // Conta quantas Ave Marias já foram no mistério atual
    let hailMaryCount = 0;
    if (currentStep.type === 'prayer' && currentStep.prayerKey === 'hailMary') {
      for (let i = stepIndex - 1; i >= 0; i--) {
        const s = steps[i];
        if (s.type === 'mystery') break;
        if (s.type === 'prayer' && s.prayerKey === 'hailMary') hailMaryCount++;
      }
      hailMaryCount += 1; // conta o atual
    }

    if (currentStep.type === 'mystery') {
      content = (
        <MysteryAnnouncement
          num={currentStep.mysteryIndex + 1}
          text={mysteries!.mysteries[currentStep.mysteryIndex]}
          onNext={goNext}
        />
      );
    } else {
      content = (
        <PrayerScreen
          step={currentStep as PrayerStep & { type: 'prayer' }}
          stepIndex={stepIndex}
          totalSteps={steps.length}
          mysteries={mysteries!.mysteries}
          currentMysteryIndex={currentMysteryIndex}
          hailMaryCount={hailMaryCount}
          onPrevious={goPrev}
          onNext={goNext}
          isLast={stepIndex === steps.length - 1}
        />
      );
    }
  }

  return (
    <>
      {content}
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

// ─── Estilos ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },

  // Intro
  introContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
  },
  introHeader: {
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg,
  },
  introEmoji: { fontSize: 52, marginBottom: Spacing.sm },
  introTitle: { fontSize: 22, fontWeight: '700', color: '#fff', textAlign: 'center' },
  introSub: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  mysteriesContainer: { gap: Spacing.sm, marginBottom: Spacing.lg },
  mysteryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  mysteryBullet: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  mysteryBulletText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  mysteryText: { flex: 1, fontSize: 15, color: Colors.text, lineHeight: 22 },
  sequenceBox: {
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    paddingLeft: Spacing.md,
    gap: Spacing.xs,
  },
  sequenceTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1, marginBottom: Spacing.xs },
  sequenceItem: { fontSize: 14, color: Colors.text },
  startBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    paddingVertical: Spacing.lg, alignItems: 'center',
  },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 18 },

  // Mystery announcement
  mysteryScreen: {
    flex: 1, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: Spacing.lg,
  },
  mysteryAnnouncementLabel: {
    fontSize: 14, fontWeight: '700', color: Colors.accent,
    letterSpacing: 2, textTransform: 'uppercase',
  },
  mysteryAnnouncementText: {
    fontSize: 26, fontWeight: '700', color: '#fff',
    textAlign: 'center', lineHeight: 36,
  },
  mysteryNextBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
  },
  mysteryNextBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 17 },

  // Prayer
  prayerContainer: { flex: 1, backgroundColor: Colors.background },
  progressTrack: { height: 3, backgroundColor: Colors.border },
  progressFill: { height: '100%', backgroundColor: Colors.accent },
  prayerHeader: {
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  prayerMysteryLabel: { color: Colors.accent, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  beadContainer: { alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
  beadLabel: { marginTop: Spacing.sm, fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  prayerCard: {
    flex: 1,
    margin: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
  },
  prayerTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.textSecondary,
    letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: Spacing.md,
    textAlign: 'center',
  },
  prayerScrollArea: { flex: 1 },
  prayerText: {
    fontSize: 18, color: Colors.text,
    lineHeight: 30, textAlign: 'center', fontStyle: 'italic',
  },
  navRow: {
    flexDirection: 'row', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl, paddingTop: Spacing.sm,
  },
  navBtnBack: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnBackText: { fontSize: 24, color: Colors.text },
  navBtnNext: {
    flex: 1, height: 52, borderRadius: Radius.lg,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  navBtnFinish: { backgroundColor: Colors.accent },
  navBtnNextText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  // Done
  doneContainer: {
    flex: 1, backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center',
    padding: Spacing.xl, gap: Spacing.lg,
  },
  doneCross: { fontSize: 80 },
  doneTitle: { fontSize: 28, fontWeight: '700', color: Colors.primary, textAlign: 'center' },
  doneSub: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  doneQuote: {
    paddingVertical: Spacing.lg,
    paddingLeft: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    width: '100%',
  },
  doneQuoteText: { fontSize: 15, color: Colors.text, fontStyle: 'italic', lineHeight: 22 },
  doneQuoteAuthor: { fontSize: 13, color: Colors.textSecondary, marginTop: Spacing.sm, fontWeight: '600' },
});
