import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';

@Module({
  controllers: [BusinessController],
  imports: [TypeOrmModule.forFeature([Business])],
  exports: [BusinessService, TypeOrmModule],
  providers: [BusinessService],
})
export class BusinessModule {}
