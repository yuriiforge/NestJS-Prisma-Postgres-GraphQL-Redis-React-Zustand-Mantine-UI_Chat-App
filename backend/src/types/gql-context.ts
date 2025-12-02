import { Request, Response } from 'express';
import { JwtPayload } from '../auth/types/jwt-payload';
import { RedisPubSub } from 'graphql-redis-subscriptions';

export interface HttpContext {
  req: Request;
  res: Response;
  pubSub: RedisPubSub;
  user?: JwtPayload;
}

export interface WsContext {
  pubSub: RedisPubSub;
  user: JwtPayload;
  connectionParams: Record<string, unknown>;
}

export type GqlContext = HttpContext | WsContext;

export interface GraphQLExtra {
  connectionParams?: Record<string, any>;
}

export interface GraphQLContextArgs {
  req?: Request;
  res?: Response;
  extra?: GraphQLExtra;
}
