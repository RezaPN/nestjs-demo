import { Expose, Transform } from 'class-transformer';
import { User } from '../../users/users.entity';

export class ContactDto {
  @Expose()
  id: number;
  @Expose()
  accountNumber: string;
  @Expose()
  bankName: string;
  @Expose()
  contactName: string;
  @Expose()
  contact_id: string;

  @Transform(({obj}) => obj.user.id ) //ambil entity contact, cek properti user, dan liat user idnya dan assign di user id
  @Expose()
  userId: number;
}
