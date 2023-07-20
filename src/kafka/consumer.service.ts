import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, ProducerRecord, Consumer, ConsumerSubscribeTopics, ConsumerRunConfig} from 'kafkajs';

@Injectable()
export class ConsumerService implements OnApplicationShutdown{

  constructor(private configService: ConfigService) { }

  private readonly kafka = new Kafka({
    brokers: [`${this.configService.get<string>('KAFKA_BROKER')}`],
  });

  private readonly consumers: Consumer[] = [];

  async consume(topic: ConsumerSubscribeTopics, config: ConsumerRunConfig){
    const consumer = this.kafka.consumer({groupId: 'nestjs-kafka'})
    await consumer.connect();
    await consumer.subscribe(topic);
    await consumer.run(config);
    this.consumers.push(consumer)
  }

  async onApplicationShutdown() {
      for (const consumer of this.consumers){
        await consumer.disconnect();
      }
  }
}
