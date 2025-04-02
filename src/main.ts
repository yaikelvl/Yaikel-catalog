import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';

import { AppModule } from './app.module';
import { envs } from './common/config/envs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, 
      transform: true, 
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Catalog API')
    .setDescription('Catalog API to display different businesses and events, as well as the products and services that these businesses provide.')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  logger.log(`Server is running on port ${envs.port}`);
  
  app.useGlobalInterceptors(app.get(CacheInterceptor));
  
  await app.listen(envs.port ?? 3000);

}
bootstrap();
