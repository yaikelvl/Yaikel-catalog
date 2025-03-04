import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common';
import { isUUID } from 'class-validator';
import { User } from 'src/auth/entities/auth.entity';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger('BusinessService');

  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,

    @InjectRepository(Business)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createBusinessDto: CreateBusinessDto) {
    try {
        const user = await this.userRepository.findOneBy(
          {id: createBusinessDto.user_id})

          if(!user)
            throw new BadRequestException(`User whith id ${createBusinessDto.user_id} not found`)

      const business = this.businessRepository.create(createBusinessDto);
      return this.businessRepository.save(business);
    } catch (error) {
      this.handelExeption(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.businessRepository.count();
    const lastPage = Math.ceil(totalPages / limit);

    const business = {
      data: await this.businessRepository.find({
        skip: (page - 1) * limit,
        take: limit,
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
        name,
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
        name,
        slogan,
        description,
        address,
        dateEvent,
        dateStartEvent,
        dateEndEvent,
      }),
    );

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

  async update(id: string, updateBusinessDto: UpdateBusinessDto) {
    await this.findOne(id);
    const { ...toUpdate } = updateBusinessDto;

    try {
      const business = await this.businessRepository.preload({
        business_id: id,
        ...toUpdate,
      });
      await this.businessRepository.save(business);
      return business;
    } catch (error) {
      this.handelExeption(error);
    }
  }

  async remove(id: string) {
    const business = await this.findOne(id);
    business.isActive = false;
    await this.businessRepository.save(business);
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
