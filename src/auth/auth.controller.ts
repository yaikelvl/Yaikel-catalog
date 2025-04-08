import { Controller, Get, Post, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto';
import { Auth, GetUser } from './decorators';
import { User } from './entities/auth.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ValidRoles } from './enum/valid-roles';

/**
 * AuthController handles authentication-related API endpoints such as user registration,
 * login, token verification, and logout.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  /**
   * Injects the AuthService to handle authentication logic.
   *
   * @param authService - The service responsible for authentication operations.
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user.
   *
   * @param createUserDto - New user data including phone and password.
   * @param response - Express response object for setting cookies.
   * @returns A success message confirming registration.
   */
  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiBody({ type: CreateUserDto }) // Specifies request body type in Swagger.
  @ApiResponse({ status: 200, description: 'Successful register!' })
  @ApiResponse({
    status: 400,
    description: 'Key (phone)=(+5354381007) already exists.',
  })
  create(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.register(createUserDto, response);
  }

  /**
   * Logs in a user.
   *
   * @param loginUserDto - User credentials (phone & password).
   * @param response - Express response object for setting cookies.
   * @returns A success message.
   */
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginUserDto }) // Specifies request body type in Swagger.
  @ApiResponse({ status: 200, description: 'Successful login!' })
  @ApiResponse({
    status: 401,
    description: 'Bad Credentials (password) or (phone).',
  })
  login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(loginUserDto, response);
  }

  /**
   * Logs out a user by clearing authentication cookies.
   *
   * @param response - Express response object for clearing cookies.
   * @returns A success message confirming logout.
   */
  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }

  /**
   * Verifies if the provided authentication token is valid.
   *
   * @param user - The authenticated user extracted from the token.
   * @returns The authenticated user's data.
   */
  @Get('verify')
  @Auth()
  verifyToken(@Req() request: Request, @GetUser() user: User, ) {
    const cookies = request.cookies;
    console.log('Todas las cookies:', cookies);
    return { user };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh Token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refresh_token;
    return this.authService.refreshToken(refreshToken, response);
  }
}
