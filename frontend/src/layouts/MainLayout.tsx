import { Flex } from '@mantine/core';
import { Children, type PropsWithChildren } from 'react';

const MainLayout = ({ children }: PropsWithChildren) => {
  const arrayChildren = Children.toArray(children);

  const sidebar = arrayChildren[2];
  const mainContent = arrayChildren.filter((_, i) => i !== 2);

  return (
    <Flex style={{ height: '100vh', width: '100vw' }}>
      <div>{sidebar}</div>

      <div style={{ flex: 1 }}>{mainContent}</div>
    </Flex>
  );
};

export default MainLayout;
