import { Resolver } from '@nestjs/graphql';
import { LiveChatroomService } from './live-chatroom.service';
import { Subscription, Args, Context, Mutation } from '@nestjs/graphql';
import { Request } from 'express';
import {
  BadRequestException,
  Inject,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/user.type';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { GraphQLErrorFilter } from '../filters/custom-exception.filter';
import { GraphqlAuthGuard } from '../auth/graphql-auth.guard';
import { LiveUsersInChatroomPayload } from './live-chatroom-payloads';

@Resolver()
export class LiveChatroomResolver {
  constructor(
    private readonly liveChatroomService: LiveChatroomService,
    private readonly userService: UserService,
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
  ) {}

  @Subscription(() => [User], {
    nullable: true,
    resolve: (value: LiveUsersInChatroomPayload) => value.liveUsers,
    filter: (
      payload: LiveUsersInChatroomPayload,
      variables: { chatroomId: number },
    ) => {
      return payload.chatroomId === variables.chatroomId;
    },
  })
  liveUsersInChatroom(@Args('chatroomId') chatroomId: number) {
    return this.pubSub.asyncIterator(`liveUsersInChatroom.${chatroomId}`);
  }

  @UseFilters(GraphQLErrorFilter)
  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Boolean)
  async enterChatroom(
    @Args('chatroomId') chatroomId: number,
    @Context() context: { req: Request },
  ) {
    const userId = context?.req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user = await this.userService.getUser(parseInt(userId));

    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.liveChatroomService.addLiveUserToChatroom(chatroomId, user);
    const liveUsers = await this.liveChatroomService
      .getLiveUsersForChatroom(chatroomId)
      .catch((err) => {
        console.log('getLiveUsersForChatroom error', err);
      });

    await this.pubSub
      .publish(`liveUsersInChatroom.${chatroomId}`, {
        liveUsers,
        chatroomId,
      })
      .catch((err) => {
        console.log('pubSub error', err);
      });
    return true;
  }

  @UseFilters(GraphQLErrorFilter)
  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Boolean)
  async leaveChatroom(
    @Args('chatroomId') chatroomId: number,
    @Context() context: { req: Request },
  ) {
    const userId = context?.req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user = await this.userService.getUser(parseInt(userId));

    if (!user) {
      throw new BadRequestException('User not found');
    }
    await this.liveChatroomService.removeLiveUserFromChatroom(chatroomId, user);

    const liveUsers =
      await this.liveChatroomService.getLiveUsersForChatroom(chatroomId);
    await this.pubSub.publish(`liveUsersInChatroom.${chatroomId}`, {
      liveUsers,
      chatroomId,
    });

    return true;
  }
}
