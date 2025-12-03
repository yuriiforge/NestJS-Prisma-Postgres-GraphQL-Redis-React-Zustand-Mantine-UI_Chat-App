import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AppResolver } from './app.resolver';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { TokenService } from './token/token.service';
import { GqlContext, GraphQLContextArgs, WsContext } from './types/gql-context';
import { ServeStaticModule } from '@nestjs/serve-static';

const pubSub = new RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    retryStrategy: (times) => {
      return Math.min(times * 50, 1000);
    },
  },
});

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    AuthModule,
    UserModule,
    GraphQLModule.forRootAsync({
      imports: [ConfigModule, AppModule],
      inject: [ConfigService],
      driver: ApolloDriver,
      useFactory: (
        configService: ConfigService,
        tokenService: TokenService,
      ) => {
        return {
          installSubscriptionHandlers: true,
          playground: true,
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          subscriptions: {
            'graphql-ws': {
              path: '/graphql',
            },
          },

          context: ({ req, res, extra }: GraphQLContextArgs): GqlContext => {
            //HTTP request (queries & mutations)
            if (req && res) {
              return { req, res, pubSub };
            }

            // WebSocket connection (subscriptions)
            const connectionParams = extra?.connectionParams ?? {};

            const token = tokenService.extractToken(connectionParams);

            if (!token) {
              throw new Error(
                'Token must be provided for WebSocket connection',
              );
            }

            const user = tokenService.validateToken(token);

            if (!user) {
              throw new Error('Invalid or expired token');
            }

            const wsContext: WsContext = {
              pubSub,
              user,
              connectionParams,
            };

            return wsContext;
          },
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, AppResolver, TokenService],
})
export class AppModule {}
