import {
  BadRequestException,
  Inject,
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

    // @Inject(CACHE_MANAGER) private cacheManager: Cache)
  ) {}

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

  //Udate mantiene los Url y agega los que se actualizan si se actualizan.
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
        const extingUrl = await this.urlContRepository.find({
          where: { contact: { contact_id: id } },
        });

        const newUrl = url.filter(
          (url) => !extingUrl.some((term) => term.url === url),
        );

        contact.url = [
          ...extingUrl,
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

  async addUrl(id: string, urls: CreateUrlDto) {
    const contact = await this.findOne(id);

    if (!Array.isArray(urls.urls)) {
      throw new BadRequestException('urls must be an array');
    }

    const newUrls = urls.urls.map((url) => this.urlContRepository.create({ url }));
    contact.url = [...contact.url, ...newUrls];

    try {
      await this.contactRepository.save(contact);
      return contact;
    }catch (error) {
      this.handelExeption(error);
    }
  }

  
  async remove(id: string) {
    const contact = await this.findOne(id);
    return await this.contactRepository.softRemove(contact);
  }

  private handelExeption(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpecte error, check server logs',
    );
  }
}
