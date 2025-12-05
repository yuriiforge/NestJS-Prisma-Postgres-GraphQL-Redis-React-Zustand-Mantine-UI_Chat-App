import { Module, Global, Logger } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

const logger = new Logger('RedisPubSubModule');

@Global()
@Module({
  providers: [
    {
      provide: 'PUB_SUB',
      useFactory: async () => {
        logger.log('Initializing RedisPubSub with explicit Redis clients...');

        const redisOptions = {
          host: process.env.REDIS_HOST || 'redis',
          port: 6379,
          family: 4,
          connectTimeout: 10000,
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => {
            logger.warn(`Redis retry attempt ${times}`);
            return Math.min(times * 100, 2000);
          },
          showFriendlyErrorStack: true,
        };

        logger.log(`Creating Redis clients for redis:6379...`);

        const publisher = new Redis(redisOptions);
        const subscriber = new Redis(redisOptions);

        publisher.on('connect', () => {
          logger.log('✅ Redis Publisher connected');
        });

        publisher.on('error', (err) => {
          logger.error(`❌ Redis Publisher error: ${err.message}`);
          logger.error(
            `Error connecting to: ${publisher.options.host}:${publisher.options.port}`,
          );
        });

        subscriber.on('connect', () => {
          logger.log('✅ Redis Subscriber connected');
        });

        subscriber.on('error', (err) => {
          logger.error(`❌ Redis Subscriber error: ${err.message}`);
          logger.error(
            `Error connecting to: ${subscriber.options.host}:${subscriber.options.port}`,
          );
        });

        logger.log('Waiting for Redis connections...');

        try {
          await Promise.all([
            new Promise<void>((resolve) => {
              if (publisher.status === 'ready') {
                resolve();
              } else {
                publisher.once('ready', resolve);
              }
            }),
            new Promise<void>((resolve) => {
              if (subscriber.status === 'ready') {
                resolve();
              } else {
                subscriber.once('ready', resolve);
              }
            }),
          ]);

          logger.log('✅ Both Redis clients connected successfully');
        } catch (error) {
          logger.error(`Failed to connect Redis clients`);
          throw error;
        }

        logger.log('Creating RedisPubSub instance...');
        const pubSub = new RedisPubSub({
          publisher,
          subscriber,
          connection: {
            host: redisOptions.host,
            port: redisOptions.port,
            retryStrategy: () => 2000,
          },
        });

        logger.log('✅ RedisPubSub initialized successfully');
        return pubSub;
      },
    },
  ],
  exports: ['PUB_SUB'],
})
export class RedisPubSubModule {}
