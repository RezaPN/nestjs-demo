import { Injectable } from '@nestjs/common';
import { ProducerService } from './kafka/producer.service';

@Injectable()
export class AppService {
  constructor(private readonly producerService: ProducerService) {}

  async sendMessage(message: string) {
    await this.producerService.produce({
      topic: 'registration-event',
      messages: [
        {
          value: message,
        },
      ],
    });
    return 'Success';
  }
}
