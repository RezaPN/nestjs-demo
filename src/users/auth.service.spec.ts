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
});
