import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { envs } from './common/config/envs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { ProductModule } from './product/product.module';
import { ContactModule } from './contact/contact.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { CategoryModule } from './category/category.module';
import { loggerOptions } from './common/utils/logger.config';
import { WinstonModule } from 'nest-winston';
import { WebSocketGateway } from '@nestjs/websockets';
import { WSGateway } from './websockets/websocket.gateway';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/files',
    }),
    // ConfigModule.forRoot({  //TODO: YUP
    //   load: [envs],
    //   isGlobal: true,
    // }),

    // ConfigModule.forRoot({  //TODO: ZOD
    //   validate: (config) => envSchema.parse(config),
    //   isGlobal: true,
    // }),

    WinstonModule.forRoot(loggerOptions),

    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.dbHost,
      port: envs.dbPort,
      database: envs.dbName,
      username: envs.dbUser,
      password: envs.dbPassword,
      autoLoadEntities: true,
      synchronize: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        }),
      }),
    }),
    // CacheModule.register({isGlobal: true}),

    AuthModule,

    BusinessModule,

    ProductModule,

    ContactModule,

    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
