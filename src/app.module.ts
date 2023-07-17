import { Module, ValidationPipe } from '@nestjs/common';
import { ContactsModule } from './contacts/contacts.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from './config/typeorm.config';
import { APP_PIPE } from '@nestjs/core';
import { KafkaModule } from './kafka/kafka.module';
import { TestConsumer } from './test.consumer';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    ContactsModule,
    UsersModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    KafkaModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
    TestConsumer,
    AppService,
  ],
  exports: [AppService]
})
export class AppModule {}
