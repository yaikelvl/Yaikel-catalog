import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto';
import { User } from './entities/auth.entity';
import { ValidRoles } from './enum/valid-roles';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthGuard } from '@nestjs/passport';
import * as authDecorators from './decorators';

// Mock Auth decorator
jest.spyOn(authDecorators, 'Auth').mockImplementation(() => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  };
});

// Mock GetUser decorator to return the mockUser in tests
jest.spyOn(authDecorators, 'GetUser').mockImplementation(() => {
  return (target: any, key: string, parameterIndex: number) => {
    // This decorator just marks the parameter, actual user is provided in the test
    return;
  };
});

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock objects
  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as any;

  const mockRequest = {
    cookies: {
      refresh_token: 'test-refresh-token',
      access_token: 'test-access-token'
    }
  } as any;

  const mockUser = {
    id: '1',
    phone: '+1234567890',
    role: [ValidRoles.USER], 
    isActive: true,
    password: 'hashed-password',
    business: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-token'),
            verify: jest.fn().mockReturnValue({ userId: 'test-user-id' }),
          },
        },
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
      ],
    })
    .overrideGuard(AuthGuard('jwt'))
    .useValue({ canActivate: jest.fn().mockReturnValue(true) })
    .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call authService.register with correct parameters', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        phone: '+1234567890',
        password: 'password',
      };
      const expectedResult = {
        message: 'Successful register!',
        ...mockUser,
      };
      jest.spyOn(authService, 'register').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.create(createUserDto, mockResponse);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(createUserDto, mockResponse);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      // Arrange
      const loginUserDto: LoginUserDto = {
        phone: '+1234567890',
        password: 'password',
      };
      const expectedResult = {
        message: 'Successful login!',
        ...mockUser,
      };
      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.login(loginUserDto, mockResponse);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginUserDto, mockResponse);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('logout', () => {
    it('should call authService.logout with correct parameters', async () => {
      // Arrange
      const expectedResult = {
        message: 'Logout successful',
      };
      jest.spyOn(authService, 'logout').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.logout(mockResponse);

      // Assert
      expect(authService.logout).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('verifyToken', () => {
    it('should return the user object', () => {
      // Act
      const result = controller.verifyToken(mockRequest, mockUser);

      // Assert
      expect(result).toEqual({ user: mockUser });
    });
  });

  describe('refreshToken', () => {
    it('should call authService.refreshToken with correct parameters', async () => {
      // Arrange
      const expectedResult = {
        message: 'Token refreshed successfully',
      };
      jest.spyOn(authService, 'refreshToken').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.refreshToken(mockRequest, mockResponse);

      // Assert
      expect(authService.refreshToken).toHaveBeenCalledWith('test-refresh-token', mockResponse);
      expect(result).toEqual(expectedResult);
    });
  });
});