import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import {User} from '../users/users.entity'

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accountNumber: string;

  @Column()
  bankName: string;

  @Column()
  contactName: string;

  @ManyToOne(() => User, (user) => user.contacts, { onDelete: 'CASCADE' })
  user: User;
}