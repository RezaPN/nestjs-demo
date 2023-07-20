import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { Contact } from './contacts.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ContactsService', () => {
  let service: ContactsService;
  let fakeUserServices: Partial<UsersService>;
  let fakeContactRepository: Partial<Repository<Contact>>;
  let mockQueryBuilder: any;
  const contactIdMock = 29;
  const attrsMock = {
    accountNumber: '2312114131',
    bankName: 'BCA',
    contactName: 'Mirana',
  };
  const payloadMock = {
    sub: 9,
    email: 'jamasukawaii@gmail.com',
    admin: false,
    iat: 1689822834,
    exp: 1689823134,
  };

  const mockPayload = {
    sub: 9,
    email: 'jamasukawaii@gmail.com',
    admin: false,
    iat: 1689819860,
    exp: 1689820160,
  };

  const accountNumber = '123456242312';
  const bankName = 'BCA';
  const contactName = 'Reza Pratama Nugraha';

  const contactDto = { id: 1, accountNumber, bankName, contactName };

  const mockDataUser = [
    {
      id: 29,
      accountNumber: '95487350893255',
      bankName: 'BCA',
      contactName: 'Febri',
      user: {
        id: 1,
        email: 'test@example.com',
        password: 'password',
        admin: true,
        contacts: [],
        logInsert: () => {}, // Fungsi kosong
        logUpdate: () => {}, // Fungsi kosong
        logRemove: () => {}, // Fungsi kosong
      },
      logInsert: () => {}, // Fungsi kosong
      logUpdate: () => {}, // Fungsi kosong
      logRemove: () => {}, // Fungsi kosong
    },
  ];

  beforeEach(async () => {
    fakeContactRepository = {
      // Mock methods used by the refreshTokenRepository here
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
      save: jest.fn().mockResolvedValue({}),
      findOne: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      // Continue for all the methods you use from refreshTokenRepository
    };

    mockQueryBuilder = {
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    fakeUserServices = {
      findOneUser: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: getRepositoryToken(Contact),
          useValue: fakeContactRepository,
        },
        {
          provide: UsersService,
          useValue: fakeUserServices,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error if no user is found', async () => {
    fakeUserServices.findOneUser = jest.fn().mockResolvedValue(null);
    await expect(service.create(contactDto, mockPayload)).rejects.toThrow();
  });

  it('should throw an error if saving the contact fails', async () => {
    const user = new User();
    user.id = mockPayload.sub;
    user.email = 'test@example.com';
    user.password = 'password';
    user.contacts = [];
    user.admin = true;

    fakeUserServices.findOneUser = jest.fn().mockResolvedValue(user);
    fakeContactRepository.save = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    await expect(service.create(contactDto, mockPayload)).rejects.toThrow();
  });

  it('should create a contact when input are correct', async () => {
    const user = new User();
    user.id = 1;
    user.email = 'test@example.com';
    user.password = 'password';
    user.contacts = [];
    user.admin = true;

    const contactResult = { id: 1, accountNumber, bankName, contactName, user };
    fakeContactRepository.save = jest.fn().mockResolvedValue(contactResult);
    fakeUserServices.findOneUser = jest.fn().mockResolvedValue(user);

    const result = await service.create(contactDto, mockPayload);
    expect(result).toEqual(contactResult);
  });

  it('should find all contact when input empty', async () => {
    const mockResult = [
      {
        id: 27,
        accountNumber: '95487350893255',
        bankName: 'BTPN',
        contactName: 'Ninas',
      },
      {
        id: 29,
        accountNumber: '95487350893255',
        bankName: 'BCA',
        contactName: 'Febri',
      },
    ];

    fakeContactRepository.find = jest.fn().mockResolvedValue(mockResult);
    const result = await service.findContact(mockPayload, {});

    expect(result).toEqual(mockResult);
  });

  it('should return an array if one valid query inputted', async () => {
    const queryMock = { bankName: 'BCA' };
    const mockResult = [
      {
        id: 29,
        accountNumber: '95487350893255',
        bankName: 'BCA',
        contactName: 'Febri',
      },
      {
        id: 36,
        accountNumber: '95487350893255',
        bankName: 'BCA',
        contactName: 'Lewis',
      },
    ];

    fakeContactRepository.find = jest.fn().mockResolvedValue(mockResult);
    const result = await service.findContact(mockPayload, queryMock);

    expect(result).toEqual(mockResult);
  });

  it('should return an array if two valid query inputted', async () => {
    const queryMock = { bankName: 'BCA', contactName: 'Febri' };
    const mockResult = [
      {
        id: 29,
        accountNumber: '95487350893255',
        bankName: 'BCA',
        contactName: 'Febri',
      },
    ];

    fakeContactRepository.find = jest.fn().mockResolvedValue(mockResult);
    const result = await service.findContact(mockPayload, queryMock);

    expect(result).toEqual(mockResult);
  });

  it('should return an BadRequestException if five query inputted', async () => {
    const queryMock = {
      bankName: 'BCA',
      contactName: 'Febri',
      a: 'a',
      b: 'b',
      c: 'c',
      d: 'd',
    };

    await expect(service.findContact(mockPayload, queryMock)).rejects.toThrow(
      new BadRequestException('Too many query parameters'),
    );
  });

  it('should ignore disallowed query parameters', async () => {
    const queryMock = { bankName: 'BCA', invalidParameter: 'ignored' };

    const mockResult = [
      {
        id: 29,
        accountNumber: '95487350893255',
        bankName: 'BCA',
        contactName: 'Febri',
      },
      {
        id: 36,
        accountNumber: '95487350893255',
        bankName: 'BCA',
        contactName: 'Lewis',
      },
    ];

    fakeContactRepository.find = jest.fn().mockResolvedValue(mockResult);
    const result = await service.findContact(mockPayload, queryMock);

    expect(result).toEqual(mockResult);
  });

  it('should update contact when inputs are valid', async () => {
    const mockResult = [
      {
        id: 29,
        accountNumber: '2312114131',
        bankName: 'BCA',
        contactName: 'Mirana',
      },
    ];

    jest
      .spyOn(service, 'findContact')
      .mockReturnValue(Promise.resolve(mockDataUser));

    fakeContactRepository.save = jest.fn().mockResolvedValue(mockResult);
    const result = await service.update(contactIdMock, attrsMock, payloadMock);

    expect(result).toEqual(mockResult);
  });

  it('should return notFoundException when user not found', async () => {
    jest.spyOn(service, 'findContact').mockReturnValue(Promise.resolve([]));

    await expect(
      service.update(contactIdMock, attrsMock, payloadMock),
    ).rejects.toThrow(new NotFoundException('users not found'));
  });

  it('should delete contact successfully', async () => {
    const contactIdMock = 1;

    const result = await service.deleteContactById(contactIdMock, mockPayload);

    expect(result).toEqual({ contact_id: contactIdMock });
  });

  it('should throw NotFoundException when no contact is found to delete', async () => {
    const contactIdMock = 1;

    mockQueryBuilder.execute.mockResolvedValueOnce({ affected: 0 });

    await expect(
      service.deleteContactById(contactIdMock, mockPayload),
    ).rejects.toThrow(new NotFoundException('Contact not found'));
  });
});
