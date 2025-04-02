import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Business } from 'src/business/entities/business.entity';
import { PaginationDto } from 'src/common';
import { isUUID } from 'class-validator';

/**
 * ProductService handles product-related operations, including creation, retrieval,
 * updating, and deletion of products associated with businesses.
 */
@Injectable()
export class ProductService {
  private readonly logger = new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  /**
   * Creates a new product associated with a business.
   *
   * @param createProductDto - Data transfer object containing product details.
   * @returns The created product.
   * @throws BadRequestException if the associated business does not exist.
   */
  async create(createProductDto: CreateProductDto) {
    try {
      const business = await this.businessRepository.findOneBy({
        business_id: createProductDto.business_id,
      });

      if (!business)
        throw new BadRequestException(`Business with id ${createProductDto.business_id} not found`);

      const product = this.productRepository.create(createProductDto);
      return await this.productRepository.save(product);
    } catch (error) {
      this.handelExeption(error);
    }
  }

  /**
   * Retrieves a paginated list of products.
   *
   * @param paginationDto - Pagination parameters.
   * @returns A list of products with pagination metadata.
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.productRepository.count();
    const lastPage = Math.ceil(totalPages / limit);

    const product = {
      data: await this.productRepository.find({
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };

    const { data, meta } = product;
    const productsDetails = data.map(
      ({
        product_id,
        business_id,
        productModel,
        productType,
        name,
        description,
        price,
      }) => ({
        product_id,
        business_id,
        productModel,
        productType,
        name,
        description,
        price,
      }),
    );

    return { productsDetails, meta };
  }

  /**
   * Retrieves a product by its ID or name.
   *
   * @param term - The product ID (UUID) or name.
   * @returns The requested product.
   * @throws BadRequestException if the product is not found.
   */
  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ product_id: term });
    } else {
      product = await this.productRepository.findOneBy({ name: term });
    }

    if (!product) throw new BadRequestException('Product not found');

    return product;
  }

  /**
   * Updates an existing product.
   *
   * @param id - The product ID.
   * @param updateProductDto - Data transfer object containing updated product details.
   * @returns The updated product.
   * @throws BadRequestException if the product does not exist.
   */
  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    const { ...toUpdate } = updateProductDto;

    try {
      const product = await this.productRepository.preload({
        product_id: id,
        ...toUpdate,
      });
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handelExeption(error);
    }
  }

  /**
   * Soft deletes a product by its ID.
   *
   * @param id - The product ID.
   * @returns The deleted product.
   * @throws BadRequestException if the product does not exist.
   */
  async remove(id: string) {
    const product = await this.findOne(id);
    return await this.productRepository.softRemove(product);
  }

  /**
   * Handles exceptions and logs errors.
   *
   * @param error - The error object.
   * @throws BadRequestException if a database constraint is violated.
   * @throws InternalServerErrorException for unexpected errors.
   */
  private handelExeption(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
