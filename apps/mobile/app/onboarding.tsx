import { useMemo, useRef, useState, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, Button, Icon, Logo, Screen, Text } from '../components/ui';
import theme from '../constants/theme';
import { useOnboarding } from '../hooks/useOnboarding';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  surface: string;
  highlights: string[];
};

const slides: Slide[] = [
  {
    id: 'ritual',
    eyebrow: 'Silencio com direcao',
    title: 'Um app catolico feito para ritmo, presenca e constancia.',
    description:
      'O Sanctum organiza sua rotina espiritual com uma experiencia mais contemplativa e menos dispersa.',
    icon: 'church',
    accent: '#E7C98A',
    surface: '#224767',
    highlights: ['Oracao guiada', 'Rotina diaria', 'Liturgia com contexto'],
  },
  {
    id: 'word',
    eyebrow: 'Palavra guardada',
    title: 'Volte aos trechos da Biblia que falaram com voce.',
    description:
      'Salve passagens, crie notas pessoais e transforme a leitura em memoria espiritual viva.',
    icon: 'book-open-page-variant-outline',
    accent: '#C9A867',
    surface: '#173754',
    highlights: ['Favoritos biblicos', 'Notas pessoais', 'Rezar com um trecho salvo'],
  },
  {
    id: 'journey',
    eyebrow: 'Caminhada pessoal',
    title: 'Menos feed. Mais profundidade no que realmente sustenta a sua vida interior.',
    description:
      'Acompanhe sua jornada, retome o que marcou sua semana e construa um habito espiritual com beleza e calma.',
    icon: 'heart-outline',
    accent: '#F1D7A1',
    surface: '#102B45',
    highlights: ['Sessoes guiadas', 'Sequencia diaria', 'Ambiente premium e reverente'],
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dotWidthAnim = useRef(new Animated.Value(10)).current;
  const { completeOnboarding } = useOnboarding();

  useEffect(() => {
    Animated.timing(dotWidthAnim, {
      toValue: 28,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [activeIndex, dotWidthAnim]);

  const isLastSlide = activeIndex === slides.length - 1;
  const currentSlide = useMemo(() => slides[activeIndex], [activeIndex]);
  const footerHeight = isLastSlide ? 176 : 120;
  const panelHeight = Math.max(
    420,
    SCREEN_HEIGHT - insets.top - insets.bottom - footerHeight - 120,
  );

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(Math.max(0, Math.min(nextIndex, slides.length - 1)));
  };

  const goToSlide = (index: number) => {
    listRef.current?.scrollToOffset({ offset: index * SCREEN_WIDTH, animated: true });
    setActiveIndex(index);
  };

  const handleContinue = async () => {
    if (!isLastSlide) {
      goToSlide(activeIndex + 1);
      return;
    }

    await completeOnboarding();
    router.replace('/(auth)/register');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(auth)/register');
  };

  return (
    <Screen backgroundColor="primary">
      <Box flex={1} style={styles.container}>
        <View style={styles.bgGlowTop} />
        <View style={styles.bgGlowBottom} />

        <Box px="lg" pt="lg" pb="md" flexDirection="row" justifyContent="space-between" alignItems="center">
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Logo size={36} variant="accent" />
            <Text variant="bodyStrong" color="white">
              Sanctum
            </Text>
          </Box>

          <Pressable onPress={handleSkip}>
            {({ pressed }) => (
              <Text variant="bodyStrong" color="accentLight" opacity={pressed ? 0.72 : 1}>
                Pular
              </Text>
            )}
          </Pressable>
        </Box>

        <Box flex={1} justifyContent="center">
          <FlatList
            ref={listRef}
            data={slides}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            bounces={false}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            style={{ flexGrow: 0 }}
            onMomentumScrollEnd={handleMomentumEnd}
            renderItem={({ item }) => (
              <Box width={SCREEN_WIDTH} px="lg">
                <Box style={[styles.heroPanel, { backgroundColor: item.surface, minHeight: panelHeight }]}>
                  <View style={[styles.panelGlowLarge, { backgroundColor: `${item.accent}1F` }]} />
                  <View style={[styles.panelGlowSmall, { backgroundColor: `${item.accent}16` }]} />

                  <Box style={[styles.iconShell, { borderColor: `${item.accent}45`, backgroundColor: `${item.accent}18` }]}>
                    <Icon name={item.icon} size={42} color={item.accent} />
                  </Box>

                  <Text variant="overline" color="accentLight" mb="sm">
                    {item.eyebrow}
                  </Text>
                  <Text variant="display" mb="md">
                    {item.title}
                  </Text>
                  <Text variant="body" color="white" opacity={0.78} style={styles.description}>
                    {item.description}
                  </Text>

                  <Box mt="xl" gap="sm">
                    {item.highlights.map((highlight) => (
                      <Box key={highlight} style={styles.highlightRow}>
                        <Box style={[styles.highlightDot, { backgroundColor: item.accent }]} />
                        <Text variant="bodyStrong" color="white">
                          {highlight}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          />
        </Box>

        <Box px="lg" pb="xl" pt="md">
          <Box flexDirection="row" justifyContent="center" gap="sm" mb="lg">
            {slides.map((slide, index) => (
              <Pressable key={slide.id} onPress={() => goToSlide(index)}>
                {index === activeIndex ? (
                  <Animated.View
                    style={[
                      styles.dot,
                      { width: dotWidthAnim, backgroundColor: currentSlide.accent },
                    ]}
                  />
                ) : (
                  <View style={styles.dot} />
                )}
              </Pressable>
            ))}
          </Box>

          {isLastSlide ? (
            <Box gap="sm">
              <Button variant="primary" size="lg" onPress={handleContinue}>
                Criar minha conta
              </Button>
              <Button variant="secondary" size="lg" onPress={handleSkip}>
                Ja tenho conta
              </Button>
            </Box>
          ) : (
            <Button variant="primary" size="lg" onPress={handleContinue}>
              Continuar
            </Button>
          )}
        </Box>
      </Box>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primaryDark,
  },
  bgGlowTop: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    right: -80,
    top: -120,
    backgroundColor: 'rgba(200,164,90,0.10)',
  },
  bgGlowBottom: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    left: -90,
    bottom: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(230,201,141,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(230,201,141,0.18)',
  },
  heroPanel: {
    borderRadius: theme.borderRadii.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 10,
  },
  panelGlowLarge: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -70,
    top: -80,
  },
  panelGlowSmall: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    left: -40,
    bottom: 80,
  },
  iconShell: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing['2xl'],
    borderWidth: 1,
  },
  description: {
    maxWidth: '92%',
    lineHeight: 24,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadii.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  highlightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});
