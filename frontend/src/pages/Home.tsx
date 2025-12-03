import { Flex } from '@mantine/core';
import AuthOverlay from '../components/auth/AuthOverlay';
import ProfileSettings from '../components/ProfileSettings';
import ProtectedRoutes from '../components/ProtectedRoutes';
import RoomList from '../components/RoomList';
import Sidebar from '../components/Sidebar';
import MainLayout from '../layouts/MainLayout';
import AddChatroom from '../components/AddChatroom';

const Home = () => {
  return (
    <MainLayout>
      <Sidebar />
      <AuthOverlay />
      <ProfileSettings />
      <ProtectedRoutes>
        <Flex direction={{ base: 'column', sm: 'row' }} w={'100vw'}>
          {' '}
          <RoomList />
          <AddChatroom />
        </Flex>
      </ProtectedRoutes>
    </MainLayout>
  );
};

export default Home;
