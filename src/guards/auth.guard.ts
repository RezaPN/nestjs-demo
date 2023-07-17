import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseGuard } from './base.guard';
import { Request } from 'express';
import { User } from '../users/users.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class AuthGuard extends BaseGuard {
  handleRequest(request: RequestWithUser): boolean {
    return true;
  }
}
