import {
  BadRequestException,
  Get,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/auth.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { GetUser } from './decorators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { WSGateway } from '../websockets/websocket.gateway';
import { LogNotifyHelper } from '../common/utils/log-notify.helper';

@Injectable()
export class AuthService {

  private readonly logHelper: LogNotifyHelper;

  constructor(
    @InjectRepository(User)
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly notificationGateway: WSGateway,
  ) {
    this.logHelper = new LogNotifyHelper(this.logger, this.notificationGateway, 'UsersService');
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      console.log(user);
      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      throw new BadRequestException(error.detail);
    }
  }

  async login(loginUserDto: LoginUserDto, userReq: User) {
    const { phone, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { phone },
      select: { phone: true, password: true },
    });

    if (!user) throw new UnauthorizedException('Bad Credentials (phone)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Bad Credentials (password)');

    this.logHelper.logOperation(`Usuario ${user.id} ha realizado la operación de login`);

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
