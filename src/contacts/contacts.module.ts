import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './contacts.entity'
import { ContactsService } from './contacts.service';

@Module({
    imports: [TypeOrmModule.forFeature([Contact])], 
    controllers: [ContactsController],
    providers: [ContactsService],
    exports: [ContactsService]
})
export class ContactsModule {}