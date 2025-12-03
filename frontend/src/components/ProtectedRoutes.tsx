import { useEffect, type PropsWithChildren } from 'react';
import { useUserStore } from '../stores/userStore';
import { useGeneralStore } from '../stores/generalStore';

const ProtectedRoutes = ({ children }: PropsWithChildren) => {
  const userId = useUserStore((state) => state.user?.id);
  const toggleLoginModal = useGeneralStore((state) => state.toggleLoginModal);

  useEffect(() => {
    if (!userId) {
      toggleLoginModal();
    }
  }, [toggleLoginModal, userId]);

  if (userId) return children;

  return <p>Login to get started</p>;
};

export default ProtectedRoutes;
