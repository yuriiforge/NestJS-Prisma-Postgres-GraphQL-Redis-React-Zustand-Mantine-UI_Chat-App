import { useParams } from 'react-router-dom';

import { Flex, Text } from '@mantine/core';
import Chatwindow from './Chatwindow';

function JoinRoomOrChatwindow() {
  const { id } = useParams<{ id: string }>();

  return (
    <Flex h="100vh" align="center" justify="center" w="100%">
      {!id ? (
        <Text size="xl" ml="xl">
          Please choose a room
        </Text>
      ) : (
        <Chatwindow />
      )}
    </Flex>
  );
}

export default JoinRoomOrChatwindow;
