import { gql, useMutation } from "@apollo/client";
import { SignupMutation, SignupMutationVariables } from "../generated/graphql";
import { Error } from "../components/Error";
import { client } from "../utils/apollo";
import { User } from "../App";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack
} from "@chakra-ui/react";

const SignUp = gql`
  mutation Signup($first: String!, $last: String!, $email: String!, $username: String!, $password: String!) {
    signup(first: $first, last: $last, email: $email, username: $username, password: $password) {
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

export function SignupModal({ isOpen, onClose }: Props) {
  const [signup, { error, loading }] = useMutation<SignupMutation>(SignUp, { errorPolicy: 'all' });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignupMutationVariables>();

  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const onSubmit = handleSubmit(async (variables) => {
    const { data } = await signup({ variables });

    if (data) {
      localStorage.setItem('token', data.signup.token);

      client.writeQuery({
        query: User,
        data: { getUser: { ...data?.signup.user } }
      });

      onClose();
    }
  });

  if (error) {
    console.log(JSON.parse(error.message));
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign Up</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {error && <Error error={error} />}
            <Stack spacing={2}>
              <FormControl isInvalid={Boolean(errors.first)}>
                <FormLabel htmlFor='first'>First name</FormLabel>
                <Input
                  id='first'
                  placeholder='John'
                  {...register('first', {
                    required: 'This is required',
                  })}
                />
                <FormErrorMessage>
                  {errors.first && errors.first.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={Boolean(errors.last)}>
                <FormLabel htmlFor='last'>Last name</FormLabel>
                <Input
                  id='last'
                  placeholder='Doe'
                  {...register('last', {
                    required: 'This is required',
                  })}
                />
                <FormErrorMessage>
                  {errors.last && errors.last.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={Boolean(errors.email)}>
                <FormLabel htmlFor='email'>Email</FormLabel>
                <Input
                  id='email'
                  placeholder='john@doe.com'
                  {...register('email', {
                    required: 'This is required',
                  })}
                />
                <FormErrorMessage>
                  {errors.email && errors.email.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={Boolean(errors.username)}>
                <FormLabel htmlFor='username'>Username</FormLabel>
                <Input
                  id='username'
                  placeholder='johndoe'
                  {...register('username', {
                    required: 'This is required',
                  })}
                />
                <FormErrorMessage>
                  {errors.username && errors.username.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={Boolean(errors.password)}>
                <FormLabel htmlFor='password'>Password</FormLabel>
                <InputGroup>
                  <Input
                    id='password'
                    placeholder='••••••••••'
                    type={show ? 'text' : 'password'}
                    {...register('password', {
                      required: 'This is required',
                    })}
                  />
                  <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleClick}>
                      {show ? 'Hide' : 'Show'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>
                  {errors.password && errors.password.message}
                </FormErrorMessage>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              colorScheme='blue'
              isLoading={isSubmitting}
            >
              Sign Up
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}