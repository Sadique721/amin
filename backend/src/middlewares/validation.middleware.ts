import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestException } from '@/shared/exceptions';

export const validationMiddleware = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Re-assign parsed inputs to request context safely
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = { ...req.params, ...parsed.params };
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors
          .map((issue) => `${issue.path.slice(1).join('.')}: ${issue.message}`)
          .join(', ');
        next(new BadRequestException(errorMessages));
      } else {
        next(error);
      }
    }
  };
};
