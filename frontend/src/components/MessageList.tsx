import React, { useEffect, useRef } from 'react';
import { ScrollArea, Text, Flex, Loader } from '@mantine/core';
import MessageBubble from './MessageBubble';
import type { ChatMessage } from '../hooks/useChatMessages';

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  currentUserId: number | undefined;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  currentUserId,
}) => {
  // We need a ref to the actual DOM element to force scrolling
  const viewportRef = useRef<HTMLDivElement>(null);

  // Logic: Automatically scroll to bottom whenever the 'messages' array changes
  useEffect(() => {
    if (viewportRef.current) {
      const scrollElement = viewportRef.current;

      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <ScrollArea
      viewportRef={viewportRef}
      h={'70vh'} // Takes up most of the vertical space
      offsetScrollbars
      type="always"
      w="100%"
      p={'md'}
      style={{ flex: 1 }} // Ensures it fills available space in Flex layout
    >
      {loading ? (
        <Flex justify="center" align="center" h="100%">
          <Loader size="sm" variant="dots" />
          <Text c="dimmed" ml="xs">
            Loading messages...
          </Text>
        </Flex>
      ) : messages.length === 0 ? (
        <Flex justify="center" align="center" h="100%" direction="column">
          <Text c="dimmed">No messages yet.</Text>
          <Text c="dimmed" size="xs">
            Be the first to say hello!
          </Text>
        </Flex>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUserId={currentUserId || 0}
          />
        ))
      )}
    </ScrollArea>
  );
};

export default MessageList;
