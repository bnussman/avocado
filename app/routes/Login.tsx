import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { LoginMutation } from "../generated/graphql";
import { client } from "../utils/apollo";
import { User } from "../utils/userUser";
import { Container } from "../components/Container";
import {
  Button,
  FormControl,
  Input,
  Stack,
  Text
} from "native-base";

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      user {
        id
        first
        last
        name
        username
        email
      }
      token
    }
  }
`;

export function Login() {
  const [login, { loading, error }] = useMutation<LoginMutation>(LOGIN);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onClick = async () => {
    const { data } = await login({ variables: { username, password } });

    if (data) {
      await AsyncStorage.setItem('token', JSON.stringify({ token: data.login.token }));

      client.writeQuery({
        query: User,
        data: { getUser: { ...data?.login.user } }
      });
    }
  };

  return (
    <Container keyboard>
      <Stack space={4} p={4} w="100%">
        {error && <Text>test</Text>}
        <FormControl>
          <FormControl.Label htmlFor='username'>Username or Email</FormControl.Label>
          <Input
            size="lg"
            type='email'
            value={username}
            onChangeText={(value) => setUsername(value)}
          />
        </FormControl>
        <FormControl>
          <FormControl.Label htmlFor='password'>Password</FormControl.Label>
          <Input
            size="lg"
            type='password'
            value={password}
            onChangeText={(value) => setPassword(value)}
          />
        </FormControl>
        <Button
          onPress={onClick}
          isDisabled={!username || !password}
          isLoading={loading}
        >
          Login
        </Button>
      </Stack>
    </Container>
  );
}
