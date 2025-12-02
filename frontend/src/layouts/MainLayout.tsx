import { Flex } from '@mantine/core';
import { type PropsWithChildren } from 'react';

const MainLayout = ({ children }: PropsWithChildren) => {
  return (
    <Flex>
      <Flex>{children}</Flex>
    </Flex>
  );
};

export default MainLayout;
