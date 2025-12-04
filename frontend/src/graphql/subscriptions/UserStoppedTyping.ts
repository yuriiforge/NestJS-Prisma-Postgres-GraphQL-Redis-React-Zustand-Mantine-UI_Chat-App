import { gql } from '@apollo/client';

export const USER_STOPPED_TYPING_SUBSCRIPTION = gql`
  subscription UserStoppedTyping($chatroomId: Float!) {
    userStoppedTyping(chatroomId: $chatroomId) {
      id
      fullname
      email
      avatarUrl
    }
  }
`;
