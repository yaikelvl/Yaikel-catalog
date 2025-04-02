import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '.';

@Entity()
export class Subcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text',{nullable: true})
  sub?: string;

  @ManyToOne(() => Category, (category) => category.subcategory)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column('uuid')
  category_id: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}
