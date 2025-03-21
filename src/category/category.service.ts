import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, Subcategory } from './entities';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger('CategoryService');

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,

    // @InjectRepository(Contact)
    // private readonly categoryRepository: Repository<Contact>,

    // private readonly dataSource: DataSource,
  ) {}
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
      // const business = await this.businessRepository.findOneBy({
      //   business_id: createContactDto.business_id,
      // });

      // if (!business) {
      //   throw new BadRequestException(
      //     `Business with id ${createContactDto.business_id} not found`,
      //   );
      // }

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

  async addSubcategory(id: string, createSubcategoryDto: CreateSubcategoryDto) {
    const category = await this.findOne(id);

    if (!category) {
      throw new BadRequestException(`Category with id ${id} not found`);
    }
    // if (!Array.isArray(createSubcategoryDto.sub)) {
    //   throw new BadRequestException('urls must be an array');
    // }

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

  update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: string) {
    return `This action removes a #${id} category`;
  }

  private handelExeption(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpecte error, check server logs',
    );
  }
}
