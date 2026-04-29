import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, Role } from '../types';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function auth(roles: Role[] = []) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'No token' });
      return;
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      if (roles.length && !roles.includes(decoded.role)) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
}