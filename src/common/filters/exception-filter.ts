import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { Error as MongooseErrorClass } from 'mongoose';
import { JsonWebTokenError } from '@nestjs/jwt';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (Array.isArray((exceptionResponse as any).message)) {
        message = (exceptionResponse as any).message[0];
      } else {
        message = (exceptionResponse as any).message;
      }
    } else if (
      exception instanceof QueryFailedError ||
      exception instanceof JsonWebTokenError
    ) {
      status = HttpStatus.BAD_REQUEST;
      message = (exception as any).message;
    } else if (exception instanceof MongooseErrorClass) {
      status = HttpStatus.BAD_REQUEST;
      if (exception.name === 'ValidationError') {
        message =
          'Validation error: ' +
          Object.values((exception as any).errors)
            .map((err: any) => err.message)
            .join(', ');
      } else if (exception.name === 'CastError') {
        const value = (exception as any).value;
        const path = (exception as any).path;

        message = `Invalid value '${value}' for field '${path}'. Please provide a valid value.`;
      } else {
        message = exception.message;
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
