import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from './types/jwt-payload';

@Injectable()
export class GraphqlAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext<{ req: Request }>();
    const request = req;
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });

      request['user'] = payload;
    } catch (error) {
      console.log('err', error);
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromCookie(req: Request): string | undefined {
    return (req.cookies?.access_token as string) ?? undefined;
  }
}
