import { gql, useMutation } from "@apollo/client";
import { SignupMutation, SignupMutationVariables } from "../generated/graphql";
import { Error } from "../components/Error";
import { client } from "../utils/apollo";
import { User } from "../App";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useValidationErrors } from "../utils/useValidationErrors";
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
  const [signup, { error }] = useMutation<SignupMutation>(SignUp);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupMutationVariables>();

  const validationErrors = useValidationErrors<SignupMutationVariables>(error);

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

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={onSubmit}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign Up</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {error && !validationErrors ? <Error error={error} /> : null}
            <Stack spacing={2}>
              <FormControl isInvalid={Boolean(errors.first) || Boolean(validationErrors?.first)}>
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
                  {validationErrors?.first && validationErrors?.first[0]}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={Boolean(errors.last) || Boolean(validationErrors?.last)}>
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
                  {validationErrors?.last && validationErrors?.last[0]}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={Boolean(errors.email) || Boolean(validationErrors?.email)}>
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
                  {validationErrors?.email && validationErrors?.email[0]}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={Boolean(errors.username) || Boolean(validationErrors?.username)}>
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
                  {validationErrors?.username && validationErrors?.username[0]}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={Boolean(errors.password) || Boolean(validationErrors?.password)}>
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
                  {validationErrors?.password && validationErrors?.password[0]}
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