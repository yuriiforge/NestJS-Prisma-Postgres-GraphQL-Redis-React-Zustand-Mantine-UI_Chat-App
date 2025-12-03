import { Card, MantineProvider } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import '@mantine/core/styles.css';

export function RootLayout() {
  return (
    <MantineProvider>
      <Card shadow="lg" padding="lg">
        <Outlet />
      </Card>
    </MantineProvider>
  );
}
