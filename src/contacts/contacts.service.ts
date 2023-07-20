import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './contacts.entity';
import { CreateContactDto } from './dtos/create-contact.dto';
import { UsersService } from '../users/users.service';
import { Payload } from '../type/payload.type';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact) private repo: Repository<Contact>,
    private userService: UsersService,
  ) {}

  async create(contactDto: CreateContactDto, payload: Payload) {
    const contact = this.repo.create(contactDto);
    const userId = payload.sub;

    const user = await this.userService.findOneUser(userId);

    if (!user) {
      throw new Error('User not found');
    }

    contact.user = user;
    return this.repo.save(contact);
  }

  async findContact(
    payload: Payload,
    query?: any,
  ): Promise<Contact[] | Contact> {
    //buat cegah query yang aneh2
    const allowedFields = ['id', 'accountNumber', 'bankName', 'contactName'];

    const userId = payload.sub;

    let whereClause: any = { user: { id: userId } };

    if (query) {
      //kalo load quaries kebanyakan lempar bad request exception
      if (Object.keys(query).length > allowedFields.length) {
        throw new BadRequestException('Too many query parameters');
      }

      // tambah where clause jika query tersedia
      Object.keys(query).forEach((key) => {
        if (allowedFields.includes(key)) {
          whereClause[key] = query[key];
        }
      });
    }

    return this.repo.find({ where: whereClause });
  }

  async deleteContactById(contactId: number, payload: Payload) {
    const userId = payload.sub;

    const deleteResult = await this.repo
      .createQueryBuilder()
      .delete()
      .from(Contact) //dari table mana entitas dihapus
      .where('id = :contactId', { contactId }) //hapus entri di mana id sama dengan contactId
      .andWhere('userId = :userId', { userId: userId }) //juga lebih spesifik lagi di userid mana, dengan begini dari userId lain gak bisa ngapus id akun orang lain
      .execute();

    //deleteResult.affected === 0 berarti tidak ada baris yang terpengaruh oleh operasi penghapusan
    if (deleteResult.affected === 0) {
      throw new NotFoundException('Contact not found');
    }

    return {
      contact_id: contactId,
    };
  }

  async update(contactId: number, attrs: Partial<Contact>, payload: Payload) {
    const dataUser = await this.findContact(payload, {
      id: contactId,
    }) as Contact

    if (Array.isArray(dataUser) && dataUser.length === 0) {
      throw new NotFoundException('users not found');
    } else if (!dataUser) {
      throw new NotFoundException('users not found');
    }

    Object.assign(dataUser[0], attrs);
    return this.repo.save(dataUser);
  }
}
