import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, Subcategory } from './entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CategoryController],
  imports: [TypeOrmModule.forFeature([Category, Subcategory]), AuthModule],
  exports: [CategoryService, TypeOrmModule],
  providers: [CategoryService],
})
export class CategoryModule {}
