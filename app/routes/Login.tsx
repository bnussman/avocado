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
        picture
      }
      token
    }
  }
`;

export function Login(props: any) {
  const [login, { loading }] = useMutation<LoginMutation>(LOGIN);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onClick = async () => {
    login({ variables: { username, password } })
      .then(async ({ data }) => {
        props.navigation.toggleDrawer();

        AsyncStorage.setItem('token', JSON.stringify({ token: data?.login.token }));

        client.writeQuery({
          query: User,
          data: { getUser: { ...data?.login.user } }
        });
      })
      .catch((error) => alert(error.message));
  };

  return (
    <Container keyboard>
      <Stack space={4} p={4} w="100%">
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
