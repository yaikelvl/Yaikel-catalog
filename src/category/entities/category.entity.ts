import { currencyEnum } from 'src/common/enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Subcategory } from '.';
import { Business } from 'src/business/entities';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  category_id: string;

  @Column('varchar', { nullable: false })
  category: string;

  @OneToMany(() => Subcategory, (sub) => sub.category, {
    cascade: true,
    eager: true,
    nullable: true
  })
  subcategory?: Subcategory[];

  @OneToMany(() => Business, (business) => business.category, {
    cascade: true,
    eager: true,
  })
  business: Business[];

  @Column('float', { nullable: true })
  minPrice?: number;

  @Column('float', { nullable: true })
  maxPrice?: number;

  @Column('varchar', { nullable: true })
  currency?: currencyEnum;

  @Column('timestamp', { nullable: true })
  date?: Date;
}
