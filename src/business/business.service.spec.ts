import { Test, TestingModule } from '@nestjs/testing';
import { BusinessService } from './business.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateBusinessDto } from './dto/create-business.dto';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { User } from '../auth/entities/auth.entity';
import { Business, BusinessImages } from './entities';
import { AppGateway } from '../websockets/app-gateway.gateway';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ValidRoles } from '../auth/enum/valid-roles';

describe('BusinessService', () => {
  let service: BusinessService;
  let businessRepository: Repository<Business>;
  let businessImageRepository: Repository<BusinessImages>;
  let userRepository: Repository<User>;
  let cloudinaryService: CloudinaryService;
  let appGateway: AppGateway;

  // Mock user
  const mockUser: User = {
    id: '1',
    phone: '+1234567890',
    password: 'hashed-password',
    role: [ValidRoles.ADMIN],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    business: []
  };

  // Mock business
  const mockBusiness: Business = {
    business_id: '1',
    name: 'Test Business',
    description: 'Test Description',
    businessModel: 'business' as any,
    businessType: 'store',
    coverImage: [],
    profileImage: 'http://example.com/profile.jpg',
    address: '123 Test St',
    category_id: '1',
    user_id: '1',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
    contact: null,
    product: [],
    category: null
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        {
          provide: getRepositoryToken(Business),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            preload: jest.fn(),
            softRemove: jest.fn(),
            count: jest.fn()
          },
        },
        {
          provide: getRepositoryToken(BusinessImages),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn()
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn()
          },
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImages: jest.fn(),
          },
        },
        {
          provide: AppGateway,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                delete: jest.fn(),
                save: jest.fn(),
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
    businessRepository = module.get<Repository<Business>>(getRepositoryToken(Business));
    businessImageRepository = module.get<Repository<BusinessImages>>(getRepositoryToken(BusinessImages));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
    appGateway = module.get<AppGateway>(AppGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a business and send a WebSocket message', async () => {
      // Arrange
      const createBusinessDto: CreateBusinessDto = {
        name: 'Test Business',
        description: 'Test Description',
        user_id: '1',
        businessModel: 'business' as any,
        businessType: 'store',
        profileImage: 'http://example.com/profile.jpg',
        address: '123 Test St',
        category_id: '1'
      };
      const mockImages = [{ filename: 'test.jpg' }] as Express.Multer.File[];
      const uploadedImages = [{ url: 'http://image.url', publicId: 'publicId' }];
      
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest.spyOn(cloudinaryService, 'uploadImages').mockResolvedValue(uploadedImages);
      jest.spyOn(businessRepository, 'create').mockReturnValue(mockBusiness);
      jest.spyOn(businessRepository, 'save').mockResolvedValue(mockBusiness);

      // Act
      const result = await service.create(createBusinessDto, mockImages, mockUser);

      // Assert
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(cloudinaryService.uploadImages).toHaveBeenCalledWith(mockImages, 'business');
      expect(businessRepository.create).toHaveBeenCalled();
      expect(businessRepository.save).toHaveBeenCalledWith(mockBusiness);
      expect(appGateway.sendMessage).toHaveBeenCalledWith('+1234567890', 'create Business');
      expect(result).toEqual({ ...mockBusiness, coverImage: uploadedImages.map(({ url }) => url) });
    });

    it('should throw InternalServerErrorException if user not found', async () => {
      // Arrange
      const createBusinessDto: CreateBusinessDto = {
        name: 'Test Business',
        description: 'Test Description',
        user_id: '1',
        businessModel: 'business' as any,
        businessType: 'store',
        profileImage: 'http://example.com/profile.jpg',
        address: '123 Test St',
        category_id: '1'
      };
      const mockImages = [{ filename: 'test.jpg' }] as Express.Multer.File[];
      
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(cloudinaryService, 'uploadImages').mockResolvedValue([]);

      // Act & Assert
      await expect(service.create(createBusinessDto, mockImages, mockUser))
        .rejects
        .toThrow('Unexpected error, check server logs');
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of businesses', async () => {
      // Arrange
      const paginationDto = { page: 1, limit: 10 };
      const mockBusinesses = [mockBusiness];
      const totalBusinesses = 1;
      
      jest.spyOn(businessRepository, 'find').mockResolvedValue(mockBusinesses);
      jest.spyOn(businessRepository, 'count').mockResolvedValue(totalBusinesses);

      // Act
      const result = await service.findAll(paginationDto, mockUser);

      // Assert
      expect(businessRepository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        relations: {
          coverImage: true,
          category: true,
          contact: true,
        },
      });
      expect(result).toEqual({
        businessDetails: mockBusinesses.map(business => ({
          business_id: business.business_id,
          businessModel: business.businessModel,
          businessType: business.businessType,
          coverImage: business.coverImage.map(img => img.url),
          name: business.name,
          category: {
            category: business.category?.category || [],
            subcategories: business.category?.subcategory?.map(term => term.sub) || [],
          },
          contact: {
            phones: business.contact?.phone || [],
            url: business.contact?.url?.map(term => term.url) || [],
          },
          slogan: business.slogan,
          description: business.description,
          address: business.address,
          dateEvent: business.dateEvent,
          dateStartEvent: business.dateStartEvent,
          dateEndEvent: business.dateEndEvent,
        })),
        meta: {
          total: totalBusinesses,
          page: 1,
          lastPage: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a business by ID', async () => {
      // Arrange
      const term = '1';
      
      jest.spyOn(businessRepository, 'findOneBy').mockResolvedValue(mockBusiness);

      // Act
      const result = await service.findOne(term, true, mockUser);

      // Assert
      expect(businessRepository.findOneBy).toHaveBeenCalledWith({ business_id: term });
      expect(result).toEqual(mockBusiness);
    });

    it('should return a business by name', async () => {
      // Arrange
      const term = 'Test Business';
      
      jest.spyOn(businessRepository, 'findOneBy').mockResolvedValue(mockBusiness);

      // Act
      const result = await service.findOne(term, true, mockUser);

      // Assert
      expect(businessRepository.findOneBy).toHaveBeenCalledWith({ name: term });
      expect(result).toEqual(mockBusiness);
    });

    it('should throw BadRequestException if business not found', async () => {
      // Arrange
      const term = 'Nonexistent Business';
      
      jest.spyOn(businessRepository, 'findOneBy').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(term, true, mockUser)).rejects.toThrow('Business not found');
    });
  });

  describe('update', () => {
    it('should update a business and commit transaction', async () => {
      // Arrange
      const id = '1';
      const updateBusinessDto: UpdateBusinessDto = {
        name: 'Updated Business',
      };
      const updatedBusiness = { ...mockBusiness, name: 'Updated Business' };
      
      jest.spyOn(businessRepository, 'preload').mockResolvedValue(updatedBusiness);
      jest.spyOn(businessRepository, 'findOneBy').mockResolvedValue(mockBusiness);

      // Act
      const result = await service.update(id, updateBusinessDto);

      // Assert
      expect(businessRepository.preload).toHaveBeenCalledWith({
        business_id: id,
        ...updateBusinessDto,
      });
      expect(result).toEqual(updatedBusiness);
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      // Arrange
      const id = '1';
      const updateBusinessDto: UpdateBusinessDto = {
        name: 'Updated Business',
      };
      
      jest.spyOn(businessRepository, 'preload').mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(id, updateBusinessDto)).rejects.toThrow('Unexpected error, check server logs');
    });
  });

  describe('remove', () => {
    it('should remove a business and send a WebSocket message', async () => {
      // Arrange
      const id = '1';
      
      jest.spyOn(businessRepository, 'findOneBy').mockResolvedValue(mockBusiness);
      jest.spyOn(businessRepository, 'softRemove').mockResolvedValue(mockBusiness);

      // Act
      const result = await service.remove(id, mockUser);

      // Assert
      expect(businessRepository.findOneBy).toHaveBeenCalledWith({ business_id: id });
      expect(businessRepository.softRemove).toHaveBeenCalledWith(mockBusiness);
      expect(appGateway.sendMessage).toHaveBeenCalledWith('+1234567890', `remove Business ${id}`);
      expect(result).toEqual(mockBusiness);
    });

    it('should throw BadRequestException if business not found', async () => {
      // Arrange
      const id = 'Nonexistent Business';
      
      jest.spyOn(businessRepository, 'findOneBy').mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(id, mockUser)).rejects.toThrow('Business not found');
    });
  });
});