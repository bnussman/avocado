import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { LoginMutation } from "../generated/graphql";
import { client } from "../utils/apollo";
import { User } from "../App";
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function Login({ isOpen, onClose }: Props) {
  const [login, { loading, error }] = useMutation<LoginMutation>(LOGIN);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onClick = async () => {
    const { data } = await login({ variables: { username, password } });

    if (data) {
      await AsyncStorage.setItem('token', data.login.token);

      client.writeQuery({
        query: User,
        data: { getUser: { ...data?.login.user } }
      });

      const oq = Array.from(client.getObservableQueries().values());
      const toRefetch = oq.map((query) => query.queryName).filter(queryName => queryName !== 'GetUser' && queryName !== undefined) as string[];

      client.refetchQueries({ include: toRefetch });

      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setUsername("");
      setPassword("");
    }
  }, [isOpen]);

  return (
      <Stack space={4}>
          {error && <Text>test</Text>}
          <FormControl>
              <FormControl.Label htmlFor='username'>Username or Email</FormControl.Label>
              <Input
                  type='email'
                  value={username}
                  onChangeText={(value) => setUsername(value)}
              />
          </FormControl>
          <FormControl>
              <FormControl.Label htmlFor='password'>Password</FormControl.Label>
              <Input
                  type='password'
                  value={password}
                  onChangeText={(value) => setPassword(value)}
              />
          </FormControl>
          <Button
              colorScheme="purple"
              onPress={onClick}
              isDisabled={!username || !password}
              isLoading={loading}
          >
              Login
          </Button>
      </Stack>
  );
}
