import { Tooltip, UnstyledButton, Stack, Center } from '@mantine/core';
import {
  IconLogout,
  IconBrandWechat,
  type IconProps,
  IconBrandMessenger,
  IconUser,
  IconLogin,
} from '@tabler/icons-react';
import { useMutation } from '@apollo/client/react';
import { LOGOUT_USER } from '../graphql/mutations/Logout';
import { useGeneralStore } from '../stores/generalStore';
import React, { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import classes from './NavbarMinimal.module.css';

interface NavbarLinkProps {
  icon: React.ElementType<IconProps>;
  label: string;
  active?: boolean;
  onClick?(): void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip
      label={label}
      position="right"
      transitionProps={{ duration: 0 }}
      withinPortal={false}
    >
      <UnstyledButton
        onClick={onClick}
        className={classes.link}
        data-active={active || undefined}
      >
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [{ icon: IconBrandWechat, label: 'Chatrooms' }];

const Sidebar = () => {
  const toggleProfileSettingsModal = useGeneralStore(
    (state) => state.toggleProfileSettingsModal
  );
  const toggleLoginModal = useGeneralStore((state) => state.toggleLoginModal);
  const [active, setActive] = useState(0);

  const user = useUserStore((state) => state.user);
  const userId = user?.id ?? null;
  const setUser = useUserStore((state) => state.setUser);

  const [logoutUser] = useMutation(LOGOUT_USER, {
    onCompleted: () => {
      toggleLoginModal();
    },
  });

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => setActive(index)}
    />
  ));

  return (
    <nav className={classes.navbar}>
      <Center>
        <IconBrandMessenger type="mark" size={30} />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {userId && links}
        </Stack>
      </div>

      <Stack justify="center" gap={0}>
        {userId && (
          <NavbarLink
            icon={IconUser}
            label={'Profile(' + user?.fullname + ')'}
            onClick={toggleProfileSettingsModal}
          />
        )}

        {userId ? (
          <NavbarLink icon={IconLogout} label="Logout" onClick={handleLogout} />
        ) : (
          <NavbarLink
            icon={IconLogin}
            label="Login"
            onClick={toggleLoginModal}
          />
        )}
      </Stack>
    </nav>
  );
};

export default Sidebar;
