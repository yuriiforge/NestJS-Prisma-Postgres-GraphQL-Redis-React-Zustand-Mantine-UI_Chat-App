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
import { TokenService } from './token/token.service';
import { GqlContext, GraphQLContextArgs, WsContext } from './types/gql-context';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ChatroomModule } from './chatroom/chatroom.module';
import { LiveChatroomModule } from './live-chatroom/live-chatroom.module';
import { TokenModule } from './token/token.module';
import { parse } from 'cookie';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { RedisPubSubModule } from './redis-pubsub/redis-pubsub.module';

@Module({
  imports: [
    RedisPubSubModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    AuthModule,
    UserModule,
    TokenModule,
    GraphQLModule.forRootAsync({
      imports: [ConfigModule, TokenModule],
      inject: [ConfigService, TokenService, 'PUB_SUB'],
      driver: ApolloDriver,
      useFactory: (
        configService: ConfigService,
        tokenService: TokenService,
        pubSub: RedisPubSub,
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
            //  HTTP requests (queries & mutations)
            if (req && res) {
              return { req, res, pubSub };
            }

            //  WebSocket connection (subscriptions)
            const connectionParams = extra?.connectionParams ?? {};

            // extra.request contains the HTTP headers of the WS handshake
            const cookieHeader: string = extra?.request?.headers?.cookie || '';
            const cookies = parse(cookieHeader);
            const token = cookies['access_token'];

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
    ChatroomModule,
    LiveChatroomModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, AppResolver],
})
export class AppModule {}
