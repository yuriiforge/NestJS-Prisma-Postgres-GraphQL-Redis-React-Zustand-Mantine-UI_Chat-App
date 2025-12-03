import AuthOverlay from '../components/AuthOverlay';
import ProfileSettings from '../components/ProfileSettings';
import Sidebar from '../components/Sidebar';
import MainLayout from '../layouts/MainLayout';

const Home = () => {
  return (
    <MainLayout>
      <Sidebar />
      <AuthOverlay />
      <ProfileSettings />
    </MainLayout>
  );
};

export default Home;
