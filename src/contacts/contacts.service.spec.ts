import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { Contact } from './contacts.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';

describe('ContactsService', () => {
  let service: ContactsService;
  let fakeUserServices: Partial<UsersService>;
  let fakeContactRepository: Partial<Repository<Contact>>;

  beforeEach(async () => {
    fakeContactRepository = {
      // Mock methods used by the refreshTokenRepository here
      save: jest.fn().mockResolvedValue({}),
      findOne: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      // Continue for all the methods you use from refreshTokenRepository
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
    const accountNumber = '123456242312';
    const bankName = 'BCA';
    const contactName = 'Reza Pratama Nugraha';

    const contactDto = { id: 1, accountNumber, bankName, contactName };

    const payload = {
      sub: 1,
      email: 'test@example.com',
      admin: true,
    };

    fakeUserServices.findOneUser = jest.fn().mockResolvedValue(null);
    await expect(service.create(contactDto, payload)).rejects.toThrow();
  });

  it('should throw an error if saving the contact fails', async () => {
    const accountNumber = '123456242312';
    const bankName = 'BCA';
    const contactName = 'Reza Pratama Nugraha';

    const contactDto = { id: 1, accountNumber, bankName, contactName };
    const payload = {
        sub: 1,
        email: 'test@example.com',
        admin: true,
      };
    
    const user = new User();
    user.id = payload.sub;
    user.email = 'test@example.com';
    user.password = 'password';
    user.contacts = [];
    user.admin = true;
  
    fakeUserServices.findOneUser = jest.fn().mockResolvedValue(user);
    fakeContactRepository.save = jest.fn().mockImplementation(() => { throw new Error(); });
    
    await expect(service.create(contactDto, payload)).rejects.toThrow();
  });
  

  it('should create a contact when input are correct', async () => {
    const accountNumber = '123456242312';
    const bankName = 'BCA';
    const contactName = 'Reza Pratama Nugraha';

    const user = new User();
    user.id = 1;
    user.email = 'test@example.com';
    user.password = 'password';
    user.contacts = [];
    user.admin = true;

    const payload = {
      sub: 1,
      email: 'test@example.com',
      admin: true,
    };

    const contactDto = { id: 1, accountNumber, bankName, contactName };
    const contactResult = { id: 1, accountNumber, bankName, contactName, user };
    fakeContactRepository.save = jest.fn().mockResolvedValue(contactResult);
    fakeUserServices.findOneUser = jest.fn().mockResolvedValue(user);

    const result = await service.create(contactDto, payload);
    expect(result).toEqual(contactResult);
  });
});
