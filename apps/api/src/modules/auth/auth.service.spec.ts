import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PreferenceService } from '../personalization/preference.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let preferenceService: PreferenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: PreferenceService,
          useValue: {
            initializePreferences: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    preferenceService = module.get<PreferenceService>(PreferenceService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test User',
      };

      const user = { id: '1', email: registerDto.email, name: registerDto.name };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(user as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('accessToken');
      jest.spyOn(preferenceService, 'initializePreferences').mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('accessToken');
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
    });

    it('should throw error if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'Test123!',
        name: 'Test User',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({ id: '1' } as any);

      await expect(service.register(registerDto)).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Test123!',
      };

      const user = { id: '1', email: loginDto.email, password: 'hashedPassword' };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user as any);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('accessToken');

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('accessToken');
    });

    it('should throw error if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Test123!',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow();
    });

    it('should throw error if password is invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword!',
      };

      const user = { id: '1', email: loginDto.email, password: 'hashedPassword' };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user as any);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow();
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      const token = 'validToken';
      const payload = { sub: '1', email: 'test@example.com' };

      jest.spyOn(jwtService, 'verify').mockReturnValue(payload);
      jest.spyOn(usersService, 'findById').mockResolvedValue({ id: '1' } as any);

      const result = await service.validateToken(token);

      expect(result).toBeDefined();
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should throw error if token is invalid', () => {
      const token = 'invalidToken';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.validateToken(token)).toThrow();
    });
  });
});
