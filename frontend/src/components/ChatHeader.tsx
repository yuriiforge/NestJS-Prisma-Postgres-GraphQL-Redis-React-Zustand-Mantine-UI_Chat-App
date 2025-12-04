import React from 'react';
import { Flex, Text, List, Avatar, Divider, ScrollArea } from '@mantine/core';
import type { User } from '../gql/graphql';
import OverlappingAvatars from './OverlappingAvatars';

interface ChatHeaderProps {
  allUsers: Partial<User>[] | undefined | null;
  liveUsers: Partial<User>[];
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ allUsers, liveUsers }) => {
  return (
    <Flex direction={'column'} bg={'#f1f1f0'} w="100%">
      <Flex
        direction={'row'}
        justify={'space-around'}
        align={'start'}
        my="sm"
        p="sm"
      >
        <Flex direction={'column'} align={'start'}>
          <Text mb="xs" c="dimmed" size="sm">
            Chat with
          </Text>
          {allUsers && allUsers.length > 0 ? (
            <OverlappingAvatars users={allUsers} />
          ) : (
            <Text size="xs" c="dimmed">
              Loading users...
            </Text>
          )}
        </Flex>

        <Flex direction={'column'} align={'start'}>
          <Text mb="xs" c="dimmed" size="sm">
            Live users
          </Text>

          <ScrollArea h={liveUsers.length > 4 ? 150 : 'auto'} type="auto">
            <List listStyleType="none" withPadding={false} w={150}>
              {liveUsers.map((user) => (
                <Flex key={user.id} pos="relative" align="center" my={'xs'}>
                  <div style={{ position: 'relative' }}>
                    <Avatar
                      radius={'xl'}
                      size={25}
                      src={user.avatarUrl || null}
                      alt={user.fullname || 'User'}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 10,
                        height: 10,
                        backgroundColor: 'green',
                        borderRadius: '50%',
                        border: '1.5px solid white',
                      }}
                    />
                  </div>

                  <Text ml={'sm'} size="sm" truncate>
                    {user.fullname || 'Unknown User'}
                  </Text>
                </Flex>
              ))}

              {liveUsers.length === 0 && (
                <Text size="xs" c="dimmed" fs="italic">
                  No one else is here
                </Text>
              )}
            </List>
          </ScrollArea>
        </Flex>
      </Flex>

      <Divider size={'sm'} w={'100%'} />
    </Flex>
  );
};

export default ChatHeader;
