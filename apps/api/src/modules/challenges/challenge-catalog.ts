import { ChallengeType } from '@prisma/client';

export type ChallengeDefinition = {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  goal: number;
  xpReward: number;
  shieldReward: boolean;
  icon: string;
};

export const CHALLENGE_CATALOG: ChallengeDefinition[] = [
  {
    id: 'liturgy_5days',
    type: ChallengeType.LITURGY_READ,
    title: 'Leitor Fiel',
    description: 'Leia a liturgia do dia por 5 dias esta semana.',
    goal: 5,
    xpReward: 60,
    shieldReward: false,
    icon: 'book-open-variant',
  },
  {
    id: 'liturgy_contemplated_3',
    type: ChallengeType.CONTEMPLATION,
    title: 'Coração Contemplativo',
    description: 'Contemple a liturgia do dia por 3 dias esta semana.',
    goal: 3,
    xpReward: 80,
    shieldReward: false,
    icon: 'meditation',
  },
  {
    id: 'bible_5chapters',
    type: ChallengeType.BIBLE_CHAPTERS,
    title: 'Estudioso',
    description: 'Leia 5 capítulos da Bíblia esta semana.',
    goal: 5,
    xpReward: 50,
    shieldReward: false,
    icon: 'book-cross',
  },
  {
    id: 'bible_10chapters',
    type: ChallengeType.BIBLE_CHAPTERS,
    title: 'Peregrino das Escrituras',
    description: 'Leia 10 capítulos da Bíblia esta semana.',
    goal: 10,
    xpReward: 100,
    shieldReward: true,
    icon: 'church',
  },
  {
    id: 'rosary_3',
    type: ChallengeType.ROSARY,
    title: 'Devoto de Maria',
    description: 'Complete 3 terços com Nossa Senhora esta semana.',
    goal: 3,
    xpReward: 60,
    shieldReward: false,
    icon: 'circle-multiple',
  },
  {
    id: 'rosary_5',
    type: ChallengeType.ROSARY,
    title: 'Servo de Maria',
    description: 'Complete 5 terços com Nossa Senhora esta semana.',
    goal: 5,
    xpReward: 100,
    shieldReward: true,
    icon: 'circle-multiple-outline',
  },
  {
    id: 'community_5prayers',
    type: ChallengeType.COMMUNITY_PRAYER,
    title: 'Intercessor',
    description: 'Ore por 5 intenções da comunidade esta semana.',
    goal: 5,
    xpReward: 40,
    shieldReward: false,
    icon: 'hand-heart-outline',
  },
  {
    id: 'contemplation_5',
    type: ChallengeType.CONTEMPLATION,
    title: 'Alma em Oração',
    description: 'Contemple leituras litúrgicas ou bíblicas 5 vezes esta semana.',
    goal: 5,
    xpReward: 80,
    shieldReward: true,
    icon: 'candle',
  },
];

// Retorna 3 desafios ativos de forma determinística com base na semana do ano
export function getActiveChallengesForWeek(weekKey: string): ChallengeDefinition[] {
  // Hash simples do weekKey para selecionar desafios de forma rotacional
  const hash = weekKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const offset = hash % CHALLENGE_CATALOG.length;

  const selected: ChallengeDefinition[] = [];
  const usedTypes = new Set<ChallengeType>();

  for (let i = 0; i < CHALLENGE_CATALOG.length && selected.length < 3; i++) {
    const challenge = CHALLENGE_CATALOG[(offset + i) % CHALLENGE_CATALOG.length];
    if (!usedTypes.has(challenge.type)) {
      selected.push(challenge);
      usedTypes.add(challenge.type);
    }
  }

  return selected;
}

export function getWeekKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
  const weekNum = Math.ceil((dayOfYear + startOfYear.getUTCDay() + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

export function getWeekEnd(weekKey: string): Date {
  const [year, weekStr] = weekKey.split('-W');
  const weekNum = parseInt(weekStr, 10);
  const jan1 = new Date(Date.UTC(parseInt(year, 10), 0, 1));
  const dayOffset = (1 - jan1.getUTCDay() + 7) % 7; // dias até segunda-feira
  const monday = new Date(jan1.getTime() + (dayOffset + (weekNum - 1) * 7) * 86400000);
  const sunday = new Date(monday.getTime() + 7 * 86400000); // próxima segunda = fim da semana
  return sunday;
}
