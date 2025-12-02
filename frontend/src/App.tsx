import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import { RootLayout } from './layouts/RootLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [{ index: true, element: <Home /> }],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
