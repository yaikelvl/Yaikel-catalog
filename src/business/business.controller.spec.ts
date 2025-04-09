import { Test, TestingModule } from '@nestjs/testing';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { PaginationDto } from '../common';
import { User } from '../auth/entities/auth.entity';
import { Business } from './entities/business.entity';
import { BusinessImages } from './entities/business-images.entity';
import { ValidRoles } from '../auth/enum/valid-roles';
import { businessModelEnum } from '../common/enum';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CanActivate, ExecutionContext } from '@nestjs/common';

describe('BusinessController', () => {
  let controller: BusinessController;
  let businessService: BusinessService;
  let cacheManager: any;

  const mockUser: User = {
    id: '1',
    phone: '+1234567890',
    password: 'hashed-password',
    role: [ValidRoles.ADMIN],
    isActive: true,
    business: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;
  // Mock BusinessImages objects for entity
  const mockBusinessImages: BusinessImages[] = [
    {
      id: 1,
      url: 'http://example.com/image1.jpg',
      image_public_id: 'public_id_1',
      business: null,
      business_id: '1',
      deletedAt: null
    },
    {
      id: 2,
      url: 'http://example.com/image2.jpg',
      image_public_id: 'public_id_2',
      business: null,
      business_id: '1',
      deletedAt: null
    }
  ];

  // Mock business entity (with coverImage as BusinessImages[]) for raw entity returns
  const mockBusinessEntity: Business = {
    business_id: '1',
    businessModel: businessModelEnum.business,
    businessType: 'Retail',
    coverImage: mockBusinessImages,
    profileImage: 'test-profile.jpg',
    name: 'Test Business',
    slogan: 'Test Slogan',
    description: 'Test Description',
    address: '123 Test Street',
    dateEvent: null,
    dateStartEvent: null,
    dateEndEvent: null,
    contact: null, 
    product: [], 
    user: mockUser,
    category: null,
    user_id: mockUser.id,
    category_id: 'category-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as Business;

  // Mock business with coverImage as string[] to match service return types
  const mockBusiness = {
    business_id: '1',
    businessModel: businessModelEnum.business,
    businessType: 'Retail',
    coverImage: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'], // Mock as string[] to match service return
    profileImage: 'test-profile.jpg',
    name: 'Test Business',
    slogan: 'Test Slogan',
    description: 'Test Description',
    address: '123 Test Street',
    dateEvent: null,
    dateStartEvent: null,
    dateEndEvent: null,
    contact: null, 
    product: [], 
    user: mockUser,
    category: null,
    user_id: mockUser.id,
    category_id: 'category-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
  // Create a mock AuthGuard with user context
  class MockAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
      const req = context.switchToHttp().getRequest();
      req.user = mockUser;
      return true;
    }
  }

  const mockAuthGuard = new MockAuthGuard();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' }
        }),
      ],
      controllers: [BusinessController],
      providers: [
        {
          provide: BusinessService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOnePlane: jest.fn(),
            updateNew: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            del: jest.fn(),
          },
        },
        {
          provide: AuthGuard,
          useValue: mockAuthGuard,
        },
      ],
    }).overrideGuard(AuthGuard).useValue(mockAuthGuard).compile();

    controller = module.get<BusinessController>(BusinessController);
    businessService = module.get<BusinessService>(BusinessService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a business and clear cache', async () => {
      const createBusinessDto: CreateBusinessDto = {
        name: 'Test Business',
        description: 'Test Description',
        businessModel: businessModelEnum.business,
        businessType: '',
        profileImage: '',
        address: '',
        user_id: '',
        category_id: ''
      };
      const mockImages = [{ filename: 'test.jpg' }] as Express.Multer.File[];

      jest.spyOn(businessService, 'create').mockResolvedValue(mockBusiness); // Corrected spyOn for businessService.create
      jest.spyOn(cacheManager, 'del').mockResolvedValue(undefined); // Corrected spyOn for cacheManager.del

      const result = await controller.create(createBusinessDto, mockImages, mockUser);

      expect(businessService.create).toHaveBeenCalledWith(createBusinessDto, mockImages, mockUser);
      expect(cacheManager.del).toHaveBeenCalledWith('list-businesses');
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('findAll', () => {
    it('should return a list of businesses', async () => {
      const paginationDto: PaginationDto = { limit: 10 };
      // Match the service's actual return structure
      const expectedResult = {
        businessDetails: [{
          business_id: '1',
          businessModel: businessModelEnum.business,
          businessType: 'Retail',
          coverImage: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
          name: 'Test Business',
          category: {
            category: [],
            subcategories: []
          },
          contact: {
            phones: [],
            url: []
          },
          slogan: 'Test Slogan',
          description: 'Test Description',
          address: '123 Test Street',
          dateEvent: null,
          dateStartEvent: null,
          dateEndEvent: null,
        }],
        meta: {
          total: 1,
          page: 1,
          lastPage: 1
        }
      };

      jest.spyOn(businessService, 'findAll').mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto, mockUser);

      expect(businessService.findAll).toHaveBeenCalledWith(paginationDto, mockUser);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single business', async () => {
      const term = 'test-business';

      jest.spyOn(businessService, 'findOnePlane').mockResolvedValue(mockBusiness);

      const result = await controller.findOne(term, true, mockUser);

      expect(businessService.findOnePlane).toHaveBeenCalledWith(term, true, mockUser);
      expect(result).toEqual(mockBusiness);
    });
  });

  describe('update', () => {
    it('should update a business and clear cache', async () => {
      const id = '1';
      const updateBusinessDto: UpdateBusinessDto = { name: 'Updated Business' };
      const updatedBusiness = { 
        ...mockBusiness, 
        name: 'Updated Business',
        // Ensure coverImage remains a string[] to match service return
        coverImage: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg']
      };

      jest.spyOn(businessService, 'updateNew').mockResolvedValue(updatedBusiness);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(undefined);

      const result = await controller.update(id, updateBusinessDto, mockUser);

      expect(businessService.updateNew).toHaveBeenCalledWith(id, updateBusinessDto, mockUser);
      expect(cacheManager.del).toHaveBeenCalledWith('list-businesses');
      expect(result).toEqual(updatedBusiness);
    });
  });

  describe('remove', () => {
    it('should remove a business and clear cache', async () => {
      const id = '1';

      jest.spyOn(businessService, 'remove').mockResolvedValue(mockBusinessEntity);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(undefined);

      const result = await controller.remove(id, mockUser);

      expect(businessService.remove).toHaveBeenCalledWith(id, mockUser);
      expect(cacheManager.del).toHaveBeenCalledWith('list-businesses');
      expect(result).toEqual(mockBusinessEntity);
    });
  });
});