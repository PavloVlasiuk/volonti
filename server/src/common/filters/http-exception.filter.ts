import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    console.error('Exception caught by filter:', exception);

    const message =
      exception instanceof HttpException
        ? (() => {
            const res = exception.getResponse();
            if (typeof res === 'string') return res;
            if (typeof res === 'object' && res !== null && 'message' in res) {
              return (res as { message: string | string[] }).message;
            }
            return 'Internal server error';
          })()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status] ?? 'Error',
    });
  }
}
