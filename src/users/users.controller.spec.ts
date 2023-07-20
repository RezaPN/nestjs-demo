import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './users.entity';
import { CanActivate, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

class MockAuthGuard implements CanActivate {
  canActivate() {
    return true;
  }
}

class MockJwtService {
  // methods and properties that JwtService has
}

class MockConfigService {
  // methods and properties that ConfigService has
}

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOneUser: (id: number) => {
        return Promise.resolve({
          id,
          email: 'rezapratamanu@gmail.com',
          password: 'randomPassword@',
        } as User);
      },
    };
    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({
          id: 9,
          email: email,
          access_token: 'fake_access_token',
          refresh_token: 'fake_refersh_token',
        });
      },
      getNewJwtToken: (refreshToken: string) => {
        return Promise.resolve({
          access_token: 'newAccessToken',
          refresh_token: 'newRefreshToken',
        });
      },
      signout: (token: string) => {
        return Promise.resolve({
          status: 200,
          message:
            'Sign out successful. You have been logged out of your account.',
          data: null,
        });
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        {
          provide: AuthGuard,
          useClass: MockAuthGuard,
        },
        {
          provide: JwtService,
          useClass: MockJwtService,
        },
        {
          provide: ConfigService,
          useClass: MockConfigService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    const mockGuard = new MockAuthGuard();

    jest.spyOn(mockGuard, 'canActivate').mockReturnValueOnce(true);
    expect(mockGuard.canActivate()).toBe(true);

    expect(controller).toBeDefined();
  });

  it('refresh token return new access_token and refresh_token', async () => {
    const mockReq = {
      headers: {
        authorization: 'Bearer fakeRefreshToken',
      },
    };
    const newJwtToken = {
      access_token: 'newAccessToken',
      refresh_token: 'newRefreshToken',
    };

    const result = await controller.refreshToken(mockReq as any);
    expect(result).toEqual(newJwtToken);
  });

  it('signout success using token', async () => {

    const mockResult = {
        status: 200,
        message:
          'Sign out successful. You have been logged out of your account.',
        data: null,
      }

    const result = await controller.signOut('fakeToken');
    expect(result).toEqual(mockResult);
  });

  //   it('findUser returns a single user with the given id', async () => {
  //     const user = await controller.findUser('1');
  //     expect(user).toBeDefined();
  //   });

  //   it('findUser throws an error if user with given id is not found', async () => {
  //     fakeUsersService.findOne = () => null; //overwrite existing fake service
  //     expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  //   });

  //   it('signIn updates session object and returns user', async () => {
  //     const session = {userId: -10};
  //     const user = await controller.signin(
  //       { email: 'rezapratamanu@gmail.com', password: 'mockPassword' },
  //     );

  //     expect(user.id).toEqual(1);
  //     expect(session.userId).toEqual(1);
  //   });
});
