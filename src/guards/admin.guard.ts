import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseGuard } from './base.guard';
import { Request } from 'express';
import { User } from 'src/users/users.entity';

interface RequestWithUser extends Request {
  user: User; 
}

@Injectable()
export class AdminGuard extends BaseGuard {
  handleRequest(request: RequestWithUser): boolean {
    if (!request.user.admin) {
      throw new UnauthorizedException('Not enough privileges');
    }
    return true;
  }
}