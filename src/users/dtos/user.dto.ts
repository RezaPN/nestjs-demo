import { Expose } from 'class-transformer'

export class UserDTO {
    // @Expose()
    // id: number;
    
    // @Expose()
    // email: string;

    @Expose()
    access_token: string;

    @Expose()
    refresh_token: string;

    // @Expose()
    // status: number;
  
    // @Expose()
    // message: string;
  
    @Expose()
    result: any;
}