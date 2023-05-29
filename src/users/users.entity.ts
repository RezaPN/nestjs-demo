import {
  AfterInsert,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  AfterUpdate,
  AfterRemove,
  OneToMany
} from 'typeorm';
//all of this is decorators
import {Contact} from '../contacts/contacts.entity'


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: true})
  admin: boolean;

  @OneToMany(() => Contact,  (contact) => contact.user )
  contacts: Contact[];

  @AfterInsert()
  logInsert() {
    console.log('Inserted User With id', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Update User with id', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('Remove User with id', this.id);
  }
}
