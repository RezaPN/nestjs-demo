import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, Equal } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './contacts.entity';
import { CreateContactDto } from './dtos/create-contact.dto';
import { User } from 'src/users/users.entity';

@Injectable()
export class ContactsService {
  constructor(@InjectRepository(Contact) private repo: Repository<Contact>) {}

  create(contactDto: CreateContactDto, user: User) {
    const contact = this.repo.create(contactDto);
    contact.user = user;
    return this.repo.save(contact);
  }

  async findAll(user: User): Promise<Contact[]> {
    // Check if user and user.id are not null or undefined
    if (!user || !user.id) {
      throw new NotFoundException('Invalid user');
    }

    const allContacts = await this.repo
      .createQueryBuilder('contact')
      .where('userId = :userId', { userId: user.id })
      .getMany();

    if (allContacts.length === 0) {
      throw new NotFoundException('No contacts found for this user');
    }

    return allContacts;
  }

  async find(query: any, user: User): Promise<Contact[] | Contact> {
    //buat cegah query yang aneh2
    const allowedFields = ['id', 'accountNumber', 'bankName', 'contactName'];

    //kalo load quaries kebanyakan lempar bad request exception
    if (Object.keys(query).length > allowedFields.length) {
      throw new BadRequestException('Too many query parameters');
    }
    let qb = this.repo
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.user', 'user')
      .where('user.id = :userId', { userId: user.id });

    // Looping query object untuk nambahin kondisi
    Object.keys(query).forEach((key) => {
      if (allowedFields.includes(key)) {
        qb = qb.andWhere(`contact.${key} = :${key}`, { [key]: query[key] });
      }
    });

    const contacts = await qb.getMany();

    if (!contacts || contacts.length === 0) {
      throw new NotFoundException('No contacts found for this user');
    }
    
    return contacts.length === 1 ? contacts[0] : contacts;
  }

  async deleteContactById(contactId: number, user: User): Promise<void> {
    const deleteResult = await this.repo
      .createQueryBuilder()
      .delete()
      .from(Contact) //dari table mana entitas dihapus
      .where('id = :contactId', { contactId }) //hapus entri di mana id sama dengan contactId
      .andWhere('userId = :userId', { userId: user.id }) //juga, dengan begini dari userId lain gak bisa ngapus id akun orang lain
      .execute();

    //deleteResult.affected === 0 berarti tidak ada baris yang terpengaruh oleh operasi penghapusan
    if (deleteResult.affected === 0) {
      throw new NotFoundException('Contact not found');
    }
  }

  async update(contactId: number, attrs: Partial<Contact>, user: User) {
    const dataUser = await this.find({ id: contactId }, user) as Contact

    if (!dataUser) {
      throw new NotFoundException('users not found');
    }

    Object.assign(dataUser, attrs);
    return this.repo.save(dataUser);
  }
}
