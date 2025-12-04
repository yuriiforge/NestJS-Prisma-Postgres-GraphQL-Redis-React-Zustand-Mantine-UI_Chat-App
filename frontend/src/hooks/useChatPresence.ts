import { useEffect, useState } from 'react';
import {
  type LiveUsersInChatroomSubscription,
  type User,
} from '../gql/graphql';
import { useMutation, useSubscription } from '@apollo/client/react';
import { ENTER_CHATROOM } from '../graphql/mutations/EnterChatroom';
import { LEAVE_CHATROOM } from '../graphql/mutations/LeaveChatroom';
import { LIVE_USERS_SUBSCRIPTION } from '../graphql/subscriptions/LiveUsers';

export const useChatPresence = (chatroomId: number) => {
  const [liveUsers, setLiveUsers] = useState<Partial<User>[]>([]);
  const [enterChatroom] = useMutation(ENTER_CHATROOM);
  const [leaveChatroom] = useMutation(LEAVE_CHATROOM);

  const { data: liveData, loading } =
    useSubscription<LiveUsersInChatroomSubscription>(LIVE_USERS_SUBSCRIPTION, {
      variables: { chatroomId },
    });

  useEffect(() => {
    enterChatroom({ variables: { chatroomId } });
    const handleUnload = () => leaveChatroom({ variables: { chatroomId } });

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      handleUnload();
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [chatroomId, enterChatroom, leaveChatroom]);

  useEffect(() => {
    if (liveData) setLiveUsers(liveData.liveUsersInChatroom || []);
  }, [liveData]);

  return { liveUsers, loading };
};
