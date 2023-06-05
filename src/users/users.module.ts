import { Module, MiddlewareConsumer } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { RefreshToken } from './refreshtoken.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // const secret = configService.get('SECRET_JWT');
        return {
          privateKey: fs.readFileSync(
            path.resolve(__dirname, '../../private_key.pem'),
            'utf8',
          ),
          publicKey: fs.readFileSync(path.resolve(__dirname, '../../public_key.pem'), 'utf8'),
          signOptions: { algorithm: 'RS256' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
  exports: [UsersService, AuthService],
})
export class UsersModule {}
