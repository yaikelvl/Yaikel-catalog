import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { businessModelEnum } from '../../common/enum';
import { User } from '../../auth/entities/auth.entity';
import { Product } from 'src/product/entities/product.entity';

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

  @Column('text', { nullable: false })
  coverImage: string[];

  @Column('varchar', { nullable: false })
  profileImage: string;

  @Column('varchar', { unique: true })
  name: string;

  @Column('varchar', { nullable: true, default: 'Empty Slogan' })
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

  @OneToMany(() => Product, (product) => product.business, { cascade: true })
  product: Product[];

  @ManyToOne(() => User, (user) => user.business)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid')
  user_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column('boolean', { nullable: true, default: true })
  isActive?: boolean;

  @DeleteDateColumn() // Agrega esta línea para soportar soft delete
  deletedAt?: Date;
}
