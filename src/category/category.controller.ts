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
import { Auth } from '../auth/decorators';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';

/**
 * CategoryController handles operations related to category and subcategory management,
 * including creation, retrieval, updating, and deletion of categories and subcategories.
 * Implements caching mechanisms to optimize data retrieval.
 */
@ApiTags('Categories')
@Controller('category')
@Auth()
export class CategoryController {
  /**
   * Initializes the controller with required services.
   *
   * @param categoryService - Service handling business logic for categories
   * @param cacheManager - Cache manager for caching category data
   */
  constructor(
    private readonly categoryService: CategoryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Creates a new category entity and invalidates the categories cache.
   *
   * @param createCategoryDto - Data transfer object containing category details
   * @returns The newly created category
   */
  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto }) // Specifies request body type in Swagger.
  @ApiResponse({
    status: 201,
    description: 'Category successfully created',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, authentication required',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const newCategory = this.categoryService.create(createCategoryDto);
    await this.cacheManager.del('list-categories');
    return newCategory;
  }

  /**
   * Retrieves all categories with pagination support.
   * Results are cached for subsequent requests.
   *
   * @param paginationDto - Pagination parameters (limit, offset)
   * @returns Paginated list of categories
   */
  @Get()
  @CacheKey('list-categories')
  @ApiOperation({ summary: 'Get all categories with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of categories retrieved successfully',
    type: [Category],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid pagination parameters',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAll(paginationDto);
  }

  /**
   * Retrieves a specific category by its UUID.
   *
   * @param id - UUID of the category to retrieve
   * @returns The requested category if found
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  /**
   * Updates an existing category and invalidates the categories cache.
   *
   * @param id - UUID of the category to update
   * @param updateCategoryDto - Data containing the updates
   * @returns The updated category
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiBody({ type: UpdateCategoryDto }) // Specifies request body type in Swagger.
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID or update data',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const updateCategory = this.categoryService.update(id, updateCategoryDto);
    await this.cacheManager.del('list-categories');
    return updateCategory;
  }

  /**
   * Deletes a category and invalidates the categories cache.
   *
   * @param id - UUID of the category to delete
   * @returns The deleted category
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    const removeCategory = this.categoryService.remove(id);
    this.cacheManager.del('list-categories');
    return removeCategory;
  }

  /**
   * Adds a subcategory to an existing category and invalidates the categories cache.
   *
   * @param id - UUID of the parent category
   * @param createSubcategoryDto - Data transfer object containing subcategory details
   * @returns The newly created subcategory
   */
  @Post('/sub/:id')
  @ApiOperation({ summary: 'Add a subcategory to a category' })
  @ApiBody({ type: CreateSubcategoryDto }) // Specifies request body type in Swagger.
  @ApiResponse({
    status: 201,
    description: 'Subcategory created successfully',
    type: Subcategory,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID or subcategory data',
  })
  @ApiResponse({
    status: 404,
    description: 'Parent category not found',
  })
  addSubcategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createSubcategoryDto: CreateSubcategoryDto,
  ) {
    const newSub = this.categoryService.addSubcategory(
      id,
      createSubcategoryDto,
    );
    this.cacheManager.del('list-categories');
    return newSub;
  }
}
