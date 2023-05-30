import { ConfigService } from '@nestjs/config';

export class AuthConstants {
  private configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  get jwtSecret(): string {
    return this.configService.get<string>('SECRET_JWT');
  }
}
