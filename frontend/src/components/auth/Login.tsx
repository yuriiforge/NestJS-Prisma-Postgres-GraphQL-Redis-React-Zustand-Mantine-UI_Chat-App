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
import type { LoginUserMutation } from '../../gql/graphql';
import { LOGIN_USER } from '../../graphql/mutations/Login';
import { useGeneralStore } from '../../stores/generalStore';
import { useUserStore } from '../../stores/userStore';

interface Props {
  toggleForm: () => void;
}

const Login = ({ toggleForm }: Props) => {
  const [loginUser, { loading }] = useMutation<LoginUserMutation>(LOGIN_USER);
  const setUser = useUserStore((state) => state.setUser);
  const setIsLoginOpen = useGeneralStore((state) => state.toggleLoginModal);
  const toggleLoginModal = useGeneralStore((state) => state.toggleLoginModal);

  const [errors, setErrors] = useState<GraphQLErrorExtensions>({});
  const [invalidCredentials, setInvalidCredentials] = useState('');
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value: string) => (value.includes('@') ? null : 'Invalid email'),
      password: (value: string) =>
        value.trim().length >= 3
          ? null
          : 'Password must be at least 3 characters',
    },
  });

  const handleLogin = async () => {
    await loginUser({
      variables: {
        email: form.values.email,
        password: form.values.password,
      },
      onCompleted: (data) => {
        setErrors({});
        if (data?.login.user) {
          setUser({
            id: data?.login.user.id,
            email: data?.login.user.email,
            fullname: data?.login.user.fullname,
            avatarUrl: data?.login.user.avatarUrl,
          });
          setIsLoginOpen();
        }
      },
    }).catch((err) => {
      setErrors(err.graphQLErrors[0].extensions);
      if (err.graphQLErrors[0].extensions?.invalidCredentials)
        setInvalidCredentials(
          err.graphQLErrors[0].extensions.invalidCredentials
        );
      useGeneralStore.setState({ isLoginModalOpen: true });
    });
  };
  return (
    <Paper>
      <Text size="xl" ta="center">
        Login
      </Text>
      <form
        onSubmit={form.onSubmit(() => {
          handleLogin();
        })}
      >
        <Grid style={{ marginTop: 20 }}>
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
            <Text c="red">{invalidCredentials}</Text>
          </GridCol>
          <GridCol span={12}>
            <Button pl={0} variant="subtle" onClick={toggleForm}>
              Not registered yet? Register here
            </Button>
          </GridCol>
        </Grid>
        <Group style={{ marginTop: 20 }}>
          <Button
            variant="outline"
            color="blue"
            type="submit"
            disabled={loading}
          >
            Login
          </Button>
          <Button variant="outline" color="red" onClick={toggleLoginModal}>
            Cancel
          </Button>
        </Group>
      </form>
    </Paper>
  );
};

export default Login;
