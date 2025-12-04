import { useMutation, useSubscription } from '@apollo/client/react';
import { useEffect, useRef, useState } from 'react';
import { USER_STARTED_TYPING_MUTATION } from '../graphql/mutations/UseStartedTyping';
import { USER_STOPPED_TYPING_SUBSCRIPTION } from '../graphql/subscriptions/UserStoppedTyping';
import { USER_STARTED_TYPING_SUBSCRIPTION } from '../graphql/subscriptions/UserStartedTyping';
import { USER_STOPPED_TYPING_MUTATION } from '../graphql/mutations/UseStoppedTyping';
import type {
  User,
  UserStartedTypingMutationMutation,
  UserStartedTypingSubscription,
  UserStoppedTypingMutationMutation,
  UserStoppedTypingSubscription,
} from '../gql/graphql';

export const useChatTyping = (
  chatroomId: number,
  userId: number | undefined
) => {
  const [typingUsers, setTypingUsers] = useState<Partial<User>[]>([]);
  const typingTimeoutRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  // Subscriptions
  const { data: typingData } = useSubscription<UserStartedTypingSubscription>(
    USER_STARTED_TYPING_SUBSCRIPTION,
    {
      variables: { chatroomId, userId },
    }
  );

  const { data: stoppedTypingData } =
    useSubscription<UserStoppedTypingSubscription>(
      USER_STOPPED_TYPING_SUBSCRIPTION,
      {
        variables: { chatroomId, userId },
      }
    );

  // Mutations
  const [userStartedTypingMutation] =
    useMutation<UserStartedTypingMutationMutation>(
      USER_STARTED_TYPING_MUTATION
    );
  const [userStoppedTypingMutation] =
    useMutation<UserStoppedTypingMutationMutation>(
      USER_STOPPED_TYPING_MUTATION
    );

  // Effects
  useEffect(() => {
    const user = typingData?.userStartedTyping;

    if (user && user.id) {
      setTypingUsers((prevUsers) => {
        const isAlreadyTyping = prevUsers.find((u) => u.id === user.id);
        if (!isAlreadyTyping) {
          return [...prevUsers, user];
        }
        return prevUsers;
      });
    }
  }, [typingData]);

  useEffect(() => {
    const user = stoppedTypingData?.userStoppedTyping;

    if (user && user.id) {
      // 1. Clear any existing timeout for this user (cleanup)
      if (typingTimeoutRef.current[user.id]) {
        clearTimeout(typingTimeoutRef.current[user.id]);
      }

      // 2. Remove the user from the state array
      setTypingUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
    }
  }, [stoppedTypingData]);

  const handleUserTyping = async () => {
    if (!userId) return;

    // A. Tell the server "I started typing"
    await userStartedTypingMutation({ variables: { chatroomId } });

    // B. Clear previous timeout (debounce) logic
    if (typingTimeoutRef.current[userId]) {
      clearTimeout(typingTimeoutRef.current[userId]);
    }

    // C. Set a new timeout to automatically stop typing after 2 seconds
    // This handles the case where the user stops typing but doesn't blur the input
    typingTimeoutRef.current[userId] = setTimeout(async () => {
      // Remove self from local list (optional, UI feels snappier)
      setTypingUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));

      // Tell server "I stopped typing"
      await userStoppedTypingMutation({ variables: { chatroomId } });
    }, 2000);
  };

  return { typingUsers, handleUserTyping };
};
