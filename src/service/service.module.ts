import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { AuthModule } from 'src/auth/auth.module';
import { BusinessModule } from 'src/business/business.module';

@Module({
  controllers: [ServiceController],
  imports:[TypeOrmModule.forFeature([Service]), AuthModule, BusinessModule],
  exports:[ServiceModule, ServiceService, TypeOrmModule],
  providers: [ServiceService],
})
export class ServiceModule {}
