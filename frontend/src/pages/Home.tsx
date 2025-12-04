import { Flex } from '@mantine/core';
import RoomList from '../components/RoomList';
import AddChatroom from '../components/AddChatroom';
import JoinRoomOrChatwindow from '../components/JoinRoomOrChatwindow';

const Home = () => {
  return (
    <>
      <AddChatroom />
      <Flex>
        <RoomList />
        <JoinRoomOrChatwindow />
      </Flex>
    </>
  );
};

export default Home;
