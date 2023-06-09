import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

import { plainToClass } from 'class-transformer';

interface ClassConstructor {
  new (...args: any[]): {}; //must be class
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassConstructor) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: any) => {
        // Transform DTO data
        const dtoData = plainToClass(this.dto, data.result || data, {
          excludeExtraneousValues: true,
        });

        return {
          codeStatus: data.status || 200,
          message: data.message || 'Success',
          result: dtoData,
        };
      }),
    );
  }
}
