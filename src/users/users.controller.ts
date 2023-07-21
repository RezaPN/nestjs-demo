import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  NotFoundException,
  UseGuards,
  Req,
  HttpCode,
  Headers,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDTO } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { jwtRequestExtract } from '../utlis/jwt.utils';
import { Request } from 'express';
import { findUserDto } from './dtos/find-user.dto';

@Controller('auth')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Serialize(UserDTO)
  @Post('/refreshToken')
  async refreshToken(@Req() request: Request) {
    const result = await this.authService.getNewJwtToken(jwtRequestExtract(request));
    return result
  }

  @Post('/signout')
  @HttpCode(200)
  signOut(@Headers('Authorization') token: string) {
   
    return this.authService.signout(token && token.split(' ')[1]);
  }

  @Serialize(UserDTO)
  @Post('/signup')
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.authService.signup(body.email, body.password);
    return {message: 'Pendaftaran Berhasil', result: user};
  }

  @Serialize(UserDTO)
  @Post('/signin')
  async signin(@Body() body: CreateUserDto) {
    const user = await this.authService.signin(body.email, body.password);

    return {message: 'Login Berhasil', result: user};
  }

  @Serialize(findUserDto)
  @Get('/:id')
  @UseGuards(AuthGuard)
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOneUser(parseInt(id));

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return {message: 'Pencarian berhasil!', result: user};;
  }

  @Serialize(findUserDto)
  @Get()
  @UseGuards(AuthGuard)
  findAllUsers(@Query('email') email: string) {
    return this.usersService.findUser(email);
  }

  @Serialize(findUserDto)
  @Delete('/:id')
  @UseGuards(AdminGuard)
  async removeUser(@Param('id') id: string) {
    const result = await this.usersService.remove(parseInt(id));
    return {message: 'User berhasil diremove', result: result};
  }

  @Patch('/:id')
  @UseGuards(AdminGuard)
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }
}
