import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto';
import { Auth, GetUser } from './decorators';
import { ValidRoles } from './enum/valid-roles';
import { User } from './entities/auth.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginUserDto }) // Specifies request body type in Swagger.
  @ApiResponse({ status: 200, description: 'Successful login!' })
  @ApiResponse({ status: 401, description: 'Incorrect username or password.' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('verify')
  @Auth()
  verifyToken(@GetUser() user: User) {
    return { user };
  }
}
