import { Request, Response } from 'express';
import { IncomingMessage } from 'http';
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
  request?: IncomingMessage; // handshake info to access headers/cookies
}

export type GqlContext = HttpContext | WsContext;

export interface GraphQLExtra {
  connectionParams?: Record<string, any>;
  request?: IncomingMessage; // <-- add this
}

export interface GraphQLContextArgs {
  req?: Request;
  res?: Response;
  extra?: GraphQLExtra;
}
