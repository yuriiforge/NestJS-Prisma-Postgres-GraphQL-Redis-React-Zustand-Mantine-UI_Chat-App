import { Outlet } from 'react-router-dom';
import '@mantine/core/styles.css';
import AuthOverlay from '../components/auth/AuthOverlay';
import ProfileSettings from '../components/ProfileSettings';
import Sidebar from '../components/Sidebar';
import MainLayout from './MainLayout';
import { MantineProvider } from '@mantine/core';

export function RootLayout() {
  return (
    <MantineProvider>
      <MainLayout>
        <AuthOverlay />
        <ProfileSettings />
        <Sidebar />

        <Outlet />
      </MainLayout>
    </MantineProvider>
  );
}
