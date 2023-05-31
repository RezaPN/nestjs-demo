import { Module, MiddlewareConsumer } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { RefreshToken } from './refreshtoken.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get('SECRET_JWT');
        return {
          secret: secret,
          signOptions: { expiresIn: '900s' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
  exports: [UsersService, AuthService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
    //Notes for learn:
    //Metode forRoutes digunakan untuk menentukan rute atau jalur mana yang akan menggunakan middleware.
    //'*' digunakan untuk menunjukkan bahwa middleware akan diterapkan untuk semua rute atau jalur yang ada dalam modul ini.
  }
}
