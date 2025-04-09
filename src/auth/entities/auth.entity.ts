import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ValidRoles } from '../enum/valid-roles';
import { Business } from '../../business/entities/business.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { unique: true, nullable: false })
  phone: string;

  @Column('text', { nullable: false, select: false })
  password: string;

  @Column({
    type: 'text',
    array: true,
    nullable: false,
    default: [ValidRoles.USER],
  })
  role: ValidRoles[];

  @OneToMany(() => Business, (business) => business.user, { cascade: true })
  business: Business[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column('boolean', { default: true })
  isActive: boolean;

  // @BeforeInsert()
  // checkRoleBeforeInsert(){
  //   this.role = this.role.map(role => role.toUpperCase().trim());
  // }

  // @BeforeUpdate()
  // checkEmailBeforeUpdate(){
  //   this.checkEmailBeforeInsert();
  // }
}
