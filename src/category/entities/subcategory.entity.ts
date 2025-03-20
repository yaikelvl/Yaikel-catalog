import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '.';

@Entity('subcategory')
export class Subcategory {
  @PrimaryGeneratedColumn()
  id: number;

  subcategory?: string;

  @ManyToOne(() => Category, (category) => category.subcategory)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column('uuid')
  category_id: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}
