import { Args, Context, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ChatroomService } from './chatroom.service';
import { UserService } from '../user/user.service';
import { UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import { GraphQLErrorFilter } from '../filters/custom-exception.filter';
import { GraphqlAuthGuard } from '../auth/graphql-auth.guard';
import { Chatroom, Message } from './chatroom.types';
import { Request } from 'express';

@Resolver()
export class ChatroomResolver {
  constructor(
    private readonly chatroomService: ChatroomService,
    private readonly userService: UserService,
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
}
