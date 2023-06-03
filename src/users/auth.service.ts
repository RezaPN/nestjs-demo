import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { scrypt as _scrypt } from 'crypto';

import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './refreshtoken.entity';
import { Repository } from 'typeorm';
import { encrypt, validateEncrypt } from 'src/utlis/encrypt.utils';
import { TokenExpiredError, decode } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

interface Payload {
  id: number;
  email: string;
  admin: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async setRefreshToken(refreshToken: string, userId: number) {
    const currentHashedRefreshToken = await encrypt({ nonHash: refreshToken });

    const newRefreshToken = this.refreshTokenRepository.create({
      token: currentHashedRefreshToken,
      userId: userId,
    });

    await this.refreshTokenRepository.save(newRefreshToken);
  }

  async generateAccessToken(user: Payload) {
    const payload = {
      sub: user.id,
      email: user.email,
      admin: user.admin,
    };

    const signOptions = {
      expiresIn: '300s', //5 menit
    };

    return this.jwtService.signAsync(payload, signOptions);
  }

  async generateRefreshToken(user: Payload) {
    const payload = {
      sub: user.id,
      isRefreshToken: true,
    };
    const signOptions = {
      secret: this.configService.get('SECRET_RT'),
      expiresIn: '24h',
    };

    const refreshToken = await this.jwtService.signAsync(payload, signOptions);

    const existingToken = await this.refreshTokenRepository.findOne({
      where: { userId: user.id },
    });
    if (existingToken) {
      await this.refreshTokenRepository.remove(existingToken);
    }

    this.setRefreshToken(refreshToken, user.id);

    return refreshToken;
  }

  async getTokens(user: Payload) {
    const [access_token, refresh_token] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }

  async validateUserToken(payload: any, refreshToken: string) {
    if (payload === null || typeof payload === 'string') {
      throw new UnauthorizedException('Invalid token');
    }

    const hashedRefreshToken = await this.refreshTokenRepository.findOne({
      where: { userId: parseInt(payload.sub) },
    });

    const validate = validateEncrypt(hashedRefreshToken.token, refreshToken);

    if (!validate) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  async getNewJwtToken(refreshToken: string) {
    const payload = decode(refreshToken);

    if (
      payload === null ||
      typeof payload === 'string' ||
      !payload.isRefreshToken
    ) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.validateUserToken(payload, refreshToken);

    return this.getTokens({ id: parseInt(payload.sub), email: payload.email, admin: payload.admin});
  }

  async decodeJwt(jwt: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(jwt);
      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token is Expired');
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    }
  }

  async signup(email: string, password: string) {
    const users = await this.userService.findUser(email);
    if (users.length) {
      throw new BadRequestException('Email in Use');
    }

    //join the hashed result and the salt together
    const result = await encrypt({ nonHash: password });

    //create a new user and save it
    const user = await this.userService.create(email, result);

    const token = await this.getTokens(user);

    //return the user
    return {
      id: user.id,
      email: user.email,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
    };
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.findUser(email);
    if (!user) {
      throw new NotFoundException('Email not found');
    }
    const validate = validateEncrypt(user.password, password);

    if (!validate) {
      throw new UnauthorizedException('wrong password');
    }

    const token = await this.getTokens(user);

    return {
      id: user.id,
      email: user.email,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
    };
  }

  async signout(token: string) {
    const payload = await this.decodeJwt(token);
    const userId = payload.sub;

    const result = await this.refreshTokenRepository.delete({
      userId: parseInt(userId),
    });

    if (result.affected === 0) {
      throw new NotFoundException('No refresh tokens found for this user');
    }


    return {
      status: 200,
      message: 'Sign out successful. You have been logged out of your account.',
      data: null,
    };
  }

}
