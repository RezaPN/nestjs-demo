import { Expose } from 'class-transformer';

export class GeneralResultDto {
  @Expose()
  status: number;

  @Expose()
  message: string;

  @Expose()
  data: any;
}
