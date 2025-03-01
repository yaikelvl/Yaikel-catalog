import {
  Controller,
  Get,
  Post,
  Body
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto';
import { Auth } from './decorators';
import { ValidRoles } from './enum/valid-roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  // @Get('private')
  // @Auth(ValidRoles.SUPERUSER)
  // testingPrivateRoute() {
  //   return {
  //     ok: true,
  //     message: 'This is a private route',
  //   };
  // }
}
