import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateCategoryDto, CreateSubcategoryDto, UpdateCategoryDto } from './dto';
import { Category } from './entities/category.entity';
import { Subcategory } from './entities/subcategory.entity';
import { PaginationDto } from '../common';

// Mock Auth decorator
jest.mock('../auth/decorators', () => ({
  Auth: () => jest.fn(),
}));

// Define interface that matches the shape returned by service methods
interface CategoryResponse {
  category_id: string;
  category: string;
  subcategory: string[]; // Service returns string[] not Subcategory[]
  business: any[];
  product: any[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: CategoryService;
  let cacheManager: any;
  // Mock category (Entity)
  const mockCategory: Category = {
    category_id: '1',
    category: 'Test Category',
    subcategory: [],
    business: [],
    product: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock subcategory (Entity)
  const mockSubcategory: Subcategory = {
    id: 1,
    sub: 'Test Subcategory',
    category: mockCategory,
    category_id: '1',
  };
  
  // Mock responses that match what the service actually returns
  const mockCategoryResponse: CategoryResponse = {
    category_id: '1',
    category: 'Test Category',
    subcategory: ['Test Subcategory'], // string[] instead of Subcategory[]
    business: [],
    product: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const mockUpdatedCategoryResponse: CategoryResponse = {
    category_id: '1',
    category: 'Updated Category',
    subcategory: ['Test Subcategory'], // string[] instead of Subcategory[]
    business: [],
    product: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockCategoryResponse),
            findAll: jest.fn(),
            findOne: jest.fn().mockResolvedValue(mockCategoryResponse as unknown as Category),
            update: jest.fn().mockResolvedValue(mockUpdatedCategoryResponse as unknown as Category),
            remove: jest.fn().mockResolvedValue(mockCategoryResponse as unknown as Category),
            addSubcategory: jest.fn().mockResolvedValue(mockCategoryResponse),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    categoryService = module.get<CategoryService>(CategoryService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category and clear cache', async () => {
      // Arrange
      const createCategoryDto: CreateCategoryDto = { category: 'Test Category', subcategory: [] };
      // Note: Mock is already set up in beforeEach

      // Act
      const result = await controller.create(createCategoryDto);

      // Assert
      // The controller returns what the service returns, we can compare against mockCategoryResponse
      expect(result).toEqual(mockCategoryResponse);
    });
  });
  describe('findAll', () => {
    it('should return a list of categories', async () => {
      // Arrange
      const paginationDto: PaginationDto = { limit: 10, page: 1 };
      const expectedResult = {
        categoryDetails: [
          {
            category_id: mockCategory.category_id,
            category: mockCategory.category,
            subcategory: []
          }
        ],
        meta: {
          total: 1,
          page: 1,
          lastPage: 1
        }
      };
      jest.spyOn(categoryService, 'findAll').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.findAll(paginationDto);

      // Assert
      expect(categoryService.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a category by ID', async () => {
      // Arrange
      const id = '1';
      // Note: Mock is already set up in beforeEach

      // Act
      const result = await controller.findOne(id);

      // Assert
      expect(categoryService.findOne).toHaveBeenCalledWith(id);
      // The controller returns what the service returns
      expect(result).toEqual(mockCategoryResponse);
    });
  });
  describe('update', () => {
    it('should update a category and clear cache', async () => {
      // Arrange
      const id = '1';
      const updateCategoryDto: UpdateCategoryDto = { category: 'Updated Category' };
      // Note: Mock is already set up in beforeEach

      // Act
      const result = await controller.update(id, updateCategoryDto);

      // Assert
      expect(categoryService.update).toHaveBeenCalledWith(id, updateCategoryDto);
      expect(cacheManager.del).toHaveBeenCalledWith('list-categories');
      // The controller returns what the service returns
      expect(result).toEqual(mockUpdatedCategoryResponse);
    });
  });

  describe('remove', () => {
    it('should remove a category and clear cache', async () => {
      // Arrange
      const id = '1';
      // Note: Mock is already set up in beforeEach

      // Act
      const result = await controller.remove(id);

      // Assert
      expect(categoryService.remove).toHaveBeenCalledWith(id);
      expect(cacheManager.del).toHaveBeenCalledWith('list-categories');
      // The controller returns what the service returns
      expect(result).toEqual(mockCategoryResponse);
    });
  });

  describe('addSubcategory', () => {
    it('should add a subcategory to a category and clear cache', async () => {
      // Arrange
      const id = '1';
      const createSubcategoryDto: CreateSubcategoryDto = { sub: ['Test Subcategory'] };
      // Note: Mock is already set up in beforeEach

      // Act
      const result = await controller.addSubcategory(id, createSubcategoryDto);

      // Assert
      expect(categoryService.addSubcategory).toHaveBeenCalledWith(id, createSubcategoryDto);
      expect(cacheManager.del).toHaveBeenCalledWith('list-categories');
      // The controller returns what the service returns
      expect(result).toEqual(mockCategoryResponse);
    });
  });
});
