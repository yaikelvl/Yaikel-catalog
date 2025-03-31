import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Inject,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  CreateCategoryDto,
  CreateSubcategoryDto,
  UpdateCategoryDto,
} from './dto';
import { PaginationDto } from 'src/common';
import { CACHE_MANAGER, CacheKey, Cache } from '@nestjs/cache-manager';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const newCategory = this.categoryService.create(createCategoryDto);
    await this.cacheManager.del('list-categories');
    return newCategory;
  }

  @Get()
  @CacheKey('list-categories')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const updateCategory = this.categoryService.update(id, updateCategoryDto);
    await this.cacheManager.del('list-categories');
    return updateCategory;
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    const removeCategory = this.categoryService.remove(id);
    this.cacheManager.del('list-categories');
    return removeCategory;
  }

  @Post('/sub/:id')
  addSubcategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createSubcategoryDto: CreateSubcategoryDto,
  ) {
    const newSub = this.categoryService.addSubcategory(id, createSubcategoryDto);
    this.cacheManager.del('list-categories');
    return newSub;
  }
}
