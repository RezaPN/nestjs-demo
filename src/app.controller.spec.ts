import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProducerService } from './kafka/producer.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockProducerService = {}; // <-- Implement a mock for ProducerService here

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: ProducerService, useValue: mockProducerService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('KafkaTest', () => {
    it('should return the result of sendMessage method from AppService', async () => {
      const result = 'Success';
      jest
        .spyOn(appService, 'sendMessage')
        .mockImplementation(() => Promise.resolve(result));

      expect(await appController.KafkaTest()).toBe(result);
    });
  });

  // ...
});
