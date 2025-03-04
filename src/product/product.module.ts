import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductController],
  imports:[TypeOrmModule.forFeature([Product]), AuthModule],
  exports:[ProductModule, ProductService, TypeOrmModule],
  providers: [ProductService],
})
export class ProductModule {}
