import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto';
import { Auth, GetUser } from './decorators';
import { ValidRoles } from './enum/valid-roles';
import { User } from './entities/auth.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * AuthController handles authentication-related API endpoints such as user registration,
 * login, and token verification.
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
   * @returns A success message confirming registration.
   */
  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiBody({ type: CreateUserDto }) // Specifies request body type in Swagger.
  @ApiResponse({ status: 200, description: 'Successful register!' })
  @ApiResponse({ status: 400, description: 'Key (phone)=(+5354381007) already exists.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  /**
   * Logs in a user.
   *
   * @param loginUserDto - User credentials (phone & password).
   * @returns A success message and authentication token.
   */
  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginUserDto }) // Specifies request body type in Swagger.
  @ApiResponse({ status: 200, description: 'Successful login!' })
  @ApiResponse({ status: 401, description: 'Bad Credentials (password) or (phone).' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  /**
   * Verifies if the provided authentication token is valid.
   *
   * @param user - The authenticated user extracted from the token.
   * @returns The authenticated user's data.
   */
  @Get('verify')
  @Auth()
  verifyToken(@GetUser() user: User) {
    return { user };
  }
}
