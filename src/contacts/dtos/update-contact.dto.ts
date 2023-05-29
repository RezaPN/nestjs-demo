import { IsString,  IsOptional } from 'class-validator';

export class updateContactDto {
  @IsString()
  @IsOptional()
  accountNumber: string;

  @IsString()
  @IsOptional()
  bankName: string;

  @IsString()
  @IsOptional()
  contactName: string;
}
