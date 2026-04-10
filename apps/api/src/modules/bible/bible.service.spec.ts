import { Test, TestingModule } from '@nestjs/testing';
import { BibleService } from './bible.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('BibleService', () => {
  let service: BibleService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BibleService,
        {
          provide: PrismaService,
          useValue: {
            bibleBook: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            bibleChapter: {
              findUnique: jest.fn(),
            },
            savedPassage: {
              create: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BibleService>(BibleService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getBooks', () => {
    it('should return all books', async () => {
      const books = [
        { id: '1', title: 'Genesis', chapters: 50 },
        { id: '2', title: 'Exodus', chapters: 40 },
      ];

      jest.spyOn(prisma.bibleBook, 'findMany').mockResolvedValue(books as any);

      const result = await service.getBooks();

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(prisma.bibleBook.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no books', async () => {
      jest.spyOn(prisma.bibleBook, 'findMany').mockResolvedValue([]);

      const result = await service.getBooks();

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('getChapter', () => {
    it('should return chapter with verses', async () => {
      const chapter = {
        id: '1',
        bookId: '1',
        chapterNumber: 1,
        verses: [
          { id: '1', verseNumber: 1, text: 'In the beginning...' },
          { id: '2', verseNumber: 2, text: 'And the earth...' },
        ],
      };

      jest.spyOn(prisma.bibleChapter, 'findUnique').mockResolvedValue(chapter as any);

      const result = await service.getChapter('1', 1);

      expect(result).toBeDefined();
      expect(result.verses).toHaveLength(2);
      expect(prisma.bibleChapter.findUnique).toHaveBeenCalled();
    });

    it('should return null if chapter not found', async () => {
      jest.spyOn(prisma.bibleChapter, 'findUnique').mockResolvedValue(null);

      const result = await service.getChapter('999', 999);

      expect(result).toBeNull();
    });
  });

  describe('savePassage', () => {
    it('should save a passage', async () => {
      const savePassageDto = {
        bookId: '1',
        chapter: 1,
        startVerse: 1,
        endVerse: 5,
        notes: 'Important passage',
      };

      const savedPassage = {
        id: '1',
        userId: '1',
        ...savePassageDto,
        createdAt: new Date(),
      };

      jest.spyOn(prisma.savedPassage, 'create').mockResolvedValue(savedPassage as any);

      const result = await service.savePassage('1', savePassageDto);

      expect(result).toBeDefined();
      expect(result.notes).toBe(savePassageDto.notes);
      expect(prisma.savedPassage.create).toHaveBeenCalled();
    });
  });

  describe('getSavedPassages', () => {
    it('should return user saved passages', async () => {
      const savedPassages = [
        {
          id: '1',
          userId: '1',
          bookId: '1',
          chapter: 1,
          startVerse: 1,
          endVerse: 5,
        },
        {
          id: '2',
          userId: '1',
          bookId: '2',
          chapter: 2,
          startVerse: 1,
          endVerse: 10,
        },
      ];

      jest.spyOn(prisma.savedPassage, 'findMany').mockResolvedValue(savedPassages as any);

      const result = await service.getSavedPassages('1');

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(prisma.savedPassage.findMany).toHaveBeenCalledWith({
        where: { userId: '1' },
      });
    });
  });

  describe('deletePassage', () => {
    it('should delete a saved passage', async () => {
      jest.spyOn(prisma.savedPassage, 'delete').mockResolvedValue({ id: '1' } as any);

      const result = await service.deletePassage('1', '1');

      expect(prisma.savedPassage.delete).toHaveBeenCalled();
    });
  });
});
