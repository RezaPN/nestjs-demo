import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './users.entity';
import { CanActivate, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

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
      message: 'Sign out successful. You have been logged out of your account.',
      data: null,
    };

    const result = await controller.signOut('fakeToken');
    expect(result).toEqual(mockResult);
  });

  describe('createUser', () => {
    it('creates a new user and returns a success message', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@test.com';
      dto.password = 'testPassword';

      const userResult = {
        id: 1,
        email: dto.email,
        // Include other user properties as necessary...
      };

      fakeAuthService.signup = jest.fn().mockResolvedValue(userResult);

      const result = await controller.createUser(dto);
      expect(result).toEqual({
        message: 'Pendaftaran Berhasil',
        result: userResult,
      });
      expect(fakeAuthService.signup).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
    });
  });

  describe('signin', () => {
    it('authenticates a user and returns a success message', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@test.com';
      dto.password = 'testPassword';

      const signinResult = {
        id: 1,
        email: dto.email,
        access_token: 'fake_access_token',
        refresh_token: 'fake_refresh_token',
      };

      fakeAuthService.signin = jest.fn().mockResolvedValue(signinResult);

      const result = await controller.signin(dto);
      expect(result).toEqual({
        message: 'Login Berhasil',
        result: signinResult,
      });
      expect(fakeAuthService.signin).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
    });
  });

  describe('findUser', () => {
    it('finds a user by id and returns a success message', async () => {
      const userId = '1';
      const userResult = {
        id: parseInt(userId),
        email: 'test@test.com',
      };

      fakeUsersService.findOneUser = jest.fn().mockResolvedValue(userResult);

      const result = await controller.findUser(userId);
      expect(result).toEqual({
        message: 'Pencarian berhasil!',
        result: userResult,
      });
      expect(fakeUsersService.findOneUser).toHaveBeenCalledWith(
        parseInt(userId),
      );
    });

    it('throws an error when user is not found', async () => {
      const userId = '1';

      fakeUsersService.findOneUser = jest.fn().mockResolvedValue(null);

      await expect(controller.findUser(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(fakeUsersService.findOneUser).toHaveBeenCalledWith(
        parseInt(userId),
      );
    });
  });

  describe('findAllUsers', () => {
    it('finds all users by email and returns them', async () => {
      const userEmail = 'test@test.com';
      const usersResult = [];

      fakeUsersService.findUser = jest.fn().mockResolvedValue(usersResult);

      const result = await controller.findAllUsers(userEmail);
      expect(result).toEqual(usersResult);
      expect(fakeUsersService.findUser).toHaveBeenCalledWith(userEmail);
    });
  });

  describe('removeUser', () => {
    it('removes a user by id', async () => {
      const userId = '1';
      const mockResult = {
        id: 1,
        email: 'fake-email',
      };
      const removeResult = {message: 'User berhasil diremove', result: mockResult}

      fakeUsersService.remove = jest.fn().mockResolvedValue(mockResult);

      const result = await controller.removeUser(userId);
      expect(result).toEqual(removeResult);
      expect(fakeUsersService.remove).toHaveBeenCalledWith(parseInt(userId));
    });
  });

  describe('updateUser', () => {
    it('updates a user by id and returns the updated user', async () => {
      const userId = '1';
      const updateData = new UpdateUserDto;
      updateData.email = 'rezapn@gmail.com'
      const updatedUserResult = {
        id: parseInt(userId),
        // Include other user properties as necessary...
        ...updateData
      };

      fakeUsersService.update = jest.fn().mockResolvedValue(updatedUserResult);

      const result = await controller.updateUser(userId, updateData);
      expect(result).toEqual(updatedUserResult);
      expect(fakeUsersService.update).toHaveBeenCalledWith(parseInt(userId), updateData);
    });
  });
});
