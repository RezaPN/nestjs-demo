import { Controller, Post, Body, Get, UseGuards, Delete, Param, Req, Put } from '@nestjs/common';
import { CreateContactDto } from './dtos/create-contact.dto';
import { ContactsService } from './contacts.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { ContactDto } from './dtos/contact.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import {Request} from 'express';
import { ContactFind } from './dtos/contact-find.dto';
import { updateContactDto } from './dtos/update-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private contactService: ContactsService) {}

  @Post()
  @UseGuards(AuthGuard) //ngejaga orangnya harus signin dulu baru bisa akses route ini
  @Serialize(ContactDto)
  createContact(@Body() body: CreateContactDto, @CurrentUser() user: User) {
    return this.contactService.create(body, user);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard) //ngejaga orangnya harus signin dulu baru bisa akses route ini
  @Serialize(ContactDto)
  deleteContact(@Param('id') id: string, @CurrentUser() user: User) {
    return this.contactService.deleteContactById(parseInt(id), user);
  }

  @Get()
  @UseGuards(AuthGuard)
  @Serialize(ContactFind)
  async findOrFindAllContacts(@Req() request: Request, @CurrentUser() user: User) {
    // Extract the token from the Authorization header
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
  
    if (Object.keys(request.query).length > 0) {
      return this.contactService.find(request.query, user);
    } else {
      return this.contactService.findAll(token);
    }
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  @Serialize(ContactFind)
  async updateContact(@Param('id') id: string, @Body() body: updateContactDto, @CurrentUser() user: User) {
    return this.contactService.update(parseInt(id), body, user);
  }
}
