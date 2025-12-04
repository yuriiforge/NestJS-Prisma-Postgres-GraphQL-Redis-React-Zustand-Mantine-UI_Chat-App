import React, { useState } from 'react';
import {
  TextInput,
  Image,
  Button,
  Flex,
  Avatar,
  Tooltip,
  Text,
} from '@mantine/core';
import { useDropzone } from 'react-dropzone';
import { IconMichelinBibGourmand } from '@tabler/icons-react';
import type { User } from '../gql/graphql';

interface ChatInputProps {
  onSendMessage: (content: string, file: File | null) => void;
  onTyping: () => void;
  typingUsers: Partial<User>[];
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTyping,
  typingUsers,
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 1. File Upload Logic
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
      }
    },
    multiple: false, // Start simple with single file
  });

  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

  // 2. Send Logic
  const handleSend = () => {
    // Prevent sending empty messages
    if (!messageContent && !selectedFile) return;

    onSendMessage(messageContent, selectedFile);

    // Clear inputs after sending
    setMessageContent('');
    setSelectedFile(null);
  };

  return (
    <Flex
      style={{
        width: '95%',
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#f1f1f0',
      }}
      direction="column"
      align="start"
    >
      <Flex
        w={'100%'}
        mx={'md'}
        my={'xs'}
        align="center"
        justify={'center'}
        direction={'column'}
        pos="relative"
        p={'sm'}
      >
        {/* --- Typing Indicator Bubble --- */}
        <Flex
          pos="absolute"
          bottom={50}
          direction="row"
          align="center"
          bg="#f1f1f0"
          style={{
            borderRadius: 5,
            boxShadow: '0px 0px 5px 0px #000000',
            // Hide if nobody is typing
            visibility: typingUsers.length === 0 ? 'hidden' : 'visible',
            opacity: typingUsers.length === 0 ? 0 : 1,
            transition: 'opacity 0.2s ease',
          }}
          p={'sm'}
        >
          <Avatar.Group>
            {typingUsers.map((user) => (
              <Tooltip key={user.id} label={user.fullname}>
                <Avatar radius={'xl'} src={user.avatarUrl || null} />
              </Tooltip>
            ))}
          </Avatar.Group>

          {typingUsers.length > 0 && (
            <Text c="dimmed" ml="xs" size="sm">
              is typing...
            </Text>
          )}
        </Flex>

        {/* --- Input Area --- */}
        <Flex w="100%" align="center" gap="sm">
          {/* File Upload */}
          <Flex {...getRootProps()} align="center">
            <input {...getInputProps()} />
            {selectedFile && previewUrl && (
              <Image
                src={previewUrl}
                alt="Preview"
                width={50}
                height={50}
                radius="md"
                mr="sm"
              />
            )}
            <Button
              leftSection={<IconMichelinBibGourmand />}
              variant="default"
            />
          </Flex>

          {/* Text Input */}
          <TextInput
            value={messageContent}
            onChange={(e) => setMessageContent(e.currentTarget.value)}
            onKeyDown={onTyping}
            placeholder="Type your message..."
            style={{ flex: 1 }}
          />

          {/* Send Button */}
          <Button
            onClick={handleSend}
            color="blue"
            size="md"
            pl={16}
            pr={16}
            leftSection={<IconMichelinBibGourmand size={20} />}
          >
            Send
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ChatInput;
