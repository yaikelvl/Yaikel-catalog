import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BusinessImages, Business } from './entities/';
import { AppGateway } from '../websockets/app-gateway.gateway';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [BusinessController],
  imports: [TypeOrmModule.forFeature([Business, BusinessImages]), AuthModule, CloudinaryModule],
  exports: [BusinessService, TypeOrmModule],
  providers: [BusinessService, AppGateway],
})
export class BusinessModule {}
