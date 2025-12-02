import { Card, MantineProvider } from '@mantine/core';
import { Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <MantineProvider>
      <Card shadow="lg" padding="lg">
        <Outlet />
      </Card>
    </MantineProvider>
  );
}
