import { gql } from '@apollo/client';

export const USER_STARTED_TYPING_SUBSCRIPTION = gql`
  subscription UserStartedTyping($chatroomId: Float!) {
    userStartedTyping(chatroomId: $chatroomId) {
      id
      fullname
      email
      avatarUrl
    }
  }
`;
