import { Modal } from '@mantine/core';
import { useGeneralStore } from '../../stores/generalStore';
import { useState } from 'react';
import Register from './Register';
import Login from './Login';

const AuthOverlay = () => {
  const isLoginModalOpen = useGeneralStore((state) => state.isLoginModalOpen);
  const toggleLoginModal = useGeneralStore((state) => state.toggleLoginModal);
  const [isRegister, setIsRegister] = useState(false);

  const toggleForm = () => {
    setIsRegister(!isRegister);
  };

  return (
    <Modal opened={isLoginModalOpen} onClose={toggleLoginModal}>
      {isRegister ? (
        <Register toggleForm={toggleForm} />
      ) : (
        <Login toggleForm={toggleForm} />
      )}
    </Modal>
  );
};

export default AuthOverlay;
