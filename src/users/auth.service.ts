import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';

import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';

const scrypt = promisify(_scrypt); //promise version

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    // private jwtService: JwtService,
  ) {}

  async signup(email: string, password: string) {
    const users = await this.userService.find(email);
    if (users.length) {
      throw new BadRequestException('Email in Use');
    }

    //hash the users password
    //generate a salt
    const salt = randomBytes(8).toString('hex'); //1bytes equal 2 char

    //hash the salt and the password together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    //join the hashed result and the salt together
    const result = salt + '.' + hash.toString('hex');

    //create a new user and save it
    const user = await this.userService.create(email, result);

    //return the user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email);
    if (!user) {
      throw new NotFoundException('Email not found');
    }

    //salt.hash

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // const payload = { sub: user.id, email: user.email };
    if (storedHash !== hash.toString('hex')) {
      throw new UnauthorizedException('wrong password');
    }

    //testing jwt, nanti kalo sukses balikin akses token aja
    return user;
    // return {
    //   id: user.id,
    //   email: user.email,
    //   access_token: await this.jwtService.signAsync(payload),
    // };
  }
}
