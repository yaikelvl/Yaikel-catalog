import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


import { currencyEnum, productsModelEnum } from '../../common/enum';
import { Business } from '../../business/entities/';
import { Category } from '../../category/entities';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  product_id: string;

  @Column('varchar', {
    nullable: false,
    default: productsModelEnum.product,
  })
  productModel: productsModelEnum;

  @Column('bool', { nullable: false , default: false})
  isServices: boolean;

  @Column('varchar', { nullable: false })
  productType: string;

  @Column('text', { nullable: false })
  productImage: string[];

  @Column('varchar', { unique: true })
  name: string;

  @ManyToOne(() => Category, (category) => category.product)
    @JoinColumn({ name: 'category_id' })
    category: Category;

  @Column('float', { nullable: false, default: 0 })
  price: number;

  @Column('varchar', {
    nullable: false,
    default: currencyEnum.CUP,
  })
  currency: currencyEnum;

  @Column('text', { nullable: true })
  description?: string;

  @Column('uuid')
  business_id: string;

  @Column('uuid')
  category_id: string;

  @ManyToOne(() => Business, (business) => business.product)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
