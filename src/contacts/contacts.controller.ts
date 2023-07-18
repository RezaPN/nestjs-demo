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
  HttpCode,
} from '@nestjs/common';
import { CreateContactDto } from './dtos/create-contact.dto';
import { ContactsService } from './contacts.service';
import { AuthGuard } from '../guards/auth.guard';
import { ContactDto } from './dtos/contact.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { Request } from 'express';
import { ContactFind } from './dtos/contact-find.dto';
import { updateContactDto } from './dtos/update-contact.dto';
import { GeneralResultDto } from './dtos/general-result.dto';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '@nestjs/common';
import { Payload } from '../type/payload.type';

interface RequestWithUser extends Request {
  user: Payload;
}

@Controller('contacts')
@UseGuards(AuthGuard)
export class ContactsController {
  private logger = new Logger('TasksController');
  constructor(private contactService: ContactsService) {}

  @Post()
  @HttpCode(StatusCodes.OK)
  @Serialize(ContactDto)
  async createContact(@Body() body: CreateContactDto, @Req() request: RequestWithUser) {
    this.logger.log(body);
    const contact = await this.contactService.create(body, request.user);
    return { message: 'Pendaftaran Contact Berhasil', result: contact };
  }

  @Delete('/:id')
  @Serialize(GeneralResultDto)
  async deleteContact(@Param('id') id: string, @Req() request: RequestWithUser) {
    const result = await this.contactService.deleteContactById(
      parseInt(id),
      request.user,
    );
    return { message: `Contact berhasil dihapus`, data: result };
  }

  @Get()
  @Serialize(ContactFind)
  async findOrFindAllContacts(@Req() request: RequestWithUser) {
    return this.contactService.findContact(request.user, request.query);
  }

  @Put('/:id')
  @Serialize(ContactFind)
  async updateContact(
    @Param('id') id: string,
    @Body() body: updateContactDto,
    @Req() request: RequestWithUser,
  ) {
    return this.contactService.update(
      parseInt(id),
      body,
      request.user,
    );
  }
}
