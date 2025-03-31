import {
  BadRequestException,
  Get,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as winston from 'winston';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/auth.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { AppGateway } from '../websockets/app-gateway.gateway';
import { GetUser } from './decorators';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,

    private readonly appGateway: AppGateway,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;

      this.appGateway.sendMessage(createUserDto.phone, 'register');

      return {
        message: 'Successful register!',
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      throw new BadRequestException(error.detail);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { phone, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { phone },
      select: { phone: true, password: true },
    });

    if (!user) throw new UnauthorizedException('Bad Credentials (phone)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Bad Credentials (password)');

    this.appGateway.sendMessage(loginUserDto.phone, 'login');
    return {
      message: 'Successful login!',
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
