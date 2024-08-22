import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
@Injectable()
export class UserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data) => {
        if (typeof data === 'string') {
          return { message: data };
        } else if (Array.isArray(data)) {
          return data.map((item) => {
            if (item && typeof item === 'object') {
              delete item.password;
              delete item.refreshToken;
            }
            return item;
          });
        } else {
          delete data.password;
          delete data.refreshToken;
          return data;
        }
      }),
    );
  }
}
