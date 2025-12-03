import { useMutation } from '@apollo/client/react';
import {
  Paper,
  Grid,
  GridCol,
  TextInput,
  Button,
  Group,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import type { GraphQLErrorExtensions } from 'graphql';
import { useState } from 'react';
import type { RegisterUserMutation } from '../../gql/graphql';
import { REGISTER_USER } from '../../graphql/mutations/Register';
import { useGeneralStore } from '../../stores/generalStore';
import { useUserStore } from '../../stores/userStore';

interface Props {
  toggleForm: () => void;
}

const Register = ({ toggleForm }: Props) => {
  const form = useForm({
    initialValues: {
      fullname: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      fullname: (value: string) =>
        value.trim().length >= 3
          ? null
          : 'Username must be at least 3 characters',
      email: (value: string) => (value.includes('@') ? null : 'Invalid email'),
      password: (value: string) =>
        value.trim().length >= 3
          ? null
          : 'Password must be at least 3 characters',
      confirmPassword: (value: string, values) =>
        value.trim().length >= 3 && value === values.password
          ? null
          : 'Passwords do not match',
    },
  });
  const setUser = useUserStore((state) => state.setUser);
  const setIsLoginOpen = useGeneralStore((state) => state.toggleLoginModal);

  const [errors, setErrors] = useState<GraphQLErrorExtensions>({});

  const [registerUser, { loading }] =
    useMutation<RegisterUserMutation>(REGISTER_USER);

  const handleRegister = async () => {
    setErrors({});

    await registerUser({
      variables: {
        email: form.values.email,
        fullname: form.values.fullname,
        password: form.values.password,
        confirmPassword: form.values.confirmPassword,
      },
      onCompleted: (data) => {
        setErrors({});
        if (data?.register.user) {
          setUser({
            id: data.register.user.id,
            email: data.register.user.email,
            fullname: data.register.user.fullname,
          });
          setIsLoginOpen();
        }
      },
    }).catch((err) => {
      console.log(err.graphQLErrors, 'ERROR');
      setErrors(err.graphQLErrors[0].extensions);
      useGeneralStore.setState({ isLoginModalOpen: true });
    });
  };

  return (
    <Paper>
      <Text size="xl" ta="center">
        Register
      </Text>
      <form onSubmit={form.onSubmit(() => handleRegister())}>
        <Grid mt={20}>
          <GridCol span={12}>
            <TextInput
              autoComplete="off"
              label="Username"
              placeholder="Enter your username"
              {...form.getInputProps('fullname')}
              error={form.errors.fullname || (errors?.fullname as string)}
            />
          </GridCol>
          <GridCol span={12}>
            <TextInput
              autoComplete="off"
              label="Email"
              placeholder="Enter your email"
              {...form.getInputProps('email')}
              error={form.errors.email || (errors?.email as string)}
            />
          </GridCol>
          <GridCol span={12}>
            <TextInput
              autoComplete="off"
              label="Password"
              type="password"
              placeholder="Enter your password"
              {...form.getInputProps('password')}
              error={form.errors.password || (errors?.password as string)}
            />
          </GridCol>
          <GridCol span={12}>
            <TextInput
              {...form.getInputProps('confirmPassword')}
              error={
                form.errors.confirmPassword ||
                (errors?.confirmPassword as string)
              }
              autoComplete="off"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
            />
          </GridCol>
          <GridCol span={12}>
            <Button variant="subtle" onClick={toggleForm}>
              Already registered? Login here
            </Button>
          </GridCol>
        </Grid>

        <Group mt={20}>
          <Button
            variant="outline"
            color="blue"
            type="submit"
            disabled={loading}
          >
            Register
          </Button>
          <Button variant="outline" color="red">
            Cancel
          </Button>
        </Group>
      </form>
    </Paper>
  );
};

export default Register;
