import {
  BadRequestException,
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
import { AppGateway } from '../websockets/app-gateway.gateway';

/**
 * AuthService handles user authentication and authorization logic.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly appGateway: AppGateway,
  ) {}

  /**
   * Registers a new user by encrypting their password and storing their data.
   *
   * @param createUserDto - Data transfer object containing user registration details.
   * @returns A success message along with user details and a JWT token.
   * @throws BadRequestException if registration fails due to a database constraint.
   */
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

  /**
   * Logs in a user by validating credentials and issuing a JWT token.
   *
   * @param loginUserDto - Data transfer object containing user login details.
   * @returns A success message along with user details and a JWT token.
   * @throws UnauthorizedException if phone or password is incorrect.
   */
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

  /**
   * Generates a JWT token for authentication purposes.
   *
   * @param payload - Data to include in the JWT payload.
   * @returns A signed JWT token.
   */
  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
