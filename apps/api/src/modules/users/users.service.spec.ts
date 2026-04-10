import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test User',
      };

      const user = {
        id: '1',
        email: createUserDto.email,
        name: createUserDto.name,
        createdAt: new Date(),
      };

      jest.spyOn(prisma.user, 'create').mockResolvedValue(user as any);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@example.com';
      const user = {
        id: '1',
        email,
        name: 'Test User',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);

      const result = await service.findByEmail(email);

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userId = '1';
      const user = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);

      const result = await service.findById(userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('update', () => {
    it('should update user profile', async () => {
      const userId = '1';
      const updateUserDto = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };

      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        ...updateUserDto,
      };

      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser as any);

      const result = await service.update(userId, updateUserDto);

      expect(result).toBeDefined();
      expect(result.name).toBe(updateUserDto.name);
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const userId = '1';

      jest.spyOn(prisma.user, 'delete').mockResolvedValue({ id: userId } as any);

      const result = await service.delete(userId);

      expect(result).toBeDefined();
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
