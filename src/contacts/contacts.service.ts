import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './contacts.entity';
import { CreateContactDto } from './dtos/create-contact.dto';
import { User } from 'src/users/users.entity';


@Injectable()
export class ContactsService {
    constructor(@InjectRepository(Contact) private repo: Repository<Contact>) {}
    
    create (contactDto: CreateContactDto, user: User){
        const contact = this.repo.create(contactDto)
        contact.user = user;
        return this.repo.save(contact);
    }
}
