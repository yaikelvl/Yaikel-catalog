import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common';
import { isUUID } from 'class-validator';
import { User } from 'src/auth/entities/auth.entity';
import { BusinessImages, Business } from './entities';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { AppGateway } from 'src/websockets/app-gateway.gateway';
import { GetUser } from 'src/auth/decorators';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger('BusinessService');
  
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,

    @InjectRepository(BusinessImages)
    private readonly businessImageRepository: Repository<BusinessImages>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,

    private readonly appGateway: AppGateway,
  ) {}

  async create(createBusinessDto: CreateBusinessDto, userReq: User) {
    try {

      const user = await this.userRepository.findOneBy({
        id: createBusinessDto.user_id,
      });

      if (!user) {
        throw new BadRequestException(
          `User with id ${createBusinessDto.user_id} not found`,
        );
      }

      const { coverImage = [], ...businessDetails } = createBusinessDto;

      const business = this.businessRepository.create({
        ...businessDetails,
        coverImage: coverImage.map((url) =>
          this.businessImageRepository.create({ url }),
        ),
      });
      this.appGateway.sendMessage(userReq.phone, 'create Business');
      await this.businessRepository.save(business);
      return { ...business, coverImage };
    } catch (error) {
      this.handelExeption(error);
    }
  }

  async findAll(paginationDto: PaginationDto, userReq: User) {
   
    const { page, limit } = paginationDto;

    const totalPages = await this.businessRepository.count();
    const lastPage = Math.ceil(totalPages / limit);

    const business = {
      data: await this.businessRepository.find({
        skip: (page - 1) * limit,
        take: limit,
        relations: {
          coverImage: true,
          category: true,
          contact: true,
        },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };

    const { data, meta } = business;
    const businessDetails = data.map(
      ({
      business_id,
      businessModel,
      businessType,
      coverImage,
      name,
      category,
      contact,
      slogan,
      description,
      address,
      dateEvent,
      dateStartEvent,
      dateEndEvent,
      }) => ({
      business_id,
      businessModel,
      businessType,
      coverImage: coverImage.map((img) => img.url),
      name,
      category: {
        category: category?.category || [],
        subcategories: category?.subcategory?.map((term) => term.sub) || [],
      },
      contact: {
        phones: contact?.phone || [], 
        url: contact?.url?.map((term) => term.url) || [], 
      },
      slogan,
      description,
      address,
      dateEvent,
      dateStartEvent,
      dateEndEvent,
      }),
    );
    this.appGateway.sendMessage(userReq.phone, 'see all Business');
    return { businessDetails, meta };
  }

  async findOne(term: string) {
    let business: Business;

    if (isUUID(term)) {
      business = await this.businessRepository.findOneBy({ business_id: term });
    } else {
      business = await this.businessRepository.findOneBy({ name: term });
    }

    if (!business) throw new BadRequestException('Business not found');

    return business;
  }

  async findOnePlane(term: string) {
    const { coverImage = [], ...rest } = await this.findOne(term);

    return {
      ...rest,
      coverImage: coverImage.map((image) => image.url),
    };
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto) {
    await this.findOne(id);
    const { coverImage, ...toUpdate } = updateBusinessDto;

    const business = await this.businessRepository.preload({
      business_id: id,
      ...toUpdate,
    });

    //Query Runner

    console.log(business);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (coverImage) {
        await queryRunner.manager.delete(BusinessImages, {
          business: { business_id: id },
        });
        business.coverImage = coverImage.map((image) =>
          this.businessImageRepository.create({ url: image }),
        );
      } else {
      }

      await queryRunner.manager.save(business);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      // await this.businessRepository.save(business);
      return business;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handelExeption(error);
    }
  }
  async updateNew(id: string, updateBusinessDto: UpdateBusinessDto, userReq: User) {
    await this.findOne(id);
    const { coverImage, ...toUpdate } = updateBusinessDto;

    const business = await this.businessRepository.preload({
      business_id: id,
      ...toUpdate,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (coverImage) {
        const existingImages = await this.businessImageRepository.find({
          where: { business: { business_id: id } },
        });

        const newImages = coverImage.filter(
          (image) => !existingImages.some((img) => img.url === image),
        );

        business.coverImage = [
          ...existingImages,
          ...newImages.map((image) =>
            this.businessImageRepository.create({ url: image }),
          ),
        ];
      }

      await queryRunner.manager.save(business);

      await queryRunner.commitTransaction();
      await queryRunner.release();

    this.appGateway.sendMessage(userReq.phone, `update Business ${id}`);
    
    return this.findOnePlane(id);
    
  } catch (error) {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
    
    this.handelExeption(error);
    }
  }
  
  async remove(id: string, userReq: User) {
    const business = await this.findOne(id);

    this.appGateway.sendMessage(userReq.phone, `remove Business ${id}`);
    return await this.businessRepository.softRemove(business);
  }

  private handelExeption(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpecte error, check server logs',
    );
  }
}
