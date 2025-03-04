import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Business } from 'src/business/entities/business.entity';

@Injectable()
export class ProductService {

  private readonly logger = new Logger('ProdutService');

    constructor(
      @InjectRepository(Product)
      private readonly productRepository: Repository<Product>,
  
      // @InjectRepository(Business)
      // private readonly businessRepository: Repository<Business>,
    ) {}


  async create(createProductDto: CreateProductDto) {
    // try {   
     
    //   const business = await this.businessRepository.findOneBy(
    //     {business_id: createProductDto.business_id})

    //     if(!business)
    //       throw new BadRequestException(`Business whith id ${createProductDto.business_id} not found`)

    //   const product = this.productRepository.create(createProductDto);
    //   return await this.businessRepository.save(product);
      
    // } catch (error) {
    //   this.handelExeption(error);
    // }
    return createProductDto;
  }

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private handelExeption(error: any) {
      if (error.code === '23505') throw new BadRequestException(error.detail);
  
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Unexpecte error, check server logs',
      );
    }
}
