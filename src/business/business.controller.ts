import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Inject,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { PaginationDto } from 'src/common';
import { CACHE_MANAGER, CacheKey, Cache } from '@nestjs/cache-manager';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/auth.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Business } from './entities/business.entity';

/**
 * BusinessController handles operations related to business management,
 * including creation, retrieval, updating, and deletion of businesses.
 */
@ApiTags('business')
@Controller('business')
@Auth()
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Creates a new business entity.
   *
   * @param createBusinessDto - The data transfer object containing business details.
   * @param user - The authenticated user creating the business.
   * @returns The newly created business.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new business' })
  @ApiBody({ type: CreateBusinessDto }) // Specifies request body type in Swagger.
  @ApiResponse({
    status: 201,
    description: 'Business successfully created.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, validation failed.',
  })
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @GetUser() user: User,
  ) {
    const newBusiness = this.businessService.create(createBusinessDto, user);
    await this.cacheManager.del('list-businesses');
    return newBusiness;
  }

  /**
   * Retrieves a list of all businesses associated with the authenticated user, with optional pagination.
   *
   * @param paginationDto - The pagination parameters.
   * @param user - The authenticated user requesting the businesses.
   * @returns A list of businesses.
   */
  @Get()
  @CacheKey('list-businesses')
  @ApiOperation({ summary: 'Get all businesses' })
  @ApiResponse({
    status: 200,
    description: 'List of businesses.',
    type: [Business],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, validation failed.',
  })
  findAll(@Query() paginationDto: PaginationDto, @GetUser() user: User) {
    return this.businessService.findAll(paginationDto, user);
  }

  /**
   * Finds a specific business by a search term (e.g., ID, name, or slug).
   *
   * @param term - The search term to find the business.
   * @returns The requested business if found.
   */
  @Get(':term')
  @ApiOperation({ summary: 'Find a business by search term' })
  @ApiResponse({
    status: 200,
    description: 'Found the business.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, invalid search term.',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found.',
  })
  findOne(
    @Param('term') term: string,
    flag: boolean = true,
    @GetUser() user: User,
  ) {
    return this.businessService.findOnePlane(term, flag, user);
  }

  /**
   * Updates an existing business by its ID.
   *
   * @param id - The UUID of the business to update.
   * @param updateBusinessDto - The updated business details.
   * @param user - The authenticated user making the update.
   * @returns The updated business.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a business by its ID' })
  @ApiBody({ type: UpdateBusinessDto }) // Specifies request body type in Swagger.
  @ApiResponse({
    status: 200,
    description: 'Business successfully updated.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, invalid data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found.',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @GetUser() user: User,
  ) {
    const updatedBusiness = this.businessService.updateNew(
      id,
      updateBusinessDto,
      user,
    );
    await this.cacheManager.del('list-businesses');
    return updatedBusiness;
  }

  /**
   * Deletes a business by its ID.
   *
   * @param id - The UUID of the business to delete.
   * @param user - The authenticated user requesting deletion.
   * @returns A success message confirming deletion.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a business by its ID' })
  @ApiResponse({
    status: 200,
    description: 'Business successfully deleted.',
    type: Business,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, invalid ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Business not found.',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string, @GetUser() user: User) {
    const removedBusiness = this.businessService.remove(id, user);
    this.cacheManager.del('list-businesses');
    return removedBusiness;
  }
}
