import { User } from '../user/user.type';
import { Message } from './chatroom.types';

export interface NewMessagePayload {
  newMessage: Message;
}

export interface UserStartedTypingPayload {
  user: User; // the actual user object you want to return
  typingUserId: number; // used in your filter
}
