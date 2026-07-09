import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}
