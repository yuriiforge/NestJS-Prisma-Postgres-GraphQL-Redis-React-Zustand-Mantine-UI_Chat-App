import { useEffect, useState, useRef } from 'react';
import { useMutation, useQuery, useSubscription } from '@apollo/client/react';
import {
  type GetMessagesForChatroomQuery,
  type NewMessageSubscription,
  type SendMessageMutation,
} from '../gql/graphql';
import { GET_MESSAGES_FOR_CHATROOM } from '../graphql/queries/GetMessagesForChatroom';
import { NEW_MESSAGE_SUBSCRIPTION } from '../graphql/subscriptions/NewMessage';
import { SEND_MESSAGE } from '../graphql/mutations/SendMessage';

export type ChatMessage =
  GetMessagesForChatroomQuery['getMessagesForChatroom'][0];

export function useChatMessages(chatroomId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const initialized = useRef(false);

  const {
    data: msgData,
    loading,
    error,
  } = useQuery<GetMessagesForChatroomQuery>(GET_MESSAGES_FOR_CHATROOM, {
    variables: { chatroomId },
  });

  useEffect(() => {
    if (!initialized.current && msgData?.getMessagesForChatroom) {
      setMessages(msgData.getMessagesForChatroom);
      initialized.current = true;
    }
  }, [msgData?.getMessagesForChatroom]);

  const { data: newMessageData } = useSubscription<NewMessageSubscription>(
    NEW_MESSAGE_SUBSCRIPTION,
    { variables: { chatroomId } }
  );

  useEffect(() => {
    // 1. GUARD CLAUSE: If data is null/undefined, stop here.
    if (!newMessageData?.newMessage) {
      return;
    }

    // 2. Capture the message safely
    const incomingMessage = newMessageData.newMessage;

    setMessages((prev) => {
      // 3. Check for duplicates
      if (prev.find((m) => m.id === incomingMessage.id)) {
        return prev;
      }

      // 4. Return new state (You might need a cast if types are strict)
      return [...prev, incomingMessage as ChatMessage];
    });
  }, [newMessageData]);

  const [sendMessageMutation] = useMutation<SendMessageMutation>(SEND_MESSAGE);

  const sendMessage = async (content: string, file: File | null) => {
    try {
      await sendMessageMutation({
        variables: {
          chatroomId,
          content,
          image: file,
        },
      });
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return { messages, loading, error, sendMessage };
}
