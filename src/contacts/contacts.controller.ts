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
  HttpCode
} from '@nestjs/common';
import { CreateContactDto } from './dtos/create-contact.dto';
import { ContactsService } from './contacts.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { ContactDto } from './dtos/contact.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { Request } from 'express';
import { ContactFind } from './dtos/contact-find.dto';
import { updateContactDto } from './dtos/update-contact.dto';
import { jwtRequestExtract } from 'src/utlis/jwt.utils';
import { GeneralResultDto } from './dtos/general-result.dto';
import {
  StatusCodes
} from 'http-status-codes';

import { Logger } from '@nestjs/common';

@Controller('contacts')
@UseGuards(AuthGuard)
export class ContactsController {
  private logger = new Logger('TasksController');
  constructor(private contactService: ContactsService) {}

  @Post()
  @HttpCode(StatusCodes.OK)
  @Serialize(ContactDto)
  async createContact(@Body() body: CreateContactDto, @Req() request: Request) {
    const contact = await this.contactService.create(body,  jwtRequestExtract(request))
    return {message: 'Pendaftaran Contact Berhasil', result: contact};
  }

  @Delete('/:id')
  @Serialize(GeneralResultDto)
  async deleteContact(@Param('id') id: string,  @Req() request: Request) {
    const result = await this.contactService.deleteContactById(parseInt(id), jwtRequestExtract(request))
    return {message: `Contact berhasil dihapus`, data: result};
  }

  @Get()
  @Serialize(ContactFind)
  async findOrFindAllContacts(
    @Req() request: Request,
  ) {

    if (Object.keys(request.query).length > 0) {
      return this.contactService.findContact(request.query,  jwtRequestExtract(request));
    } else {
      return this.contactService.findAllContact(jwtRequestExtract(request));
    }
  }

  @Put('/:id')
  @Serialize(ContactFind)
  async updateContact(
    @Param('id') id: string,
    @Body() body: updateContactDto,
    @Req() request: Request,
  ) {
    return this.contactService.update(parseInt(id), body, jwtRequestExtract(request));
  }
}
