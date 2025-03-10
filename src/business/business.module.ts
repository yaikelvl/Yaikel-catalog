import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BusinessImages, Business } from './entities/';

@Module({
  controllers: [BusinessController],
  imports: [TypeOrmModule.forFeature([Business, BusinessImages]), AuthModule],
  exports: [BusinessService, TypeOrmModule],
  providers: [BusinessService],
})
export class BusinessModule {}
