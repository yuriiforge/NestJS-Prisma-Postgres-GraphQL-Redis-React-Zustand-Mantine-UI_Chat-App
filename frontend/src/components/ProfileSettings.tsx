import { useRef, useState } from 'react';
import { useGeneralStore } from '../stores/generalStore';
import { useUserStore } from '../stores/userStore';
import { useForm } from '@mantine/form';
import { useMutation } from '@apollo/client/react';
import { UPDATE_PROFILE } from '../graphql/mutations/UpdateUserProfile';
import { type UpdateProfileMutation } from '../gql/graphql';
import {
  Avatar,
  Button,
  FileInput,
  Flex,
  Group,
  Modal,
  TextInput,
} from '@mantine/core';
import { IconEditCircle } from '@tabler/icons-react';

const ProfileSettings = () => {
  const isProfileSettingsModalOpen = useGeneralStore(
    (state) => state.isProfileSettingsModalOpen
  );
  const toggleProfileSettingsModal = useGeneralStore(
    (state) => state.toggleProfileSettingsModal
  );
  const profileImage = useUserStore((state) => state.user?.avatarUrl);
  const updateProfileImage = useUserStore((state) => state.updateProfileImage);

  const username = useUserStore((state) => state.user?.fullname);
  const updateUsername = useUserStore((state) => state.updateUsername);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const imagePreview = imageFile ? URL.createObjectURL(imageFile) : null;

  const fileInputRef = useRef<HTMLButtonElement>(null);

  const form = useForm({
    initialValues: {
      fullname: username,
      profileImage: profileImage,
    },
    validate: {
      fullname: (value: string | undefined) =>
        value && value.trim().length >= 3
          ? null
          : 'Username must be at least 3 characters',
      profileImage: () => null,
    },
  });

  const [updateProfile] = useMutation<UpdateProfileMutation>(UPDATE_PROFILE, {
    variables: {
      fullname: form.values.fullname,
      file: imageFile,
    },

    onCompleted: (data) => {
      updateProfileImage(data.updateProfile.avatarUrl || '');
      updateUsername(data.updateProfile.fullname);
    },
  });

  const handleSave = async () => {
    if (form.validate().hasErrors) return;
    await updateProfile().then(() => {
      toggleProfileSettingsModal();
    });
  };

  return (
    <Modal
      opened={isProfileSettingsModalOpen}
      onClose={toggleProfileSettingsModal}
      title="Profile Settings"
    >
      {' '}
      <form onSubmit={form.onSubmit(() => updateProfile())}>
        <Group
          pos="relative"
          w={100}
          h={100}
          style={{ cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Avatar
            src={imagePreview || profileImage || null}
            alt="Profile"
            h={100}
            w={100}
            radius={100}
          />
          <IconEditCircle
            color="black"
            size={20}
            style={{
              position: 'absolute',
              top: 50,
              right: -10,
              background: 'white',
              border: '1px solid black',
              padding: 5,
              borderRadius: 100,
            }}
          />
          <FileInput
            ref={fileInputRef}
            style={{ display: 'none' }}
            pos={'absolute'}
            accept="image/*"
            placeholder="Upload new image"
            onChange={(file) => setImageFile(file)}
          />
        </Group>
        <TextInput
          style={{ marginTop: 20 }}
          label="Username"
          {...form.getInputProps('fullname')}
          onChange={(event) => {
            form.setFieldValue('fullname', event.currentTarget.value);
          }}
          error={form.errors.fullname}
        />
        <Flex gap="md" mt="sm">
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={toggleProfileSettingsModal} variant="link">
            Cancel
          </Button>
        </Flex>
      </form>
    </Modal>
  );
};

export default ProfileSettings;
