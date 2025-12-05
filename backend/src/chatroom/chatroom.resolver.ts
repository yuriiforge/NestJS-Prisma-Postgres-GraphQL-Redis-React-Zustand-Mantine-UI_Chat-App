import {
  Args,
  Context,
  Mutation,
  Resolver,
  Query,
  Subscription,
} from '@nestjs/graphql';
import { ChatroomService } from './chatroom.service';
import { UserService } from '../user/user.service';
import {
  BadRequestException,
  Inject,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { GraphQLErrorFilter } from '../filters/custom-exception.filter';
import { GraphqlAuthGuard } from '../auth/graphql-auth.guard';
import { Chatroom, Message } from './chatroom.types';
import { Request } from 'express';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { User } from '../user/user.type';
import {
  NewMessagePayload,
  UserStartedTypingPayload,
} from './chatroom-payloads';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@Resolver()
export class ChatroomResolver {
  constructor(
    private readonly chatroomService: ChatroomService,
    private readonly userService: UserService,
    @Inject('PUB_SUB') private readonly pubsub: RedisPubSub,
  ) {}

  @UseFilters(GraphQLErrorFilter)
  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Chatroom)
  async createChatroom(
    @Args('name') name: string,
    @Context() context: { req: Request },
  ) {
    const userId = context?.req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.chatroomService.createChatroom(name, parseInt(userId));
  }

  @Mutation(() => Chatroom)
  async addUsersToChatroom(
    @Args('chatroomId') chatroomId: number,
    @Args('userIds', { type: () => [Number] }) userdIds: number[],
  ) {
    return this.chatroomService.addUsersToChatroom(chatroomId, userdIds);
  }

  @Query(() => [Chatroom])
  async getChatroomsForUser(@Args('userId') userId: number) {
    return this.chatroomService.getChatroomsForUser(userId);
  }

  @Query(() => [Message])
  async getMessagesForChatroom(@Args('chatroomId') chatroomId: number) {
    return this.chatroomService.getMessagesForChatroom(chatroomId);
  }

  @Mutation(() => String)
  async deleteChatroom(@Args('chatroomId') chatroomId: number) {
    await this.chatroomService.deleteChatroom(chatroomId);
    return 'Chatroom deleted successfully!';
  }

  @Subscription(() => User, {
    nullable: true,
    resolve: (value: UserStartedTypingPayload) => value.user,
    filter: (
      payload: UserStartedTypingPayload,
      variables: { userId: number },
    ) => {
      return variables.userId !== payload.typingUserId;
    },
  })
  userStartedTyping(@Args('chatroomId') chatroomId: number) {
    return this.pubsub.asyncIterator(`userStartedTyping.${chatroomId}`);
  }

  @Subscription(() => User, {
    nullable: true,
    resolve: (value: UserStartedTypingPayload) => value.user,
    filter: (
      payload: UserStartedTypingPayload,
      variables: { userId: number },
    ) => {
      return variables.userId !== payload.typingUserId;
    },
  })
  userStoppedTyping(@Args('chatroomId') chatroomId: number) {
    return this.pubsub.asyncIterator(`userStoppedTyping.${chatroomId}`);
  }

  @Subscription(() => Message, {
    nullable: true,
    resolve: (value: NewMessagePayload) => {
      const message = value.newMessage;

      if (typeof message.createdAt === 'string') {
        message.createdAt = new Date(message.createdAt);
      }
      if (typeof message.updatedAt === 'string') {
        message.updatedAt = new Date(message.updatedAt);
      }

      return message;
    },
  })
  newMessage(@Args('chatroomId') chatroomId: number) {
    return this.pubsub.asyncIterator(`newMessage.${chatroomId}`);
  }

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => Message)
  async sendMessage(
    @Args('chatroomId') chatroomId: number,
    @Args('content') content: string,
    @Context() context: { req: Request },
    @Args('image', { type: () => GraphQLUpload, nullable: true })
    image?: FileUpload,
  ) {
    const userId = context?.req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    let imagePath: string | null = null;
    if (image) imagePath = await this.chatroomService.saveImage(image);
    const newMessage = await this.chatroomService.sendMessage(
      chatroomId,
      content,
      parseInt(userId),
      imagePath as string,
    );
    await this.pubsub
      .publish(`newMessage.${chatroomId}`, { newMessage })
      .then((res) => {
        console.log('published', res);
      })
      .catch((err) => {
        console.log('err', err);
      });

    return newMessage;
  }

  @UseFilters(GraphQLErrorFilter)
  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => User)
  async userStartedTypingMutation(
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
    await this.pubsub.publish(`userStartedTyping.${chatroomId}`, {
      user,
      typingUserId: user.id,
    });
    return user;
  }
  @UseFilters(GraphQLErrorFilter)
  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => User, {})
  async userStoppedTypingMutation(
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

    await this.pubsub.publish(`userStoppedTyping.${chatroomId}`, {
      user,
      typingUserId: user.id,
    });

    return user;
  }
}
