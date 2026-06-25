import { Request, Response, NextFunction } from 'express';

export const teacherMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Teacher access denied' });
  }
};
