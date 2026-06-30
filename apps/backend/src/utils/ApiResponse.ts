import { Response } from 'express';
import { ApiResponse as ApiResponseInterface } from '@proctoriq/shared';

export class ApiResponse {
  static send<T>(res: Response, statusCode: number, success: boolean, message: string, data?: T) {
    const responseBody: ApiResponseInterface<T> = {
      success,
      message,
      ...(data !== undefined && { data }),
    };
    return res.status(statusCode).json(responseBody);
  }

  static success<T>(res: Response, message: string = 'Success', data?: T, statusCode: number = 200) {
    return this.send(res, statusCode, true, message, data);
  }

  static error(res: Response, message: string = 'An error occurred', statusCode: number = 500, data?: any) {
    return this.send(res, statusCode, false, message, data);
  }
}
