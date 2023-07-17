import { Test, TestingModule } from '@nestjs/testing';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppService } from '../app.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let fakeUserRepository: Partial<Repository<User>>;
  let fakeAppService: Partial<AppService>;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    fakeAppService = {
      sendMessage: (message: string) => {
        return Promise.resolve(message);
      },
    };
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    fakeUserRepository = {
      // Mock methods used by the refreshTokenRepository here
      createQueryBuilder: jest.fn(
        () => mockQueryBuilder,
      ) as unknown as Repository<User>['createQueryBuilder'],
      save: jest.fn().mockResolvedValue({}),
      findOne: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),

      // Continue for all the methods you use from refreshTokenRepository
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: fakeUserRepository,
        },
        {
          provide: AppService,
          useValue: fakeAppService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const email = 'test@example.com';
    const password = 'password';

    const user = { id: 1, email, password };
    fakeUserRepository.save = jest.fn().mockResolvedValue(user);

    const result = await service.create(email, password);

    expect(fakeUserRepository.save).toHaveBeenCalled();
    expect(result).toEqual(user);
  });

  it('should find one user with contact', async () => {
    const id = 1;
    const user = {
      id,
      email: 'test@example.com',
      password: 'password',
      contacts: [],
    };

    mockQueryBuilder.getOne.mockResolvedValueOnce(user);

    const result = await service.findOneWithContact(id);

    expect(fakeUserRepository.createQueryBuilder).toBeCalledWith('user');
    expect(mockQueryBuilder.leftJoinAndSelect).toBeCalledWith(
      'user.contacts',
      'contacts',
    );
    expect(mockQueryBuilder.where).toBeCalledWith('user.id = :id', { id });
    expect(mockQueryBuilder.getOne).toBeCalled();
    expect(result).toEqual(user);
  });

  it('should throw an error if no id is provided when finding one user with contact', async () => {
    await expect(service.findOneWithContact(undefined)).rejects.toThrow(NotFoundException);
  });

  it('should update a user', async () => {
    const id = 1;
    const updateData = { email: 'new@example.com' };
    const oldUser = { id, email: 'old@example.com', password: 'password' };
    const newUser = { ...oldUser, ...updateData };
  
    fakeUserRepository.findOne = jest.fn().mockResolvedValue(oldUser);
    fakeUserRepository.save = jest.fn().mockResolvedValue(newUser);
  
    const result = await service.update(id, updateData);
  
    expect(fakeUserRepository.findOne).toBeCalledWith({ where: { id } });
    expect(fakeUserRepository.save).toBeCalledWith(newUser);
    expect(result).toEqual(newUser);
  });
  
  it('should remove a user', async () => {
    const id = 1;
    const user = { id, email: 'test@example.com', password: 'password' };
  
    mockQueryBuilder.getOne.mockResolvedValue(user);
    fakeUserRepository.remove = jest.fn().mockResolvedValue({});
  
    await service.remove(id);
  
    expect(fakeUserRepository.createQueryBuilder).toBeCalledWith('user');
    expect(mockQueryBuilder.leftJoinAndSelect).toBeCalledWith('user.contacts', 'contacts');
    expect(mockQueryBuilder.where).toBeCalledWith('user.id = :id', { id });
    expect(fakeUserRepository.remove).toBeCalledWith(user);
  });
  
  it('should throw an error if no user found when removing a user', async () => {
    const id = 1;
  
    mockQueryBuilder.getOne.mockResolvedValue(null);
  
    await expect(service.remove(id)).rejects.toThrow(NotFoundException);
  
    expect(fakeUserRepository.createQueryBuilder).toBeCalledWith('user');
    expect(mockQueryBuilder.leftJoinAndSelect).toBeCalledWith('user.contacts', 'contacts');
    expect(mockQueryBuilder.where).toBeCalledWith('user.id = :id', { id });
  });
  
  
  it('should find a user by email', async () => {
    const email = 'test@example.com';
    const user = { id: 1, email, password: 'this password for test' };
  
    fakeUserRepository.find = jest.fn().mockResolvedValue([user]);
  
    const result = await service.findUser(email);
  
    expect(fakeUserRepository.find).toBeCalledWith({ where: { email } });
    expect(result).toEqual([user]);
  });
  
  it('should return an empty array if no user is found by email', async () => {
    const email = 'notfound@example.com';
  
    fakeUserRepository.find = jest.fn().mockResolvedValue([]);
  
    const result = await service.findUser(email);
  
    expect(fakeUserRepository.find).toBeCalledWith({ where: { email } });
    expect(result).toEqual([]);
  });
  
});
