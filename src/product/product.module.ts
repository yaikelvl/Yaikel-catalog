import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BusinessModule } from '../business/business.module';
import { Product } from './entities/product.entity';

@Module({
  controllers: [ProductController],
  imports:[TypeOrmModule.forFeature([Product]), AuthModule, BusinessModule],
  exports:[ProductModule, ProductService, TypeOrmModule],
  providers: [ProductService],
})
export class ProductModule {}
