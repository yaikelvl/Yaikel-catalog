import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { businessModelEnum } from '../../common/enum';
import { User } from '../../auth/entities/auth.entity';
import { Product } from 'src/product/entities/product.entity';
import { Contact } from 'src/contact/entities/contact.entity';
import { BusinessImages } from './';
import { Category } from 'src/category/entities';

@Entity('business')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  business_id: string;

  @Column('varchar', {
    nullable: false,
    default: businessModelEnum.business,
  })
  businessModel: businessModelEnum;

  @Column('varchar', { nullable: false })
  businessType: string;

  @OneToMany(() => BusinessImages, (image) => image.business, { cascade: true, eager: true })
  coverImage: BusinessImages[];

  @Column('varchar', { nullable: false })
  profileImage: string;

  @Column('varchar', { unique: true })
  name: string;

  @Column('varchar', { nullable: true, default: '' })
  slogan?: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('varchar', { nullable: false, unique: true })
  address: string;

  @Column({ type: 'timestamp', nullable: true })
  dateEvent?: Date;

  @Column({ type: 'timestamp', nullable: true })
  dateStartEvent?: Date;

  @Column({ type: 'timestamp', nullable: true })
  dateEndEvent?: Date;

  @OneToOne(() => Contact, (contact) => contact.business, {
    cascade: ['insert', 'update'],
  })
  contact: Contact;

  @OneToMany(() => Product, (product) => product.business, { cascade: true })
  product: Product[];


  @ManyToOne(() => User, (user) => user.business)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category, (category) => category.business)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column('uuid')
  user_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn() 
  deletedAt?: Date;
}
