import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';
import { JwtPayload } from '../auth/types/jwt-payload';

export interface ConnectionParams {
  token?: string;
  [key: string]: unknown;
}
@Injectable()
export class TokenService {
  constructor(private readonly configService: ConfigService) {}

  extractToken(connectionParams: ConnectionParams): string | null {
    return connectionParams?.token || null;
  }

  validateToken(token: string): JwtPayload | null {
    const refreshTokenSecret = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );

    try {
      const decoded = verify(token, refreshTokenSecret!) as JwtPayload;

      if (typeof decoded === 'string') {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
