import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Delete,
  Param,
  Req,
  Put,
} from '@nestjs/common';
import { CreateContactDto } from './dtos/create-contact.dto';
import { ContactsService } from './contacts.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { ContactDto } from './dtos/contact.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { Request } from 'express';
import { ContactFind } from './dtos/contact-find.dto';
import { updateContactDto } from './dtos/update-contact.dto';
import { jwtRequestExtract } from 'src/utlis/jwt.utils';

@Controller('contacts')
export class ContactsController {
  constructor(private contactService: ContactsService) {}

  @Post()
  @UseGuards(AuthGuard) //ngejaga orangnya harus signin dulu baru bisa akses route ini
  @Serialize(ContactDto)
  createContact(@Body() body: CreateContactDto, @Req() request: Request) {
    const token = jwtRequestExtract(request);
    return this.contactService.create(body, token);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard) //ngejaga orangnya harus signin dulu baru bisa akses route ini
  @Serialize(ContactDto)
  deleteContact(@Param('id') id: string,  @Req() request: Request) {
    const token = jwtRequestExtract(request);
    return this.contactService.deleteContactById(parseInt(id), token);
  }

  @Get()
  @UseGuards(AuthGuard)
  @Serialize(ContactFind)
  async findOrFindAllContacts(
    @Req() request: Request,
  ) {
    const token = jwtRequestExtract(request);

    if (Object.keys(request.query).length > 0) {
      return this.contactService.find(request.query, token);
    } else {
      return this.contactService.findAll(token);
    }
  }

  @Put('/:id')
  @UseGuards(AuthGuard)
  @Serialize(ContactFind)
  async updateContact(
    @Param('id') id: string,
    @Body() body: updateContactDto,
    @Req() request: Request,
  ) {
    const token = jwtRequestExtract(request);
    return this.contactService.update(parseInt(id), body, token);
  }
}
