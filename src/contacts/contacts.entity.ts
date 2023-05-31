import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, AfterInsert, AfterUpdate, AfterRemove } from 'typeorm';
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

  @AfterInsert()
  logInsert() {
    console.log('Inserted contact With id', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Update contact with id', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('Remove contact with id', this.id);
  }
}