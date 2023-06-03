import { Expose } from 'class-transformer';

export class GeneralResultDto {
  @Expose()
  data: any;
}
