import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { BibleService } from '../bible/bible.service';
import { XpService } from '../xp/xp.service';
import { ChallengeService } from '../challenges/challenge.service';
import { SessionsService } from '../sessions/sessions.service';
import { ChallengeType } from '@prisma/client';
import { CATHOLIC_BIBLE_BOOKS } from '../bible/bible.data';
import { CompleteLiturgyDto } from './dto/complete-liturgy.dto';

type DailyContentPayload = {
  gospel: string;
  gospelReference: string | null;
  reflection: string;
  homily: string | null;
  homilyAudioUrl: string | null;
  firstReading: string | null;
  firstReadingReference: string | null;
  secondReading: string | null;
  secondReadingReference: string | null;
  psalm: string | null;
  psalmReference: string | null;
  liturgicalSeason: string | null;
  source: string;
};

type ReadingKind = 'firstReading' | 'secondReading' | 'psalm' | 'gospel';

type ParsedReference = {
  bookId: string;
  bookName: string;
  chapterNum: number;
  reference: string;
  verseStart?: number;
  verseEnd?: number;
  complexRange?: boolean;
};

@Injectable()
export class LiturgyService {
  private readonly logger = new Logger(LiturgyService.name);
  private readonly bibleAliases = this.buildBibleAliases();

  constructor(
    private prisma: PrismaService,
    private http: HttpService,
    private bible: BibleService,
    private xp: XpService,
    private challenges: ChallengeService,
    private sessions: SessionsService,
  ) {}

  async getToday() {
    return this.getByDate(this.todayUTC());
  }

  async getByDate(date: Date) {
    const content = await this.prisma.dailyContent.findUnique({ where: { date } });

    const hasContent = Boolean(
      content && (content.gospel?.trim() || content.firstReading?.trim() || content.psalm?.trim()),
    );
    const hasReferences = Boolean(
      content &&
      (
        content.gospelReference?.trim() ||
        content.firstReadingReference?.trim() ||
        content.secondReadingReference?.trim() ||
        content.psalmReference?.trim()
      ),
    );

    if (!hasContent) {
      this.logger.warn(`Cache vazio para ${date.toISOString().slice(0, 10)} - buscando nas fontes...`);
      return this.fetchAndSave(date);
    }

    if (!hasReferences) {
      this.logger.warn(
        `Cache de ${date.toISOString().slice(0, 10)} sem referencias liturgicas. Tentando enriquecer pela fonte.`,
      );

      try {
        return await this.fetchAndSave(date);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Nao foi possivel enriquecer referencias liturgicas: ${message}`);
      }
    }

    return this.decorateDailyContent(content);
  }

  async fetchAndSave(date: Date): Promise<any> {
    const sources = [
      () => this.fetchApiLiturgiaDiaria(date),
      () => this.fetchCancaoNova(date),
    ];

    for (const [index, source] of sources.entries()) {
      try {
        const payload = await source();
        this.logger.log(`Liturgia obtida da fonte ${index + 1} para ${date.toISOString().slice(0, 10)}`);

        const saved = await this.prisma.dailyContent.upsert({
          where: { date },
          update: payload,
          create: { date, ...payload },
        });

        return this.decorateDailyContent(saved);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Fonte ${index + 1} falhou: ${message}`);
      }
    }

    const latest = await this.prisma.dailyContent.findFirst({
      where: { gospel: { not: '' } },
      orderBy: { date: 'desc' },
    });

    if (latest) {
      this.logger.warn('Servindo conteudo mais recente do cache como fallback.');
      return this.decorateDailyContent(latest);
    }

    throw new NotFoundException('Conteudo liturgico indisponivel no momento. Verifique a conexao do servidor.');
  }

  async debug() {
    const today = this.todayUTC();
    const cached = await this.prisma.dailyContent.findUnique({ where: { date: today } });
    const totalCached = await this.prisma.dailyContent.count();
    const latest = await this.prisma.dailyContent.findFirst({ orderBy: { date: 'desc' } });

    return {
      today: today.toISOString().slice(0, 10),
      todayCached: cached
        ? {
            source: cached.source,
            hasGospel: Boolean(cached.gospel?.trim()),
            hasReading: Boolean(cached.firstReading?.trim()),
            hasReferences: Boolean(
              cached.gospelReference?.trim() ||
              cached.firstReadingReference?.trim() ||
              cached.secondReadingReference?.trim() ||
              cached.psalmReference?.trim(),
            ),
          }
        : null,
      totalCachedDays: totalCached,
      latestCachedDate: latest?.date ?? null,
      hint: !cached
        ? 'Nenhum conteudo para hoje. Chame POST /liturgy/sync para buscar agora.'
        : 'Cache OK.',
    };
  }

  async getTodayCompletion(userId: string) {
    const date = this.todayUTC();
    const completion = await this.prisma.liturgyCompletion.findUnique({
      where: { userId_date: { userId, date } },
    });
    return completion
      ? { completed: true, contemplated: completion.contemplated, totalMarked: completion.totalMarked }
      : { completed: false };
  }

  async completeDailyLiturgy(userId: string, dto: CompleteLiturgyDto) {
    const date = dto.date ? new Date(`${dto.date}T00:00:00.000Z`) : this.todayUTC();
    const content = await this.getByDate(date);
    const contemplated = dto.contemplated ?? false;

    const references: Array<{ kind: ReadingKind; reference: string | null }> = [
      { kind: 'firstReading', reference: content.firstReadingReference },
      { kind: 'secondReading', reference: content.secondReadingReference },
      { kind: 'psalm', reference: content.psalmReference },
      { kind: 'gospel', reference: content.gospelReference },
    ];

    const marked: Array<{
      kind: ReadingKind;
      mode: 'chapter' | 'verses';
      bookId: string;
      bookName: string;
      chapterNum: number;
      verseStart?: number;
      verseEnd?: number;
      reference: string;
    }> = [];
    const skippedReferences: Array<{ kind: ReadingKind; reference: string; reason: string }> = [];

    for (const { kind, reference } of references) {
      if (!reference) continue;

      const parsed = this.parseScriptureReference(reference, kind);
      if (!parsed) {
        skippedReferences.push({ kind, reference, reason: 'Referencia nao reconhecida' });
        continue;
      }

      if (parsed.complexRange) {
        skippedReferences.push({ kind, reference, reason: 'Referencia complexa ainda nao suportada verso a verso' });
        continue;
      }

      if (parsed.verseStart !== undefined && parsed.verseEnd !== undefined) {
        await this.bible.saveVerseRangeProgress(
          userId,
          parsed.bookId,
          parsed.bookName,
          parsed.chapterNum,
          parsed.verseStart,
          parsed.verseEnd,
          contemplated,
        );

        marked.push({
          kind,
          mode: 'verses',
          bookId: parsed.bookId,
          bookName: parsed.bookName,
          chapterNum: parsed.chapterNum,
          verseStart: parsed.verseStart,
          verseEnd: parsed.verseEnd,
          reference,
        });
        continue;
      }

      await this.bible.saveChapterProgress(
        userId,
        parsed.bookId,
        parsed.bookName,
        parsed.chapterNum,
        contemplated,
      );

      marked.push({
        kind,
        mode: 'chapter',
        bookId: parsed.bookId,
        bookName: parsed.bookName,
        chapterNum: parsed.chapterNum,
        reference,
      });
    }

    // Persiste a conclusão no banco (upsert: permite re-marcar com contemplação)
    const existing = await this.prisma.liturgyCompletion.findUnique({
      where: { userId_date: { userId, date } },
    });

    await this.prisma.liturgyCompletion.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, contemplated, totalMarked: marked.length },
      update: { contemplated, totalMarked: marked.length, completedAt: new Date() },
    });

    // Concede XP e progresso de desafios apenas na primeira conclusão do dia
    let xpResult: any = null;
    if (!existing) {
      xpResult = await this.xp.recordLiturgyRead(userId, contemplated, marked.length);
      this.challenges.incrementProgress(userId, ChallengeType.LITURGY_READ).catch(() => {});
      if (contemplated) {
        this.challenges.incrementProgress(userId, ChallengeType.CONTEMPLATION).catch(() => {});
      }
    }

    await this.sessions.logCompletedSession(userId, 'LITURGY', date.toISOString().slice(0, 10), {
      durationSeconds: Math.max(marked.length, 1) * 4 * 60,
      contemplated,
      xpGranted: xpResult?.xpGained ?? 0,
      streakCounted: !existing,
    });

    return {
      date: date.toISOString().slice(0, 10),
      progressMarked: marked,
      skippedReferences,
      totalMarked: marked.length,
      contemplated,
      xp: xpResult,
    };
  }

  private async fetchApiLiturgiaDiaria(date: Date): Promise<DailyContentPayload> {
    const formatted = this.fmtISO(date);
    const { data } = await firstValueFrom(
      this.http.get(`https://api-liturgia-diaria.vercel.app/?date=${formatted}`, { timeout: 8000 }),
    );

    const readings = data?.today?.readings ?? data?.readings ?? {};
    const gospel = readings?.gospel?.text ?? readings?.evangelho?.texto ?? '';
    const gospelReference =
      this.normalizeReference(readings?.gospel?.reference ?? readings?.gospel?.ref ?? readings?.evangelho?.referencia ?? readings?.evangelho?.ref) ??
      this.extractGospelReference(readings?.gospel?.head_title ?? readings?.gospel?.title);
    const firstReading = readings?.first_reading?.text ?? readings?.primeiraLeitura?.texto ?? null;
    const firstReadingReference =
      this.normalizeReference(readings?.first_reading?.reference ?? readings?.first_reading?.ref ?? readings?.primeiraLeitura?.referencia ?? readings?.primeiraLeitura?.ref) ??
      this.extractReadingReference(readings?.first_reading?.title);
    const secondReading = readings?.second_reading?.text ?? readings?.segundaLeitura?.texto ?? null;
    const secondReadingReference =
      this.normalizeReference(readings?.second_reading?.reference ?? readings?.second_reading?.ref ?? readings?.segundaLeitura?.referencia ?? readings?.segundaLeitura?.ref) ??
      this.extractReadingReference(readings?.second_reading?.title);
    const psalm = this.extractPsalm(readings?.psalm ?? readings?.salmo);
    const psalmReference =
      this.normalizeReference(readings?.psalm?.reference ?? readings?.psalm?.ref ?? readings?.salmo?.referencia ?? readings?.salmo?.ref) ??
      this.normalizeReference(readings?.psalm?.title ?? readings?.salmo?.titulo);
    const reflection = this.extractExtra(data?.today?.extra);
    const liturgicalSeason = data?.today?.entry_title ?? data?.liturgia ?? null;

    this.assertHasContent({ gospel, firstReading, psalm });

    return {
      gospel,
      gospelReference,
      reflection,
      homily: null,
      homilyAudioUrl: null,
      firstReading,
      firstReadingReference,
      secondReading,
      secondReadingReference,
      psalm,
      psalmReference,
      liturgicalSeason,
      source: 'api-liturgia-diaria',
    };
  }

  private async fetchCancaoNova(date: Date): Promise<DailyContentPayload> {
    const formatted = this.fmtBR(date);
    const { data } = await firstValueFrom(
      this.http.get(`https://liturgia.cancaonova.com/pb/json/?dt=${formatted}`, { timeout: 8000 }),
    );

    const gospel = data?.evangelho?.texto ?? '';
    const gospelReference = this.normalizeReference(data?.evangelho?.referencia ?? data?.evangelho?.ref);
    const reflection = data?.evangelho?.reflexao ?? data?.evangelho?.ref ?? '';
    const firstReading = data?.primeiraLeitura?.texto ?? null;
    const firstReadingReference = this.normalizeReference(
      data?.primeiraLeitura?.referencia ?? data?.primeiraLeitura?.ref,
    );
    const secondReading = data?.segundaLeitura?.texto ?? null;
    const secondReadingReference = this.normalizeReference(
      data?.segundaLeitura?.referencia ?? data?.segundaLeitura?.ref,
    );
    const psalm = data?.salmo?.texto ?? null;
    const psalmReference = this.normalizeReference(data?.salmo?.referencia ?? data?.salmo?.ref);
    const homily = data?.homilia?.texto ?? null;
    const liturgicalSeason = data?.liturgia ?? null;

    this.assertHasContent({ gospel, firstReading, psalm });

    return {
      gospel,
      gospelReference,
      reflection,
      homily,
      homilyAudioUrl: data?.homilia?.audio ?? null,
      firstReading,
      firstReadingReference,
      secondReading,
      secondReadingReference,
      psalm,
      psalmReference,
      liturgicalSeason,
      source: 'cancaonova',
    };
  }

  private assertHasContent(payload: { gospel: string; firstReading: string | null; psalm: string | null }) {
    if (!payload.gospel?.trim() && !payload.firstReading?.trim() && !payload.psalm?.trim()) {
      throw new Error('Nenhum campo liturgico valido na resposta da API');
    }
  }

  private extractPsalm(psalm: any): string | null {
    if (!psalm) return null;
    if (typeof psalm === 'string') return psalm.trim() || null;
    if (typeof psalm.text === 'string' && psalm.text.trim()) return psalm.text;

    const parts: string[] = [];

    if (psalm.response) parts.push(String(psalm.response));
    if (Array.isArray(psalm.content_psalm)) {
      parts.push(...psalm.content_psalm.filter((item: unknown) => typeof item === 'string'));
    }

    return parts.join('\n\n').trim() || null;
  }

  private extractExtra(extra: any): string {
    if (!extra) return '';
    if (typeof extra === 'string') return extra;
    if (Array.isArray(extra)) return extra.filter(Boolean).join('\n\n');
    return '';
  }

  private normalizeReference(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized || null;
  }

  /**
   * Extrai referência bíblica do campo `head_title` do evangelho.
   * Ex: "Evangelho de Jesus Cristo segundo São Lucas 24, 35-48" → "Lucas 24, 35-48"
   */
  private extractGospelReference(headTitle: unknown): string | null {
    if (typeof headTitle !== 'string') return null;
    const match = headTitle.match(/segundo\s+(?:São\s+|Santo\s+|Santa\s+)?(.+)/i);
    return match ? this.normalizeReference(match[1]) : null;
  }

  /**
   * Extrai referência bíblica do campo `title` de leituras.
   * Ex: "Primeira leitura: Atos 3, 11-26" → "Atos 3, 11-26"
   */
  private extractReadingReference(title: unknown): string | null {
    if (typeof title !== 'string') return null;
    const match = title.match(/(?:Primeira|Segunda)\s+leitura\s*:\s*(.+)/i);
    return match ? this.normalizeReference(match[1]) : this.normalizeReference(title);
  }

  private decorateDailyContent(content: any) {
    return {
      ...content,
      proclamations: {
        firstReading: this.buildReadingProclamation(content.firstReadingReference, 'firstReading'),
        secondReading: this.buildReadingProclamation(content.secondReadingReference, 'secondReading'),
        psalm: this.buildReadingProclamation(content.psalmReference, 'psalm'),
        gospel: this.buildReadingProclamation(content.gospelReference, 'gospel'),
      },
    };
  }

  private buildReadingProclamation(reference: string | null, kind: ReadingKind) {
    const parsed = this.parseScriptureReference(reference, kind);

    if (kind === 'gospel') {
      return {
        greeting: 'O Senhor esteja convosco.\nEle esta no meio de nos.',
        introduction: `Proclamacao do Evangelho de Jesus Cristo segundo ${parsed?.bookName ?? 'o Evangelista'}.`,
        acclamation: 'Gloria a vos, Senhor.',
        conclusion: 'Palavra da Salvacao.',
        reference,
      };
    }

    if (kind === 'psalm') {
      return {
        greeting: null,
        introduction: reference ? `Salmo responsorial (${reference}).` : 'Salmo responsorial.',
        acclamation: null,
        conclusion: null,
        reference,
      };
    }

    const label = kind === 'secondReading' ? 'Segunda leitura' : 'Primeira leitura';

    return {
      greeting: null,
      introduction: reference ? `${label} (${reference}).` : `${label}.`,
      acclamation: null,
      conclusion: 'Palavra do Senhor.',
      reference,
    };
  }

  private parseScriptureReference(reference: string | null, kind: ReadingKind): ParsedReference | null {
    if (!reference) return null;

    const cleaned = reference
      .replace(/^cf\.\s*/i, '')
      .replace(/[–—]/g, '-')
      .trim();
    const match = cleaned.match(/^((?:[1-3]\s*)?[A-Za-zÀ-ÿ.0-9]+(?:\s+[A-Za-zÀ-ÿ.0-9]+)*)\s+(.+)$/);
    if (!match) return null;

    const [, rawBook, location] = match;
    const book = this.resolveBibleBook(rawBook, kind);
    if (!book) return null;

    const chapterMatch = location.match(/^(\d+)(?:\(\d+\))?(?:,\s*(.+))?$/);
    if (!chapterMatch) return null;

    const chapterNum = Number(chapterMatch[1]);
    if (!Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > book.chapters) return null;

    const versePart = chapterMatch[2]?.trim();
    if (!versePart) {
      return {
        bookId: book.id,
        bookName: book.name,
        chapterNum,
        reference,
      };
    }

    if (versePart.includes(';') || versePart.includes('.') || versePart.includes(',')) {
      return {
        bookId: book.id,
        bookName: book.name,
        chapterNum,
        reference,
        complexRange: true,
      };
    }

    const crossChapterMatch = versePart.match(/^(\d+)-(\d+),\s*(\d+)$/);
    if (crossChapterMatch) {
      return {
        bookId: book.id,
        bookName: book.name,
        chapterNum,
        reference,
        complexRange: true,
      };
    }

    const verseRangeMatch = versePart.match(/^(\d+)(?:[a-z])?(?:-(\d+)(?:[a-z])?)?$/i);
    if (!verseRangeMatch) {
      return {
        bookId: book.id,
        bookName: book.name,
        chapterNum,
        reference,
        complexRange: true,
      };
    }

    const verseStart = Number(verseRangeMatch[1]);
    const verseEnd = Number(verseRangeMatch[2] ?? verseRangeMatch[1]);
    if (!Number.isInteger(verseStart) || !Number.isInteger(verseEnd) || verseStart < 1 || verseStart > verseEnd) {
      return null;
    }

    return {
      bookId: book.id,
      bookName: book.name,
      chapterNum,
      reference,
      verseStart,
      verseEnd,
    };
  }

  private resolveBibleBook(rawBook: string, kind: ReadingKind) {
    const normalized = this.normalizeBookToken(rawBook);

    if (normalized === 'jo') {
      return CATHOLIC_BIBLE_BOOKS.find((book) => book.id === (kind === 'gospel' ? 'JHN' : 'JOB')) ?? null;
    }

    const bookId = this.bibleAliases.get(normalized);
    if (!bookId) return null;

    return CATHOLIC_BIBLE_BOOKS.find((book) => book.id === bookId) ?? null;
  }

  private buildBibleAliases() {
    const aliases = new Map<string, string>();

    for (const book of CATHOLIC_BIBLE_BOOKS) {
      const candidates = [
        book.id,
        book.abbreviation,
        book.abbreviation.replace(/\./g, ''),
        book.name,
      ];

      for (const candidate of candidates) {
        aliases.set(this.normalizeBookToken(candidate), book.id);
      }
    }

    const manualAliases: Record<string, string> = {
      salmo: 'PSA',
      salmos: 'PSA',
      sal: 'PSA',
      joao: 'JHN',
      mateus: 'MAT',
      marcos: 'MRK',
      lucas: 'LUK',
      atos: 'ACT',
      at: 'ACT',
      atosdosapostolos: 'ACT',
      apocalipse: 'REV',
      ap: 'REV',
      hebreus: 'HEB',
      hb: 'HEB',
      sabedoria: 'WIS',
      sb: 'WIS',
      eclesiastico: 'SIR',
      sir: 'SIR',
      canticos: 'SNG',
      ct: 'SNG',
      romanos: 'ROM',
      rm: 'ROM',
      corintios: 'CO',
      galatas: 'GAL',
      efesios: 'EPH',
      ef: 'EPH',
      filipenses: 'PHP',
      fl: 'PHP',
      colossenses: 'COL',
      cl: 'COL',
      tessalonicenses: 'TH',
      timoteo: 'TI',
      tito: 'TIT',
      tiago: 'JAS',
      tg: 'JAS',
      pedro: 'PE',
      judas: 'JUD',
    };

    for (const [alias, bookId] of Object.entries(manualAliases)) {
      aliases.set(this.normalizeBookToken(alias), bookId);
    }

    return aliases;
  }

  private normalizeBookToken(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]/g, '')
      .toLowerCase();
  }

  private todayUTC(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  private fmtISO(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fmtBR(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
}
