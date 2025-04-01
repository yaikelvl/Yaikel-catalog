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
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheKey,
  Cache,
} from '@nestjs/cache-manager';
import { Auth } from '../auth/decorators';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product } from './entities/product.entity';

/**
 * ProductController handles all product-related operations including CRUD functionality.
 * Implements caching strategies to optimize product data retrieval and management.
 */
@ApiTags('Products')
@Controller('product')
@Auth()
@UseInterceptors(CacheInterceptor)
export class ProductController {
  /**
   * Initializes product services and caching dependencies
   * 
   * @param productService - Service handling business logic for products
   * @param cacheManager - Cache manager instance for data caching
   */
  constructor(
    private readonly productService: ProductService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Creates a new product and invalidates the products cache
   * 
   * @param createProductDto - Data transfer object containing product details
   * @returns The newly created product
   */
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto }) // Specifies request body type in Swagger.
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, authentication required',
  })
  async create(@Body() createProductDto: CreateProductDto) {
    const newProduct = this.productService.create(createProductDto);
    await this.cacheManager.del('list-products');
    return newProduct;
  }

  /**
   * Retrieves all products with pagination support.
   * Results are cached for subsequent requests.
   * 
   * @param paginationDto - Pagination parameters (limit, offset)
   * @returns Paginated list of products
   */
  @Get()
  @CacheKey('list-products')
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of products retrieved successfully',
    type: [Product],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid pagination parameters',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productService.findAll(paginationDto);
  }

  /**
   * Retrieves a specific product by search term (ID, name, or slug)
   * 
   * @param term - Search term to identify the product
   * @returns The requested product if found
   */
  @Get(':term')
  @ApiOperation({ summary: 'Get product by ID, name or slug' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search term',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  findOne(@Param('term') term: string) {
    return this.productService.findOne(term);
  }

  /**
   * Updates an existing product and invalidates the products cache
   * 
   * @param id - UUID of the product to update
   * @param updateProductDto - Data containing the product updates
   * @returns The updated product
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiBody({ type: UpdateProductDto }) // Specifies request body type in Swagger.
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID or update data',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const updatedProduct = this.productService.update(id, updateProductDto);
    await this.cacheManager.del('list-products');
    return updatedProduct;
  }

  /**
   * Deletes a product and invalidates the products cache
   * 
   * @param id - UUID of the product to delete
   * @returns Confirmation of the deletion
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const removedProduct = this.productService.remove(id);
    await this.cacheManager.del('list-products');
    return removedProduct;
  }
}