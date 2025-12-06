import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data without password if validation succeeds', async () => {
      const mockUser = {
        email: 'test@example.com',
        passwordHash: 'hashed',
        toObject: () => ({ email: 'test@example.com', passwordHash: 'hashed', _id: '1' }),
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual({ email: 'test@example.com', _id: '1' });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return null if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password mismatch', async () => {
       const mockUser = {
        email: 'test@example.com',
        passwordHash: 'hashed',
      };
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const user = { email: 'test@example.com', _id: '1' };
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.login(user);
      expect(result).toEqual({ access_token: 'token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user._id });
    });
  });

  describe('register', () => {
    it('should create user if email does not exist', async () => {
      const dto = { email: 'new@example.com', password: 'pass', name: 'New' };
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ ...dto, _id: '1' });

      const result = await service.register(dto);
      expect(result).toEqual({ ...dto, _id: '1' });
      expect(usersService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw UnauthorizedException if email exists', async () => {
      const dto = { email: 'exists@example.com', password: 'pass', name: 'Exists' };
      mockUsersService.findByEmail.mockResolvedValue({ _id: '1' });

      await expect(service.register(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});

