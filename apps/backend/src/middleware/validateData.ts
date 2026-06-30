import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodTypeAny } from 'zod';
import { ApiResponse } from '../utils/ApiResponse';

export const validateData = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = (error as any).errors.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return ApiResponse.error(res, 'Validation failed', 400, errorMessages);
      }
      return ApiResponse.error(res, 'Internal Server Error', 500);
    }
  };
};
