import { Expose } from 'class-transformer'

export class findUserDto {
    @Expose()
    id: number;
    
    @Expose()
    email: string;
  
    @Expose()
    message: string;
  
    @Expose()
    result: any;
}