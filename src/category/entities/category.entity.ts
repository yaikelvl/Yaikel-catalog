import { currencyEnum } from 'src/common/enum';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Subcategory } from '.';
import { Business } from 'src/business/entities';
import { Product } from 'src/product/entities/product.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  category_id: string;

  @Column('varchar', { nullable: false, unique: true })
  category: string;

  @OneToMany(() => Subcategory, (subcategory) => subcategory.category, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  subcategory?: Subcategory[];

  @OneToMany(() => Business, (business) => business.category, {
    cascade: true,
    eager: true,
  })
  business: Business[];

  @OneToMany(() => Product, (product) => product.category, {
    cascade: true,
    eager: true,
  })
  product: Product[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
