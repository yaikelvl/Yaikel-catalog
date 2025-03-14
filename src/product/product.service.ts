import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Business } from 'src/business/entities/business.entity';
import { PaginationDto } from 'src/common';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductService {

  private readonly logger = new Logger('ProdutService');

    constructor(
      @InjectRepository(Product)
      private readonly productRepository: Repository<Product>,
  
      @InjectRepository(Business)
      private readonly businessRepository: Repository<Business>,
    ) {}


  async create(createProductDto: CreateProductDto) {
    try {   
     
      const business = await this.businessRepository.findOneBy(
        {business_id: createProductDto.business_id})

        if(!business)
          throw new BadRequestException(`Business whith id ${createProductDto.business_id} not found`)

      const product = this.productRepository.create(createProductDto);
      return await this.productRepository.save(product);
      
    } catch (error) {
      this.handelExeption(error);
    }
    // return createProductDto;
  }

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
        price
      }) => ({
        product_id,
        business_id,
        productModel,
        productType,
        name,
        description,
        price
      }),
    );

    return { productsDetails, meta };
  }

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
  
    async remove(id: string) {
      const product = await this.findOne(id);
      return await this.productRepository.softRemove(product);
    }

  private handelExeption(error: any) {
      if (error.code === '23505') throw new BadRequestException(error.detail);
  
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Unexpecte error, check server logs',
      );
    }
}
