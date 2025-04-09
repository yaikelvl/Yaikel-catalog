import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { AppGateway } from '../websockets/app-gateway.gateway';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let appGateway: AppGateway;

  // Mock response object
  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: AppGateway,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    appGateway = module.get<AppGateway>(AppGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        service.login({ phone: '+1234567890', password: 'password' }, mockResponse)
      ).rejects.toThrow(UnauthorizedException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { phone: '+1234567890' },
        select: { id: true, phone: true, password: true, role: true },
      });
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        phone: '+1234567890',
        password: 'hashed-password',
        role: ['user'],
      };
      
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);
      
      // Act & Assert
      await expect(
        service.login({ phone: '+1234567890', password: 'wrong-password' }, mockResponse)
      ).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compareSync).toHaveBeenCalledWith('wrong-password', 'hashed-password');
    });

    it('should return user data and set tokens when login is successful', async () => {
      // Arrange
      const mockUser = {
        id: '1',
        phone: '+1234567890',
        password: 'hashed-password',
        role: ['user'],
      };
      
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
      jest.spyOn(appGateway, 'sendMessage').mockImplementation();
      
      // Mock the setTokens function
      jest.mock('./strategies/set-tokens', () => ({
        setTokens: jest.fn(),
      }));
      
      // Act
      const result = await service.login(
        { phone: '+1234567890', password: 'password' }, 
        mockResponse
      );
      
      // Assert
      expect(result).toHaveProperty('message', 'Successful login!');
      expect(result).toHaveProperty('phone', '+1234567890');
      expect(appGateway.sendMessage).toHaveBeenCalledWith('+1234567890', 'login');
    });
  });

  describe('register', () => {
    it('should create a new user and return success message', async () => {
      // Arrange
      const createUserDto = {
        phone: '+1234567890',
        password: 'password',
        name: 'Test User',
      };
      
      const savedUser = {
        id: '1',
        phone: '+1234567890',
        name: 'Test User',
        role: ['user'],
        isActive: true,
        password: 'hashed-password',
        business: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      jest.spyOn(userRepository, 'create').mockReturnValue(savedUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser as User);
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed-password');
      jest.spyOn(appGateway, 'sendMessage').mockImplementation();
      
      // Act
      const result = await service.register(createUserDto, mockResponse);
      
      // Assert
      expect(userRepository.create).toHaveBeenCalledWith({
        phone: '+1234567890',
        name: 'Test User',
        password: 'hashed-password',
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(appGateway.sendMessage).toHaveBeenCalledWith('+1234567890', 'register');
      expect(result).toHaveProperty('message', 'Successful register!');
      expect(result).toHaveProperty('phone', '+1234567890');
    });
    
    it('should throw BadRequestException when registration fails', async () => {
      // Arrange
      const createUserDto = {
        phone: '+1234567890',
        password: 'password',
        name: 'Test User',
      };
      
      jest.spyOn(userRepository, 'create').mockReturnValue({} as User);
      jest.spyOn(userRepository, 'save').mockRejectedValue({
        detail: 'Key (phone)=(+1234567890) already exists.',
      });
      
      // Act & Assert
      await expect(
        service.register(createUserDto, mockResponse)
      ).rejects.toThrow('Key (phone)=(+1234567890) already exists.');
    });
  });

  describe('logout', () => {
    it('should clear cookies and return success message', async () => {
      // Act
      const result = await service.logout(mockResponse);
      
      // Assert
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(result).toEqual({ message: 'Logout successful' });
    });
  });
});