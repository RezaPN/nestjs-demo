import { Module, MiddlewareConsumer } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { AuthService } from './auth.service';
import { jwtConstants } from './auth.contants';
import { JwtModule } from '@nestjs/jwt';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { ContactsService } from '../contacts/contacts.service';
import { ContactsModule } from '../contacts/contacts.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    ContactsModule
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    // ContactsService,
  ],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer){
    consumer.apply(CurrentUserMiddleware).forRoutes('*') 
    //Notes for learn: 
    //Metode forRoutes digunakan untuk menentukan rute atau jalur mana yang akan menggunakan middleware. 
    //'*' digunakan untuk menunjukkan bahwa middleware akan diterapkan untuk semua rute atau jalur yang ada dalam modul ini.
  }
}
