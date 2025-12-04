import { AppShell } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';

// Components
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageList from './MessageList';

// Hooks
import { useChatMessages } from '../hooks/useChatMessages';
import { useChatTyping } from '../hooks/useChatTyping';
import { useChatPresence } from '../hooks/useChatPresence';

// Stores & Utils
import { useUserStore } from '../stores/userStore';
import { GET_USERS_OF_CHATROOM } from '../graphql/queries/GetUsersOfChatroom';
import { type GetUsersOfChatroomQuery } from '../gql/graphql';

export default function Chatwindow() {
  // 1. Get Context
  const { id } = useParams<{ id: string }>();
  const chatroomId = parseInt(id!);
  const user = useUserStore((state) => state.user);

  // 2. Data Logic (Custom Hook)
  // Now handles Query + Subscription + Mutation internally
  const {
    messages,
    sendMessage,
    loading: loadingMessages,
  } = useChatMessages(chatroomId);

  // 3. Real-time Features (Typing & Presence)
  const { typingUsers, handleUserTyping } = useChatTyping(chatroomId, user?.id);
  const { liveUsers } = useChatPresence(chatroomId);

  // 4. Auxiliary Data (Chat Members)
  // You could move this into a hook too, but it's fine here for now
  const { data: usersData } = useQuery<GetUsersOfChatroomQuery>(
    GET_USERS_OF_CHATROOM,
    { variables: { chatroomId } }
  );

  return (
    <AppShell>
      <ChatHeader
        allUsers={usersData?.getUsersOfChatroom ?? []}
        liveUsers={liveUsers}
      />

      <MessageList
        loading={loadingMessages}
        messages={messages}
        currentUserId={user?.id}
      />

      <ChatInput
        typingUsers={typingUsers}
        onTyping={handleUserTyping}
        onSendMessage={(content, file) => {
          sendMessage(content, file);
        }}
      />
    </AppShell>
  );
}
