import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Retorna error si hay propiedades desconocidas
      transform: true, // Transforma los datos al tipo esperado en el DTO
    })
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
