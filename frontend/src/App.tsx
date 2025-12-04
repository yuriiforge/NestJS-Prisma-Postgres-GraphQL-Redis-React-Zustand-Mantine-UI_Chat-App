import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import { RootLayout } from './layouts/RootLayout';
import ProtectedRoutes from './components/ProtectedRoutes';
import ChatPage from './pages/ChatPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        element: <ProtectedRoutes />,
        children: [
          { index: true, element: <Home /> },
          { path: 'chatrooms/:id', element: <ChatPage /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
