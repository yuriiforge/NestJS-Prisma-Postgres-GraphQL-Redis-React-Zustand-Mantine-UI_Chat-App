import { Card, MantineProvider, Text } from '@mantine/core';

function App() {
  return (
    <MantineProvider>
      <Card shadow="lg">
        <Text>Hello!</Text>
      </Card>
    </MantineProvider>
  );
}

export default App;
