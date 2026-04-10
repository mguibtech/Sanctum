import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding content library...');

  // Clear existing content (optional, for dev)
  // await prisma.userSeriesProgress.deleteMany();
  // await prisma.contentSessionTag.deleteMany();
  // await prisma.contentSession.deleteMany();
  // await prisma.contentSeries.deleteMany();
  // await prisma.audioAsset.deleteMany();
  // await prisma.contentTag.deleteMany();

  // Create tags
  const tags = await Promise.all([
    prisma.contentTag.upsert({
      where: { slug: 'lent' },
      update: {},
      create: { slug: 'lent', label: 'Quaresma' },
    }),
    prisma.contentTag.upsert({
      where: { slug: 'peace' },
      update: {},
      create: { slug: 'peace', label: 'Paz' },
    }),
    prisma.contentTag.upsert({
      where: { slug: 'sleep' },
      update: {},
      create: { slug: 'sleep', label: 'Sono' },
    }),
    prisma.contentTag.upsert({
      where: { slug: 'novena' },
      update: {},
      create: { slug: 'novena', label: 'Novena' },
    }),
  ]);

  // Create audio assets (placeholder URLs)
  const audioAssets = await Promise.all([
    prisma.audioAsset.create({
      data: {
        url: 'https://example.com/audio/meditation-1.m4a',
        provider: 'S3',
        durationSeconds: 600,
        fileSizeBytes: 12000000,
        language: 'pt-BR',
        voiceName: 'Mariana (female)',
      },
    }),
    prisma.audioAsset.create({
      data: {
        url: 'https://example.com/audio/gospel-reflection-1.m4a',
        provider: 'S3',
        durationSeconds: 480,
        fileSizeBytes: 9600000,
        language: 'pt-BR',
        voiceName: 'João (male)',
      },
    }),
    prisma.audioAsset.create({
      data: {
        url: 'https://example.com/audio/night-prayer.m4a',
        provider: 'S3',
        durationSeconds: 300,
        fileSizeBytes: 6000000,
        language: 'pt-BR',
        voiceName: 'Maria (female)',
      },
    }),
  ]);

  // Create content series
  const series1 = await prisma.contentSeries.upsert({
    where: { slug: 'seven-day-lenten-reflection' },
    update: {},
    create: {
      slug: 'seven-day-lenten-reflection',
      title: 'Reflexão Quaresmal de 7 Dias',
      description:
        'Uma jornada de reflexão profunda sobre o significado da Quaresma, com meditações diárias guiadas.',
      category: 'LENT',
      level: 'BEGINNER',
      estimatedDays: 7,
      imageUrl: 'https://example.com/images/lent.jpg',
      priority: 10,
      isPublished: true,
    },
  });

  const series2 = await prisma.contentSeries.upsert({
    where: { slug: 'nightly-sleep-prayer' },
    update: {},
    create: {
      slug: 'nightly-sleep-prayer',
      title: 'Oração Noturna para Paz',
      description:
        'Meditações e orações para encerrar o dia com serenidade e paz interior.',
      category: 'SLEEP',
      level: 'BEGINNER',
      estimatedDays: 1,
      imageUrl: 'https://example.com/images/sleep.jpg',
      priority: 8,
      isPublished: true,
    },
  });

  // Create content sessions for series 1
  const lentSessions = await Promise.all([
    prisma.contentSession.create({
      data: {
        seriesId: series1.id,
        slug: 'lent-day-1-introduction',
        title: 'Dia 1 — Introdução à Quaresma',
        description:
          'Compreendendo o significado espiritual dos 40 dias de preparação.',
        sessionType: 'GOSPEL_REFLECTION',
        dayNumber: 1,
        durationSeconds: 480,
        scriptText:
          'Neste primeiro dia, refletiremos sobre...',
        audioAssetId: audioAssets[1].id,
        isPublished: true,
      },
    }),
    prisma.contentSession.create({
      data: {
        seriesId: series1.id,
        slug: 'lent-day-2-repentance',
        title: 'Dia 2 — O Caminho do Arrependimento',
        description: 'Explorando a graça do arrependimento e renovação espiritual.',
        sessionType: 'MEDITATION',
        dayNumber: 2,
        durationSeconds: 600,
        scriptText: 'O arrependimento é...',
        audioAssetId: audioAssets[0].id,
        isPublished: true,
      },
    }),
    prisma.contentSession.create({
      data: {
        seriesId: series1.id,
        slug: 'lent-day-3-fasting',
        title: 'Dia 3 — O Significado do Jejum',
        description: 'Jejum como instrumento de transformação e proximidade com Deus.',
        sessionType: 'GOSPEL_REFLECTION',
        dayNumber: 3,
        durationSeconds: 480,
        scriptText: 'O jejum não é apenas...',
        audioAssetId: audioAssets[1].id,
        isPublished: true,
      },
    }),
  ]);

  // Create content sessions for series 2
  const sleepSessions = await Promise.all([
    prisma.contentSession.create({
      data: {
        seriesId: series2.id,
        slug: 'nightly-prayer-evening-peace',
        title: 'Oração Noturna para Paz Interior',
        description: 'Uma meditação guiada para encerrar o dia com tranquilidade.',
        sessionType: 'SLEEP',
        dayNumber: 1,
        durationSeconds: 300,
        scriptText: 'Feche os olhos e respire profundamente...',
        audioAssetId: audioAssets[2].id,
        isPublished: true,
      },
    }),
  ]);

  // Add tags to sessions
  await Promise.all([
    prisma.contentSessionTag.create({
      data: { sessionId: lentSessions[0].id, tagId: tags[0].id },
    }),
    prisma.contentSessionTag.create({
      data: { sessionId: lentSessions[1].id, tagId: tags[1].id },
    }),
    prisma.contentSessionTag.create({
      data: { sessionId: sleepSessions[0].id, tagId: tags[2].id },
    }),
  ]);

  console.log('✅ Seed completed!');
  console.log(`📚 Created ${audioAssets.length} audio assets`);
  console.log(`📖 Created 2 content series with ${lentSessions.length + sleepSessions.length} sessions`);
  console.log(`🏷️  Created ${tags.length} tags`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
