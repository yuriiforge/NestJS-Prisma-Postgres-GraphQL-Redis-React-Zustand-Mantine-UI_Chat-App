import AuthOverlay from '../components/AuthOverlay';
import Sidebar from '../components/Sidebar';
import MainLayout from '../layouts/MainLayout';

const Home = () => {
  return (
    <MainLayout>
      <Sidebar />
      <AuthOverlay />
      HOME PAGE
    </MainLayout>
  );
};

export default Home;
