import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { JwtStrategy } from './strategies/jwt.startegy';
import { User } from './entities/auth.entity';
import { envs } from '../common/config/envs';
import { AppGateway } from 'src/websockets/app-gateway.gateway';


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
  ],
  exports: [AuthService, TypeOrmModule, JwtStrategy, JwtModule, PassportModule],
  providers: [AuthService, JwtStrategy, AppGateway],
})
export class AuthModule {}
