import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [BusinessController],
  imports: [TypeOrmModule.forFeature([Business]), AuthModule],
  exports: [BusinessService, TypeOrmModule],
  providers: [BusinessService],
})
export class BusinessModule {}
