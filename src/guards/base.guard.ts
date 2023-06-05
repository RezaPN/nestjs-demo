import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError, decode } from 'jsonwebtoken';
import { Request } from 'express';
import { User } from 'src/users/users.entity';
import * as fs from 'fs';
import * as path from 'path';

interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export abstract class BaseGuard implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const publicKey = await fs.readFileSync(
      path.resolve(__dirname, '../../public_key.pem'),
      'utf8',
    );

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        publicKey: publicKey,
      });
      request.user = payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('token is expired');
      } else {
        throw new UnauthorizedException('token is invalid');
      }
    }

    return this.handleRequest(request);
  }

  protected abstract handleRequest(
    request: RequestWithUser,
  ): boolean | Promise<boolean>;

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers['authorization'];
    const [type, token] = authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
