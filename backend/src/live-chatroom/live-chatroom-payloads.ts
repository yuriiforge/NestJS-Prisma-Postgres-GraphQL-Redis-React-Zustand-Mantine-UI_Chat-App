import { User } from '../user/user.type';

export interface LiveUsersInChatroomPayload {
  liveUsers: User[];
  chatroomId: number;
}
