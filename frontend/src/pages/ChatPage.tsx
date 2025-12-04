import { Text } from '@mantine/core';
import { useParams } from 'react-router-dom';
import Chatwindow from '../components/Chatwindow';

const ChatPage = () => {
  const { id } = useParams();
  console.log(id);
  if (!id) return <Text>Please choose a room</Text>;

  return <Chatwindow />;
};

export default ChatPage;
