import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CreateContactDto } from './dtos/create-contact.dto';
import { ContactsService } from './contacts.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { ContactDto } from './dtos/contact.dto';
import { Serialize } from '../interceptors/serialize.interceptor';

@Controller('contacts')
export class ContactsController {
  constructor(private contactService: ContactsService) {}

  @Post()
  @UseGuards(AuthGuard) //ngejaga orangnya harus signin dulu baru bisa akses route ini
  @Serialize(ContactDto)
  createContact(@Body() body: CreateContactDto, @CurrentUser() user: User) {
    return this.contactService.create(body, user);
  }
}
