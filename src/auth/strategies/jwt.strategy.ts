import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/auth.entity';
import { envs } from 'src/common/config/envs';

/**
 * JwtStrategy handles JWT authentication by validating the token and extracting user information.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || envs.jwtSecret,
    });
  }

  /**
   * Validates the JWT token payload and retrieves the corresponding user.
   *
   * @param payload - The decoded JWT payload containing user ID.
   * @returns The authenticated user.
   * @throws UnauthorizedException if the token is invalid or the user is inactive.
   */
  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;

    const user = await this.userRepository.findOne({
      where: { id },
    });
    
    if (!user) {
      throw new UnauthorizedException('Token not valid');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive, talk with an Admin');
    }
    
    return user;
  }
}
