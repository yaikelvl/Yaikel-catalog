import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
  ParseUUIDPipe,
  Inject,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto, CreateUrlDto } from './dto/';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PaginationDto } from '../common';
import { CACHE_MANAGER, CacheKey, Cache } from '@nestjs/cache-manager';
import { Auth } from '../auth/decorators';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Contact } from './entities/contact.entity';

/**
 * ContactController handles operations related to contact management,
 * including creation, retrieval, updating, and deletion of contacts.
 */
@ApiTags('contact')
@Controller('contact')
@Auth()
@UseInterceptors(CacheInterceptor)
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Creates a new contact.
   * 
   * @param createContactDto - The data transfer object containing contact details.
   * @returns The newly created contact.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiBody({ type: CreateContactDto }) // Specifies request body type in Swagger.
  @ApiResponse({
    status: 201,
    description: 'Contact successfully created.',
    type: Contact,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, validation failed.',
  })
  async create(@Body() createContactDto: CreateContactDto) {
    const newContact = this.contactService.create(createContactDto);
    await this.cacheManager.del('list-contacts');
    return newContact;
  }

  /**
   * Retrieves a list of all contacts, with optional pagination.
   * 
   * @param paginationDto - The pagination parameters.
   * @returns A list of contacts.
   */
  @Get()
  @CacheKey('list-contacts')
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiResponse({
    status: 200,
    description: 'List of contacts.',
    type: [Contact],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, validation failed.',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.contactService.findAll(paginationDto);
  }

  /**
   * Finds a specific contact by search term (e.g., ID, name).
   * 
   * @param term - The search term to find the contact.
   * @returns The requested contact if found.
   */
  @Get(':term')
  @ApiOperation({ summary: 'Find a contact by search term' })
  @ApiResponse({
    status: 200,
    description: 'Found the contact.',
    type: Contact,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, invalid search term.',
  })
  @ApiResponse({
    status: 404,
    description: 'Contact not found.',
  })
  findOne(@Param('term') term: string) {
    return this.contactService.findOne(term);
  }

  /**
   * Updates an existing contact by its ID.
   * 
   * @param id - The UUID of the contact to update.
   * @param updateContactDto - The updated contact details.
   * @returns The updated contact.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact by its ID' })
  @ApiBody({ type: UpdateContactDto }) // Specifies request body type in Swagger.
  @ApiResponse({
    status: 200,
    description: 'Contact successfully updated.',
    type: Contact,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, invalid data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Contact not found.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    const updateContact = this.contactService.update(id, updateContactDto);
    await this.cacheManager.del('list-contacts');
    return updateContact;
  }

  /**
   * Adds a URL to a contact by its ID.
   * 
   * @param id - The UUID of the contact.
   * @param createUrlDto - The URL data to be added.
   * @returns The updated contact with the new URL.
   */
  @Post('/url/:id')
  @ApiOperation({ summary: 'Add a URL to a contact' })
  @ApiBody({ type: CreateUrlDto }) // Specifies request body type in Swagger.
  @ApiResponse({
    status: 200,
    description: 'URL successfully added to the contact.',
    type: Contact,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, invalid data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Contact not found.',
  })
  addUrlContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createUrlDto: CreateUrlDto,
  ) {
    return this.contactService.addUrl(id, createUrlDto);
  }

  /**
   * Deletes a contact by its ID.
   * 
   * @param id - The UUID of the contact to delete.
   * @returns A success message confirming deletion.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact by its ID' })
  @ApiResponse({
    status: 200,
    description: 'Contact successfully deleted.',
    type: Contact,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, invalid ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Contact not found.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const removeContact = this.contactService.remove(id);
    await this.cacheManager.del('list-contacts');
    return removeContact;
  }
}
