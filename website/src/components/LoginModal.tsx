import { useEffect, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { LoginMutation } from "../generated/graphql";
import { Error } from "../components/Error";
import { client } from "../utils/apollo";
import { User } from "../utils/useUser";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack
} from "@chakra-ui/react";

const Login = gql`
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

export function LoginModal({ isOpen, onClose }: Props) {
  const [login, { loading, error }] = useMutation<LoginMutation>(Login);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const onClick = async () => {
    const { data } = await login({ variables: { username, password } });

    if (data) {
      localStorage.setItem('token', data.login.token);

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
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={onClick}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {error && <Error error={error} />}
            <Stack spacing={4}>
              <FormControl>
                <FormLabel htmlFor='username'>Username or Email</FormLabel>
                <Input
                  id='username'
                  type='email'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor='password'>Password</FormLabel>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              colorScheme="purple"
              onClick={onClick}
              isDisabled={!username || !password}
              isLoading={loading}
            >
              Login
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}
