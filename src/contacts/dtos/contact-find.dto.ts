import { Expose } from 'class-transformer';

export class ContactFind {
  @Expose()
  id: number;
  @Expose()
  accountNumber: string;
  @Expose()
  bankName: string;
  @Expose()
  contactName: string;
}
