import { useEffect } from 'react';
import { useUserStore } from '../stores/userStore';
import { useGeneralStore } from '../stores/generalStore';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoutes = () => {
  const userId = useUserStore((state) => state.user?.id);
  const toggleLoginModal = useGeneralStore((state) => state.toggleLoginModal);

  useEffect(() => {
    if (!userId) {
      toggleLoginModal();
    }
  }, [toggleLoginModal, userId]);

  if (!userId) return <Navigate to="/" />;

  return <Outlet />;
};

export default ProtectedRoutes;
