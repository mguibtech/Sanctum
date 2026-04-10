export type BadgeDefinition = {
  id: string;
  name: string;
  description: string;
  icon: string; // MaterialCommunityIcons name
  xpReward: number;
};

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: 'first_liturgy',
    name: 'Primeira Missa',
    description: 'Leu a liturgia do dia pela primeira vez.',
    icon: 'book-open-variant',
    xpReward: 20,
  },
  {
    id: 'streak_7',
    name: '7 Dias Seguidos',
    description: 'Manteve uma sequência de 7 dias.',
    icon: 'fire',
    xpReward: 50,
  },
  {
    id: 'streak_30',
    name: 'Mês Fiel',
    description: 'Manteve uma sequência de 30 dias.',
    icon: 'fire-circle',
    xpReward: 150,
  },
  {
    id: 'streak_100',
    name: '100 Dias!',
    description: 'Manteve uma incrível sequência de 100 dias.',
    icon: 'trophy',
    xpReward: 500,
  },
  {
    id: 'bible_10pct',
    name: 'Explorador',
    description: 'Leu 10% de toda a Bíblia.',
    icon: 'book-cross',
    xpReward: 100,
  },
  {
    id: 'bible_50pct',
    name: 'Peregrino',
    description: 'Leu 50% de toda a Bíblia.',
    icon: 'church',
    xpReward: 300,
  },
  {
    id: 'bible_100pct',
    name: 'Testemunha',
    description: 'Leu toda a Bíblia Sagrada.',
    icon: 'crown',
    xpReward: 1000,
  },
  {
    id: 'contemplated_10',
    name: 'Contemplativo',
    description: 'Contemplou 10 leituras sagradas.',
    icon: 'meditation',
    xpReward: 80,
  },
  {
    id: 'rosary_10',
    name: 'Terço Fiel',
    description: 'Completou 10 terços com Nossa Senhora.',
    icon: 'circle-multiple',
    xpReward: 80,
  },
  {
    id: 'ranking_1st',
    name: 'Líder',
    description: 'Ficou em primeiro lugar no ranking semanal.',
    icon: 'medal',
    xpReward: 200,
  },
  {
    id: 'anniversary_1y',
    name: '1 Ano de Fé',
    description: 'Completou 1 ano usando o Sanctum.',
    icon: 'calendar-heart',
    xpReward: 500,
  },
  {
    id: 'challenge_first',
    name: 'Desafiado',
    description: 'Completou seu primeiro desafio semanal.',
    icon: 'flag-checkered',
    xpReward: 50,
  },
];

export function getBadge(id: string): BadgeDefinition | undefined {
  return BADGE_CATALOG.find((b) => b.id === id);
}
