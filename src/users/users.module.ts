import { Module, MiddlewareConsumer } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { RefreshToken } from './refreshtoken.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from '../app.service';
import { ProducerService } from '../kafka/producer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          privateKey: await configService.get('AUTH_JWTPRIVATEKEY'),
          publicKey: await configService.get('AUTH_JWTPUBLICKEY'),
          signOptions: { algorithm: 'RS256' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService, AppService, ProducerService],
  exports: [UsersService, AuthService],
})
export class UsersModule {}
