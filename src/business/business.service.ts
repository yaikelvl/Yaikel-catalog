import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { PaginationDto } from '../common';
import { isUUID } from 'class-validator';
import { User } from '../auth/entities/auth.entity';
import { BusinessImages, Business } from './entities';
import { AppGateway } from '../websockets/app-gateway.gateway';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

/**
 * BusinessService handles business-related operations such as creating, updating, 
 * retrieving, and deleting business entities. It interacts with the database to 
 * manage business data and provides real-time notifications via WebSockets.
 */
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
    
    private readonly cloudinaryService: CloudinaryService,

    private readonly dataSource: DataSource,

    private readonly appGateway: AppGateway,
  ) {}

  /**
   * Creates a new business entity and saves it to the database.
   * 
   * @param createBusinessDto - The DTO containing business details for creation.
   * @param userReq - The user making the request (for sending WebSocket notifications).
   * @returns The newly created business entity.
   * @throws BadRequestException if the user ID is not found.
   */
  async create(createBusinessDto: CreateBusinessDto, businessImages: Express.Multer.File[], userReq: User) {
    try {
      const user = await this.userRepository.findOneBy({
        id: createBusinessDto.user_id,
      });

      
      const uploadedImages = await this.cloudinaryService.uploadImages(
        businessImages, 
        'business'
      );

      if (!user) {
        throw new BadRequestException(
          `User with id ${createBusinessDto.user_id} not found`,
        );
      }

      const { coverImage = [], ...businessDetails } = createBusinessDto;

      const business = this.businessRepository.create({
        ...businessDetails,
        coverImage: uploadedImages.map(({ url, publicId }) =>
          this.businessImageRepository.create({ url, image_public_id: publicId }),
        ),
      });
      
      this.appGateway.sendMessage(userReq.phone, 'create Business');
      await this.businessRepository.save(business);
      return { ...business, coverImage: uploadedImages.map(({ url }) => url) };
    } catch (error) {
      this.handleException(error);
    }
  }

  /**
   * Retrieves a paginated list of all businesses.
   * 
   * @param paginationDto - Pagination details (page and limit).
   * @param userReq - The user making the request (for sending WebSocket notifications).
   * @returns A paginated list of businesses with metadata.
   */
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

  /**
   * Retrieves a single business entity based on either its ID or name.
   * 
   * @param term - The ID or name of the business to retrieve.
   * @returns The business entity.
   * @throws BadRequestException if the business is not found.
   */
  async findOne(term: string, flag: boolean, userReq: User) {
    let business: Business;

    // Check if term is a number (potential ID) or a UUID
    if (isUUID(term) || !isNaN(Number(term))) {
      business = await this.businessRepository.findOneBy({ business_id: term });
    } else {
      business = await this.businessRepository.findOneBy({ name: term });
    }

    if (!business) throw new BadRequestException('Business not found');

    if (flag) this.appGateway.sendMessage(userReq.phone, `find Business by ${term}`);
    
    return business;
  }

  /**
   * Retrieves a simplified business entity without cover images (only URLs).
   * 
   * @param term - The ID or name of the business to retrieve.
   * @returns The business entity with simplified cover images.
   */
  async findOnePlane(term: string, flag: boolean, userReq: User) {
    const { coverImage = [], ...rest } = await this.findOne(term, flag, userReq);

    return {
      ...rest,
      coverImage: coverImage.map((image) => image.url),
    };
  }

  /**
   * Updates an existing business entity.
   * 
   * @param id - The ID of the business to update.
   * @param updateBusinessDto - The DTO containing the updated business details.
   * @returns The updated business entity.
   * @throws InternalServerErrorException if an error occurs during the update process.
   */
  async update(id: string, updateBusinessDto: UpdateBusinessDto) {
    try {
      await this.findOne(id, false, null);
      const { coverImage, ...toUpdate } = updateBusinessDto;

      const business = await this.businessRepository.preload({
        business_id: id,
        ...toUpdate,
      });

      // Query Runner for transaction
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
        }

        await queryRunner.manager.save(business);
        await queryRunner.commitTransaction();
        await queryRunner.release();

        return business;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw error;
      }
    } catch (error) {
      this.handleException(error);
    }
  }

  /**
   * Updates an existing business entity with new images and details.
   * 
   * @param id - The ID of the business to update.
   * @param updateBusinessDto - The DTO containing updated business details.
   * @param userReq - The user making the request (for sending WebSocket notifications).
   * @returns The updated business entity with simplified cover images.
   */
  async updateNew(id: string, updateBusinessDto: UpdateBusinessDto, userReq: User) {
    try {
      await this.findOne(id, false, null);
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
      
        return this.findOnePlane(id, false, null);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw error;
      }
    } catch (error) {
      this.handleException(error);
    }
  }
  
  /**
   * Removes a business entity from the database.
   * 
   * @param id - The ID of the business to remove.
   * @param userReq - The user making the request (for sending WebSocket notifications).
   * @returns The removed business entity.
   */
  async remove(id: string, userReq: User) {
    const business = await this.findOne(id, false, null);
    this.appGateway.sendMessage(userReq.phone, `remove Business ${id}`);
    return await this.businessRepository.softRemove(business);
  }

  /**
   * Handles exceptions that occur during business operations.
   * 
   * @param error - The error to handle.
   * @throws BadRequestException if a database constraint error occurs.
   * @throws InternalServerErrorException if an unexpected error occurs.
   */
  private handleException(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
