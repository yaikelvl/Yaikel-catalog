import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from "@nestjs/config";
import { join } from 'path';

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
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
