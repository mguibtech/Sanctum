import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CATHOLIC_BIBLE_BOOKS, TOTAL_BIBLE_CHAPTERS } from './bible.data';

type ChapterVerse = {
  id: string;
  text: string;
  reference: string;
};

type ApiBibleChapterResponse = {
  data?: {
    id?: string;
    content?: unknown;
  };
};

type ApiBibleJsonContent = {
  items?: Array<{
    type?: string;
    text?: string;
    attrs?: {
      number?: string;
    };
    items?: ApiBibleJsonContent['items'];
  }>;
};

type VerseProgressRecord = {
  bookId: string;
  bookName: string;
  chapterNum: number;
  verseNum: number;
  contemplated: boolean;
};

@Injectable()
export class BibleService {
  private readonly logger = new Logger(BibleService.name);
  private readonly apiBibleBaseUrl = 'https://api.scripture.api.bible/v1';
  private readonly apiBibleKey = process.env.BIBLE_API_KEY?.trim();
  private readonly apiBibleId = process.env.BIBLE_ID_PT?.trim();

  constructor(
    private prisma: PrismaService,
    private http: HttpService,
  ) {}

  private get verseProgressDelegate() {
    return (this.prisma as any).bibleVerseProgress;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }

  async ping() {
    try {
      const cachedChapters = await this.prisma.bibleChapterCache.count();
      return {
        ok: true,
        source: 'local-cache',
        booksCount: CATHOLIC_BIBLE_BOOKS.length,
        cachedChapters,
      };
    } catch (error) {
      return {
        ok: false,
        source: 'local-cache',
        message: this.getErrorMessage(error),
      };
    }
  }

  async getBooks() {
    return CATHOLIC_BIBLE_BOOKS.map((book) => ({
      id: book.id,
      abbreviation: book.abbreviation,
      name: book.name,
    }));
  }

  async getChapters(bookId: string) {
    const book = this.getBookOrFail(bookId);

    return Array.from({ length: book.chapters }, (_, index) => {
      const number = index + 1;
      return {
        id: `${book.id}.${number}`,
        number: `${number}`,
        reference: `${book.name} ${number}`,
      };
    });
  }

  async getChapter(bookId: string, chapterNum: number) {
    const book = this.getBookOrFail(bookId);

    if (!Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > book.chapters) {
      throw new NotFoundException('Capitulo da Biblia nao encontrado');
    }

    let cached = await this.prisma.bibleChapterCache.findUnique({
      where: { bookId_chapterNum: { bookId, chapterNum } },
    });

    if (!cached) {
      this.logger.warn(`Capitulo ${bookId}.${chapterNum} ausente do cache local. Buscando na API.Bible.`);
      cached = await this.fetchAndCacheChapter(bookId, chapterNum);
    }

    try {
      return this.normalizeChapterContent(JSON.parse(cached.content), bookId, chapterNum);
    } catch (error) {
      this.logger.error(
        `Cache invalido para capitulo ${bookId}.${chapterNum}: ${this.getErrorMessage(error)}`,
      );
      throw new InternalServerErrorException(
        'O capitulo foi encontrado, mas o cache local esta invalido.',
      );
    }
  }

  async saveProgress(
    userId: string,
    bookId: string,
    bookName: string,
    chapterNum: number,
    contemplated: boolean,
    verseStart?: number,
    verseEnd?: number,
  ) {
    const book = this.getBookOrFail(bookId);

    if (!Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > book.chapters) {
      throw new NotFoundException('Capitulo da Biblia nao encontrado');
    }

    const resolvedBookName = bookName?.trim() || book.name;

    if (verseStart !== undefined || verseEnd !== undefined) {
      return this.saveVerseRangeProgress(
        userId,
        bookId,
        resolvedBookName,
        chapterNum,
        verseStart,
        verseEnd,
        contemplated,
      );
    }

    return this.saveChapterProgress(
      userId,
      bookId,
      resolvedBookName,
      chapterNum,
      contemplated,
    );
  }

  async saveChapterProgress(
    userId: string,
    bookId: string,
    bookName: string,
    chapterNum: number,
    contemplated: boolean,
  ) {
    return this.prisma.bibleProgress.upsert({
      where: { userId_bookId_chapterNum: { userId, bookId, chapterNum } },
      update: {
        contemplated: contemplated || undefined,
        lastReadAt: new Date(),
      },
      create: { userId, bookId, bookName, chapterNum, contemplated },
    });
  }

  async saveVerseRangeProgress(
    userId: string,
    bookId: string,
    bookName: string,
    chapterNum: number,
    verseStart?: number,
    verseEnd?: number,
    contemplated = false,
  ) {
    const start = verseStart ?? verseEnd;
    const end = verseEnd ?? verseStart;

    if (!Number.isInteger(start) || !Number.isInteger(end) || start! < 1 || end! < 1 || start! > end!) {
      throw new NotFoundException('Faixa de versiculos invalida');
    }

    const operations = Array.from({ length: end! - start! + 1 }, (_, index) => {
      const verseNum = start! + index;
      return this.verseProgressDelegate.upsert({
        where: {
          userId_bookId_chapterNum_verseNum: {
            userId,
            bookId,
            chapterNum,
            verseNum,
          },
        },
        update: {
          contemplated: contemplated || undefined,
          lastReadAt: new Date(),
        },
        create: {
          userId,
          bookId,
          bookName,
          chapterNum,
          verseNum,
          contemplated,
        },
      });
    });

    await this.prisma.$transaction(operations);

    return {
      mode: 'verses',
      bookId,
      bookName,
      chapterNum,
      verseStart: start,
      verseEnd: end,
      versesMarked: end! - start! + 1,
      contemplated,
    };
  }

  async getProgress(userId: string) {
    const [chapterRecords, verseRecords] = await Promise.all([
      this.prisma.bibleProgress.findMany({ where: { userId } }),
      this.verseProgressDelegate.findMany({
        where: { userId },
        select: {
          bookId: true,
          bookName: true,
          chapterNum: true,
          verseNum: true,
          contemplated: true,
        },
      }) as Promise<VerseProgressRecord[]>,
    ]);

    const completedChapterKeys = new Set(
      chapterRecords.map((record) => this.chapterKey(record.bookId, record.chapterNum)),
    );
    const contemplatedChapterKeys = new Set(
      chapterRecords
        .filter((record) => record.contemplated)
        .map((record) => this.chapterKey(record.bookId, record.chapterNum)),
    );

    const verseGroups = new Map<string, { bookId: string; chapterNum: number; verses: Set<number>; contemplated: Set<number> }>();
    for (const record of verseRecords) {
      const key = this.chapterKey(record.bookId, record.chapterNum);
      const bucket = verseGroups.get(key) ?? {
        bookId: record.bookId,
        chapterNum: record.chapterNum,
        verses: new Set<number>(),
        contemplated: new Set<number>(),
      };

      bucket.verses.add(record.verseNum);
      if (record.contemplated) bucket.contemplated.add(record.verseNum);
      verseGroups.set(key, bucket);
    }

    const unresolvedKeys = Array.from(verseGroups.keys()).filter((key) => !completedChapterKeys.has(key));
    const cachedVerseTotals = await this.loadCachedVerseTotals(unresolvedKeys);

    let fractionalProgress = completedChapterKeys.size;
    let fractionalContemplatedProgress = contemplatedChapterKeys.size;

    for (const key of unresolvedKeys) {
      const group = verseGroups.get(key);
      const totalVerses = cachedVerseTotals.get(key);
      if (!group || !totalVerses || totalVerses < 1) continue;

      const verseCoverage = Math.min(group.verses.size / totalVerses, 1);
      const contemplatedCoverage = Math.min(group.contemplated.size / totalVerses, 1);

      fractionalProgress += verseCoverage;
      fractionalContemplatedProgress += contemplatedCoverage;

      if (group.verses.size >= totalVerses) {
        completedChapterKeys.add(key);
      }

      if (group.contemplated.size >= totalVerses) {
        contemplatedChapterKeys.add(key);
      }
    }

    const startedChapterKeys = new Set<string>([
      ...completedChapterKeys,
      ...verseGroups.keys(),
    ]);

    return {
      percentage: Math.round((fractionalProgress / TOTAL_BIBLE_CHAPTERS) * 100),
      contemplatedPercentage: Math.round((fractionalContemplatedProgress / TOTAL_BIBLE_CHAPTERS) * 100),
      chaptersRead: completedChapterKeys.size,
      chaptersContemplated: contemplatedChapterKeys.size,
      chaptersStarted: startedChapterKeys.size,
      partialChapters: Math.max(startedChapterKeys.size - completedChapterKeys.size, 0),
      versesRead: verseRecords.length,
      versesContemplated: verseRecords.filter((record) => record.contemplated).length,
      totalChapters: TOTAL_BIBLE_CHAPTERS,
    };
  }

  private async fetchAndCacheChapter(bookId: string, chapterNum: number) {
    if (!this.apiBibleKey || !this.apiBibleId) {
      throw new ServiceUnavailableException(
        'Capitulo ausente no cache local e integracao externa da Biblia nao configurada.',
      );
    }

    try {
      const chapterPayload = await this.fetchChapterFromApiBible(bookId, chapterNum);
      const content = JSON.stringify(chapterPayload);

      const saved = await this.prisma.bibleChapterCache.upsert({
        where: { bookId_chapterNum: { bookId, chapterNum } },
        update: {
          content,
          fetchedAt: new Date(),
        },
        create: {
          bookId,
          chapterNum,
          content,
        },
      });

      this.logger.log(`Capitulo ${bookId}.${chapterNum} buscado externamente e salvo no cache local.`);
      return saved;
    } catch (error: any) {
      const status = error?.response?.status;
      const detail = this.getErrorMessage(error?.response?.data ?? error);

      this.logger.error(
        `Falha ao popular ${bookId}.${chapterNum} via API.Bible: ${detail}`,
      );

      if (status === 401 || status === 403) {
        throw new ServiceUnavailableException(
          'Capitulo ausente no cache local e a API.Bible rejeitou as credenciais configuradas.',
        );
      }

      if (status === 404) {
        throw new NotFoundException('Capitulo da Biblia nao encontrado na fonte externa.');
      }

      throw new ServiceUnavailableException(
        'Capitulo ausente no cache local e nao foi possivel popula-lo automaticamente.',
      );
    }
  }

  private async fetchChapterFromApiBible(bookId: string, chapterNum: number): Promise<ChapterVerse[]> {
    const chapterId = `${bookId}.${chapterNum}`;
    const { data } = await firstValueFrom(
      this.http.get<ApiBibleChapterResponse>(
        `${this.apiBibleBaseUrl}/bibles/${this.apiBibleId}/chapters/${chapterId}`,
        {
          headers: {
            'api-key': this.apiBibleKey,
          },
          params: {
            'content-type': 'json',
            'include-notes': false,
            'include-titles': false,
            'include-chapter-numbers': false,
            'include-verse-numbers': true,
            'include-verse-spans': false,
          },
          timeout: 10000,
        },
      ),
    );

    const verses = this.extractVersesFromApiBibleContent(data?.data?.content, bookId, chapterNum);

    if (!verses.length) {
      throw new Error(`Nenhum versiculo valido retornado para ${chapterId}`);
    }

    return verses;
  }

  private extractVersesFromApiBibleContent(
    content: unknown,
    bookId: string,
    chapterNum: number,
  ): ChapterVerse[] {
    const rawItems = (content as ApiBibleJsonContent | undefined)?.items;
    if (!Array.isArray(rawItems)) return [];

    const verses = new Map<number, string[]>();
    let currentVerse = 0;

    const walk = (items: ApiBibleJsonContent['items']) => {
      if (!Array.isArray(items)) return;

      for (const item of items) {
        if (!item) continue;

        if (item.type === 'verse' || item.type === 'verseNumber') {
          const parsed = Number(item.attrs?.number ?? item.text);
          if (Number.isInteger(parsed) && parsed > 0) {
            currentVerse = parsed;
            if (!verses.has(parsed)) verses.set(parsed, []);
          }
        }

        if (typeof item.text === 'string' && currentVerse > 0) {
          const cleanText = item.text.replace(/\s+/g, ' ').trim();
          if (cleanText) {
            const bucket = verses.get(currentVerse) ?? [];
            bucket.push(cleanText);
            verses.set(currentVerse, bucket);
          }
        }

        if (Array.isArray(item.items)) {
          walk(item.items);
        }
      }
    };

    walk(rawItems);

    return Array.from(verses.entries())
      .sort(([left], [right]) => left - right)
      .map(([verseNumber, parts]) => {
        const reference = `${bookId}.${chapterNum}.${verseNumber}`;
        return {
          id: reference,
          reference,
          text: parts.join(' ').replace(/\s+/g, ' ').trim(),
        };
      })
      .filter((verse) => Boolean(verse.text));
  }

  private getBookOrFail(bookId: string) {
    const book = CATHOLIC_BIBLE_BOOKS.find((item) => item.id === bookId);
    if (!book) throw new NotFoundException('Livro da Biblia nao encontrado');
    return book;
  }

  private normalizeChapterContent(
    content: unknown,
    bookId: string,
    chapterNum: number,
  ): ChapterVerse[] {
    const rawVerses = Array.isArray(content)
      ? content
      : Array.isArray((content as any)?.verses)
        ? (content as any).verses
        : [];

    return rawVerses
      .map((verse: any, index: number) => {
        if (typeof verse === 'string') {
          const verseNumber = index + 1;
          const verseId = `${bookId}.${chapterNum}.${verseNumber}`;
          return { id: verseId, text: verse.trim(), reference: verseId };
        }

        const id = verse?.id ?? `${bookId}.${chapterNum}.${index + 1}`;
        const text = typeof verse?.text === 'string' ? verse.text.trim() : '';
        const reference = verse?.reference ?? id;

        if (!text) return null;

        return {
          id,
          text,
          reference,
        };
      })
      .filter((verse): verse is ChapterVerse => Boolean(verse));
  }

  private chapterKey(bookId: string, chapterNum: number) {
    return `${bookId}:${chapterNum}`;
  }

  private async loadCachedVerseTotals(keys: string[]) {
    const totals = new Map<string, number>();
    if (!keys.length) return totals;

    const clauses = keys.map((key) => {
      const [bookId, rawChapter] = key.split(':');
      return {
        bookId,
        chapterNum: Number(rawChapter),
      };
    });

    const cachedChapters = await this.prisma.bibleChapterCache.findMany({
      where: { OR: clauses },
      select: {
        bookId: true,
        chapterNum: true,
        content: true,
      },
    });

    for (const cached of cachedChapters) {
      try {
        const verseCount = this.normalizeChapterContent(
          JSON.parse(cached.content),
          cached.bookId,
          cached.chapterNum,
        ).length;

        if (verseCount > 0) {
          totals.set(this.chapterKey(cached.bookId, cached.chapterNum), verseCount);
        }
      } catch (error) {
        this.logger.warn(
          `Nao foi possivel calcular total de versiculos para ${cached.bookId}.${cached.chapterNum}: ${this.getErrorMessage(error)}`,
        );
      }
    }

    return totals;
  }
}
