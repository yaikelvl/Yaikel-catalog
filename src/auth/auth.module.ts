import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { JwtStrategy } from './strategies/jwt.startegy';
import { User } from './entities/auth.entity';
import { envs } from '../config/envs';


@Module({
  controllers: [AuthController],
  imports: [
    TypeOrmModule.forFeature([User]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: () => {
        return { secret: envs.jwtSecret, signOptions: { expiresIn: '2h' } };
      },
    }),

    // JwtModule.register({
    //     secret: envs.jwtSecret,
    //     signOptions: { expiresIn: '1d' },
    //   })
  ],

  exports: [AuthService, TypeOrmModule, JwtStrategy, JwtModule, PassportModule, AuthModule],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
