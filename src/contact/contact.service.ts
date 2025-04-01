import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Contact } from './entities/contact.entity';
import { UrlContact } from './entities';
import { PaginationDto } from '../common';
import { isUUID } from 'class-validator';
import { Business } from '../business/entities';
import { CreateUrlDto, CreateContactDto, UpdateContactDto } from './dto';

/**
 * ContactService manages the logic for creating, updating, retrieving, and deleting contacts.
 * It also handles the addition of URLs to contacts and ensures data integrity during operations.
 */
@Injectable()
export class ContactService {
  private readonly logger = new Logger('ContactService');

  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,

    @InjectRepository(UrlContact)
    private readonly urlContRepository: Repository<UrlContact>,

    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new contact and associates URLs with it.
   * 
   * @param createContactDto - Data transfer object containing contact creation details.
   * @returns The created contact with associated URLs.
   * @throws BadRequestException if the business associated with the contact is not found.
   */
  async create(createContactDto: CreateContactDto) {
    try {
      const business = await this.businessRepository.findOneBy({
        business_id: createContactDto.business_id,
      });

      if (!business) {
        throw new BadRequestException(
          `Business with id ${createContactDto.business_id} not found`,
        );
      }

      const { url = [], ...contactDetails } = createContactDto;

      const contact = this.contactRepository.create({
        ...contactDetails,
        url: url.map((url) => this.urlContRepository.create({ url })),
      });
      await this.contactRepository.save(contact);
      return { ...contact, url };
    } catch (error) {
      this.handelExeption(error);
    }
  }

  /**
   * Retrieves all contacts with pagination and includes associated URLs.
   * 
   * @param paginationDto - Data transfer object containing pagination parameters (page and limit).
   * @returns The paginated list of contacts with associated URLs.
   */
  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.contactRepository.count();
    const lastPage = Math.ceil(totalPages / limit);

    const contact = {
      data: await this.contactRepository.find({
        skip: (page - 1) * limit,
        take: limit,
        relations: {
          url: true,
        },
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage,
      },
    };

    const { data, meta } = contact;
    const contactDetails = data.map(
      ({ contact_id, business_id, phone, url }) => ({
        contact_id,
        business_id,
        phone,
        url: url.map((term) => term.url),
      }),
    );

    return { contactDetails, meta };
  }

  /**
   * Finds a contact by its identifier or phone number.
   * 
   * @param term - Contact identifier (ID or phone number) to search for.
   * @returns The found contact.
   * @throws BadRequestException if no contact is found.
   */
  async findOne(term: string) {
    let contact: Contact;

    if (isUUID(term)) {
      contact = await this.contactRepository.findOneBy({ contact_id: term });
    } else {
      const queryBulder = this.contactRepository.createQueryBuilder('contact');
      contact = await queryBulder
        .where('contact.phone @> :phone', {
          phone: `{${term}}`,
        })
        .leftJoinAndSelect('contact.url', 'url')
        .getOne();
    }

    if (!contact) throw new BadRequestException('Contact business not found');

    return contact;
  }

  /**
   * Updates an existing contact by its ID. Maintains existing URLs and adds new ones.
   * 
   * @param id - The ID of the contact to update.
   * @param updateContactDto - Data transfer object containing updated contact details.
   * @returns The updated contact with URLs.
   * @throws InternalServerErrorException if an unexpected error occurs during the update process.
   */
  async update(id: string, updateContactDto: UpdateContactDto) {
    await this.findOne(id);
    const { url, ...toUpdate } = updateContactDto;

    const contact = await this.contactRepository.preload({
      contact_id: id,
      ...toUpdate,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (url) {
        const existingUrl = await this.urlContRepository.find({
          where: { contact: { contact_id: id } },
        });

        const newUrl = url.filter(
          (url) => !existingUrl.some((term) => term.url === url),
        );

        contact.url = [
          ...existingUrl,
          ...newUrl.map((url) =>
            this.urlContRepository.create({ url }),
          ),
        ];
      }

      await queryRunner.manager.save(contact);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return contact;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handelExeption(error);
    }
  }

  /**
   * Adds new URLs to an existing contact.
   * 
   * @param id - The ID of the contact to update.
   * @param urls - Data transfer object containing an array of new URLs to be added.
   * @returns The updated contact with newly added URLs.
   * @throws BadRequestException if the URLs are not provided as an array.
   * @throws InternalServerErrorException if an error occurs during the operation.
   */
  async addUrl(id: string, urls: CreateUrlDto) {
    const contact = await this.findOne(id);

    if (!Array.isArray(urls.urls)) {
      throw new BadRequestException('URLs must be an array');
    }

    const newUrls = urls.urls.map((url) => this.urlContRepository.create({ url }));
    contact.url = [...contact.url, ...newUrls];

    try {
      await this.contactRepository.save(contact);
      return contact;
    } catch (error) {
      this.handelExeption(error);
    }
  }

  /**
   * Removes a contact by its ID.
   * 
   * @param id - The ID of the contact to delete.
   * @returns The removed contact.
   */
  async remove(id: string) {
    const contact = await this.findOne(id);
    return await this.contactRepository.softRemove(contact);
  }

  /**
   * Handles exceptions and logs errors. If a unique constraint violation occurs, it throws a BadRequestException.
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
