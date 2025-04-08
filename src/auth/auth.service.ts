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
import { Response } from 'express';
import { setTokens } from './strategies/set-tokens';

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
   * @param response - Express response object for setting cookies.
   * @returns A success message along with user details.
   * @throws BadRequestException if registration fails due to a database constraint.
   */
  async register(createUserDto: CreateUserDto, response: Response) {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;

      this.appGateway.sendMessage(createUserDto.phone, 'register');

      // Set tokens in cookies
      setTokens(user, response, this.jwtService);

      return {
        message: 'Successful register!',
        ...user,
      };
    } catch (error) {
      throw new BadRequestException(error.detail);
    }
  }

  /**
   * Logs in a user by validating credentials and issuing tokens in cookies.
   *
   * @param loginUserDto - Data transfer object containing user login details.
   * @param response - Express response object for setting cookies.
   * @returns A success message along with user details.
   * @throws UnauthorizedException if phone or password is incorrect.
   */
  async login(loginUserDto: LoginUserDto, response: Response) {
    const { phone, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { phone },
      select: { id: true, phone: true, password: true, role: true },
    });

    if (!user) throw new UnauthorizedException('Bad Credentials (phone)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Bad Credentials (password)');

    this.appGateway.sendMessage(loginUserDto.phone, 'login');

    // Set tokens in cookies
    setTokens(user, response, this.jwtService);

    return {
      message: 'Successful login!',
      ...user,
    };
  }

  /**
   * Logs out a user by clearing authentication cookies.
   *
   * @param response - Express response object for clearing cookies.
   * @returns A success message confirming logout.
   */
  async logout(response: Response) {
    // Clear cookies
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');

    return {
      message: 'Logout successful',
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

  /**
   * Refreshes the access token using the refresh token.
   *
   * @param refreshToken - The refresh token from cookies
   * @param response - Express response object for setting new cookies
   * @returns A success message
   * @throws UnauthorizedException if the refresh token is invalid
   */
  async refreshToken(refreshToken: string, response: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken);

      // Get the user from the database
      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid user');
      }

      // Set new tokens in cookies
      setTokens(user, response, this.jwtService);

      return {
        message: 'Token refreshed successfully',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
