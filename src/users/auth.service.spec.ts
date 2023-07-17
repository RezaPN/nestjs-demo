import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AppService } from '../app.service';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { RefreshToken } from './refreshtoken.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;
  let fakeAppService: Partial<AppService>;
  let fakeUsersService: Partial<UsersService>;
  let fakeRefreshTokenRepository: Partial<Repository<RefreshToken>>;
  let fakeJwtService: Partial<JwtService>;

  beforeEach(async () => {
    //create a fake copy of the users service
    const users: User[] = [];
    fakeAppService = {
      sendMessage: (message: string) => {
        return Promise.resolve(message);
      },
    };

    fakeRefreshTokenRepository = {
      // Mock methods used by the refreshTokenRepository here
      save: jest.fn().mockResolvedValue({}),
      findOne: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      // Continue for all the methods you use from refreshTokenRepository
    };

    fakeJwtService = {
      signAsync: jest.fn().mockReturnValue('mockJwt'),
      verify: jest.fn().mockImplementation((token) => ({ token })),
      decode: jest.fn().mockReturnValue({}),
    };

    fakeUsersService = {
      findUser: (email: string) => {
        const filteredUser = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUser);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AppService,
          useValue: fakeAppService,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: fakeRefreshTokenRepository,
        },
        {
          provide: JwtService,
          useValue: fakeJwtService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a token', async () => {
    const user = await service.signup('rezapratamanu@gmail.com', 'sadasdsad');
    expect(user).not.toEqual('sadasdsad');
    const refresh_token = user.refresh_token
    expect(refresh_token).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('asdf@asdf.com', 'mypassword');

    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws an error if user signin is called with an non-valid unregistered email', async () => {
    await expect(service.signin('asdf@asdf.com', 'asdf')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws if invalid password is provided', async () => {
    await service.signup('asdf@asdf.com', 'mypassword');

    await expect(service.signin('asdf@asdf.com', 'asdf')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('return user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'mypassword');

    const user = service.signin('asdf@asdf.com', 'mypassword');
    expect(user).toBeDefined();
  });

  it('successfully signs out a user and removes their refresh tokens', async () => {
    const token = 'validToken';
    fakeJwtService.decode = jest.fn().mockReturnValue({ sub: '1' });
    fakeRefreshTokenRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });
  
    service.decodeJwt = jest.fn().mockResolvedValue({ sub: '1' }); // add this line to mock decodeJwt
  
    const result = await service.signout(token);
  
    expect(service.decodeJwt).toHaveBeenCalledWith(token); // change this line accordingly
    expect(fakeRefreshTokenRepository.delete).toHaveBeenCalledWith({ userId: 1 });
    expect(result).toEqual({
      status: 200,
      message: 'Sign out successful. You have been logged out of your account.',
      data: null,
    });
  });

  it('successfully decodes a jwt token', async () => {
    const token = 'validToken';
    const payload = { sub: '1' };
    fakeJwtService.verifyAsync = jest.fn().mockResolvedValue(payload);

    const result = await service.decodeJwt(token);

    expect(fakeJwtService.verifyAsync).toHaveBeenCalledWith(token);
    expect(result).toEqual(payload);
  });

  it('throws UnauthorizedException if the token is expired', async () => {
    const token = 'expiredToken';
    fakeJwtService.verifyAsync = jest.fn().mockImplementation(() => {
      throw new jwt.TokenExpiredError('Expired token', new Date());
    });

    await expect(service.decodeJwt(token)).rejects.toThrow(
      new UnauthorizedException('Token is Expired'),
    );
  });
  

  it('throws UnauthorizedException if no refresh tokens are found for the user', async () => {
    const token = 'validToken';
    fakeJwtService.decode = jest.fn().mockReturnValue({ sub: '1' });
    fakeRefreshTokenRepository.delete = jest.fn().mockResolvedValue({ affected: 0 });

    await expect(service.signout(token)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('generates new JWT tokens for valid refresh token', async () => {
    const refreshToken = 'validRefreshToken';
    const payload = {
      isRefreshToken: true,
      sub: '1',
      email: 'test@example.com',
      admin: false,
    };
  
    // Mock the methods
    jest.spyOn(service, 'decodeToken').mockReturnValue(payload);
    jest.spyOn(service, 'validateUserToken').mockResolvedValue(true);
    jest.spyOn(service, 'getTokens').mockResolvedValue({ 
      access_token: 'newAccessToken',
      refresh_token: 'newRefreshToken'
    });
  
    const result = await service.getNewJwtToken(refreshToken);
  
    expect(service.decodeToken).toHaveBeenCalledWith(refreshToken);
    expect(service.validateUserToken).toHaveBeenCalledWith(payload, refreshToken);
    expect(service.getTokens).toHaveBeenCalledWith({
      id: parseInt(payload.sub),
      email: payload.email,
      admin: payload.admin,
    });
    expect(result).toEqual({ 
      access_token: 'newAccessToken',
      refresh_token: 'newRefreshToken'
    });
  });

  
  
  
  // it.each([
  //   [null],
  //   ['stringPayload'],
  //   [{ isRefreshToken: false }]
  // ])('throws UnauthorizedException for invalid token payload', async (invalidPayload) => {
  //   const refreshToken = 'invalidRefreshToken';
  
  //   // Mock the methods
  //   fakeJwtService.decode = jest.fn().mockReturnValue(invalidPayload);
  
  //   await expect(service.getNewJwtToken(refreshToken)).rejects.toThrow(UnauthorizedException);
  //   expect(fakeJwtService.decode).toHaveBeenCalledWith(refreshToken);
  // });
  
  // it('throws UnauthorizedException when validateUserToken fails', async () => {
  //   const refreshToken = 'validRefreshToken';
  //   const payload = {
  //     isRefreshToken: true,
  //     sub: '1',
  //     email: 'test@example.com',
  //     admin: false,
  //   };
  
  //   // Mock the methods
  //   fakeJwtService.decode = jest.fn().mockReturnValue(payload);
  //   service.validateUserToken = jest.fn().mockRejectedValue(new Error());
  
  //   await expect(service.getNewJwtToken(refreshToken)).rejects.toThrow(UnauthorizedException);
  //   expect(fakeJwtService.decode).toHaveBeenCalledWith(refreshToken);
  //   expect(service.validateUserToken).toHaveBeenCalledWith(payload, refreshToken);
  // });
  

});
