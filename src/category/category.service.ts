import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Category, Subcategory } from './entities';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';

/**
 * CategoryService manages the logic for creating, updating, retrieving, and deleting categories.
 * It also handles adding subcategories to an existing category and checks for duplicate subcategories.
 * This service ensures that only valid data is saved and provides error handling.
 */
@Injectable()
export class CategoryService {
  private readonly logger = new Logger('CategoryService');

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>, 
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>, 
    private readonly dataSource: DataSource, 
  ) {}

  /**
   * Creates a new category and associates subcategories if provided.
   * 
   * @param createCategoryDto - Data transfer object containing category creation details.
   * @returns The created category with associated subcategories.
   * @throws BadRequestException if a category with the same name already exists.
   */
  async create(createCategoryDto: CreateCategoryDto) {
    const cat = await this.categoryRepository.findOne({
      where: { category: createCategoryDto.category },
    });

    if (cat) {
      throw new BadRequestException(
        `Category with name ${createCategoryDto.category} already exists`,
      );
    }

    try {
      const { subcategory = [], ...categoryDetails } = createCategoryDto;

      const category = this.categoryRepository.create({
        ...categoryDetails,
        subcategory: subcategory.map((sub) =>
          this.subcategoryRepository.create({ sub }),
        ),
      });
      await this.categoryRepository.save(category);
      return { ...category, subcategory };
    } catch (error) {
      this.handelExeption(error);
    }
  }

  /**
   * Retrieves all categories with pagination and includes associated subcategories.
   * 
   * @param paginationDto - Data transfer object containing pagination parameters (page and limit).
   * @returns The paginated list of categories with subcategories.
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.categoryRepository.count();
    const lastPage = Math.ceil(totalPages / limit);

    const category = {
      data: await this.categoryRepository.find({
        skip: (page - 1) * limit,
        take: limit,
        relations: {
          subcategory: true,
        },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };

    const { data, meta } = category;
    const categoryDetails = data.map(
      ({ category_id, category, subcategory }) => ({
        category_id,
        category,
        subcategory: subcategory.map((term) => term.sub),
      }),
    );

    return { categoryDetails, meta };
  }

  /**
   * Finds a category by its identifier or name.
   * 
   * @param term - Category identifier or name to search for.
   * @returns The found category.
   * @throws BadRequestException if no category is found.
   */
  async findOne(term: string) {
    let category: Category;

    if (isUUID(term)) {
      category = await this.categoryRepository.findOneBy({ category_id: term });
    } else {
      category = await this.categoryRepository.findOneBy({ category: term });
    }

    if (!category) throw new BadRequestException(`Category not found`);

    return category;
  }

  /**
   * Adds subcategories to an existing category.
   * 
   * @param id - The ID of the category to update.
   * @param createSubcategoryDto - Data transfer object containing subcategory details.
   * @returns The updated category with the added subcategories.
   * @throws BadRequestException if the category or subcategory already exists.
   */
  async addSubcategory(id: string, createSubcategoryDto: CreateSubcategoryDto) {
    const category = await this.findOne(id);

    if (!category) {
      throw new BadRequestException(`Category with id ${id} not found`);
    }

    const duplicateSubcategories = await this.subcategoryRepository
      .createQueryBuilder('subcategory')
      .select('subcategory.sub')
      .where('subcategory.category_id = :categoryId', {
        categoryId: category.category_id,
      })
      .andWhere('subcategory.sub IN (:...subcategories)', {
        subcategories: createSubcategoryDto.sub,
      })
      .getMany();

    if (duplicateSubcategories.length > 0) {
      throw new BadRequestException(
        `Subcategory with name ${duplicateSubcategories.map(
          (subcategory) => subcategory.sub,
        )} already exists in this category`,
      );
    }

    const newSub = createSubcategoryDto.sub.map((sub) =>
      this.subcategoryRepository.create({ sub }),
    );
    category.subcategory = [...category.subcategory, ...newSub];

    try {
      await this.categoryRepository.save(category);
      const { subcategory, ...cateDetails } = category;
      return {
        subcategory: subcategory.map((term) => term.sub),
        ...cateDetails,
      };
    } catch (error) {
      this.handelExeption(error);
    }
  }

  /**
   * Updates an existing category by its ID.
   * 
   * @param id - The ID of the category to update.
   * @param updateCategoryDto - Data transfer object containing updated category details.
   * @returns The updated category.
   * @throws InternalServerErrorException if an unexpected error occurs.
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    const { subcategory, ...toUpdate } = updateCategoryDto;

    const category = await this.categoryRepository.preload({
      category_id: id,
      ...toUpdate,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (subcategory) {
        await this.subcategoryRepository.delete({ category_id: id });
        category.subcategory = subcategory.map((sub) =>
          this.subcategoryRepository.create({ sub }),
        );
      }

      await queryRunner.manager.save(category);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return category;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handelExeption(error);
    }
  }

  /**
   * Removes a category by its ID.
   * 
   * @param id - The ID of the category to delete.
   * @returns The removed category.
   */
  async remove(id: string) {
    const category = await this.findOne(id);

    return await this.categoryRepository.softRemove(category);
  }

  /**
   * Handles exceptions and logs the error.
   * 
   * @param error - The error to handle.
   * @throws BadRequestException if the error code is '23505' (unique constraint violation).
   * @throws InternalServerErrorException if the error is unexpected.
   */
  private handelExeption(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
