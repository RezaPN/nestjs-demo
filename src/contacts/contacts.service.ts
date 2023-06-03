import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './contacts.entity';
import { CreateContactDto } from './dtos/create-contact.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/users/auth.service';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact) private repo: Repository<Contact>,
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  async create(contactDto: CreateContactDto, jwt: string) {
    const contact = this.repo.create(contactDto);
    const payload = await this.authService.decodeJwt(jwt);
    const userId = payload.sub;

    const user = await this.userService.findOne(userId);

    contact.user = user;
    return this.repo.save(contact);
  }

  async findAll(token: string): Promise<Contact[]> {
    // Check if user and user.id are not null or undefined

    const payload = await this.authService.decodeJwt(token);
    const userId = parseInt(payload.sub);

    const allContacts = await this.repo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (allContacts.length === 0) {
      throw new NotFoundException('No contacts found for this user');
    }

    return allContacts;
  }

  async find(query: any, token: string): Promise<Contact[] | Contact> {
    //buat cegah query yang aneh2
    const allowedFields = ['id', 'accountNumber', 'bankName', 'contactName'];

    const payload = await this.authService.decodeJwt(token);
    const userId = payload.sub;

    //kalo load quaries kebanyakan lempar bad request exception
    if (Object.keys(query).length > allowedFields.length) {
      throw new BadRequestException('Too many query parameters');
    }

    let whereClause: any = { user: { id: userId } };

    //tambahin sesuai query yang ada
    Object.keys(query).forEach((key) => {
      if (allowedFields.includes(key)) {
        whereClause[key] = query[key];
      }
    });

    const contacts = await this.repo.find({
      where: whereClause,
      relations: ['user'],
    });

    if (!contacts || contacts.length === 0) {
      throw new NotFoundException('No contacts found for this user');
    }

    return contacts.length === 1 ? contacts[0] : contacts;
  }

  async deleteContactById(contactId: number, token: string) {
    const payload = await this.authService.decodeJwt(token);
    const userId = payload.sub;

    const deleteResult = await this.repo
      .createQueryBuilder()
      .delete()
      .from(Contact) //dari table mana entitas dihapus
      .where('id = :contactId', { contactId }) //hapus entri di mana id sama dengan contactId
      .andWhere('userId = :userId', { userId: userId }) //juga, dengan begini dari userId lain gak bisa ngapus id akun orang lain
      .execute();

    //deleteResult.affected === 0 berarti tidak ada baris yang terpengaruh oleh operasi penghapusan
    if (deleteResult.affected === 0) {
      throw new NotFoundException('Contact not found');
    }

    return {
      status: 200,
      message: 'Contact deleted successfuly',
    };
  }

  async update(contactId: number, attrs: Partial<Contact>, jwt: string) {
    const dataUser = (await this.find({ id: contactId }, jwt)) as Contact;

    if (!dataUser) {
      throw new NotFoundException('users not found');
    }

    console.log(attrs);

    Object.assign(dataUser, attrs);
    return this.repo.save(dataUser);
  }
}
