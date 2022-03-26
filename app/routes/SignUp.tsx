import AsyncStorage from "@react-native-async-storage/async-storage";
import { gql, useMutation } from "@apollo/client";
import { SignupMutation, SignupMutationVariables } from "../generated/graphql";
import { client } from "../utils/apollo";
import { useForm } from "react-hook-form";
import { useValidationErrors } from "../utils/useValidationErrors";
import { User } from "../utils/userUser";
import { Container } from "../components/Container";
import {
  Button,
  FormControl,
  Input,
  Stack
} from "native-base";

const SIGNUP = gql`
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

export function SignUp() {
  const [signup, { loading, error }] = useMutation<SignupMutation>(SIGNUP);

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<SignupMutationVariables>();

  const validationErrors = useValidationErrors<SignupMutationVariables>(error);

  const onSubmit = handleSubmit(async (variables) => {
    const { data } = await signup({ variables });

    if (data) {
      await AsyncStorage.setItem('token', JSON.stringify({ token: data.signup.token }));

      client.writeQuery({
        query: User,
        data: { getUser: { ...data?.signup.user } }
      });
    }
  });

  return (
    <Container keyboard>
      <Stack space={2} p={4}>
        {error && !validationErrors ? error : null}
        <FormControl isInvalid={Boolean(errors.first) || Boolean(validationErrors?.first)}>
          <FormControl.Label htmlFor='first'>First name</FormControl.Label>
          <Input
            size="lg"
            placeholder='John'
            {...register('first', {
              required: 'This is required',
            })}
          />
          <FormControl.ErrorMessage>
            {errors.first && errors.first.message}
            {validationErrors?.first && validationErrors?.first[0]}
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(errors.last) || Boolean(validationErrors?.last)}>
          <FormControl.Label htmlFor='last'>Last name</FormControl.Label>
          <Input
            size="lg"
            placeholder='Doe'
            {...register('last', {
              required: 'This is required',
            })}
          />
          <FormControl.ErrorMessage>
            {errors.last && errors.last.message}
            {validationErrors?.last && validationErrors?.last[0]}
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(errors.email) || Boolean(validationErrors?.email)}>
          <FormControl.Label htmlFor='email'>Email</FormControl.Label>
          <Input
            size="lg"
            placeholder='john@doe.com'
            {...register('email', {
              required: 'This is required',
            })}
          />
          <FormControl.ErrorMessage>
            {errors.email && errors.email.message}
            {validationErrors?.email && validationErrors?.email[0]}
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(errors.username) || Boolean(validationErrors?.username)}>
          <FormControl.Label htmlFor='username'>Username</FormControl.Label>
          <Input
            size="lg"
            placeholder='johndoe'
            {...register('username', {
              required: 'This is required',
            })}
          />
          <FormControl.ErrorMessage>
            {errors.username && errors.username.message}
            {validationErrors?.username && validationErrors?.username[0]}
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(errors.password) || Boolean(validationErrors?.password)}>
          <FormControl.Label htmlFor='password'>Password</FormControl.Label>
          <Input
            size="lg"
            placeholder='••••••••••'
            type='password'
            {...register('password', {
              required: 'This is required',
            })}
          />
          <FormControl.ErrorMessage>
            {errors.password && errors.password.message}
            {validationErrors?.password && validationErrors?.password[0]}
          </FormControl.ErrorMessage>
        </FormControl>
        <Button
          mt={2}
          isLoading={isSubmitting || loading}
          onPress={onSubmit}
        >
          Sign Up
        </Button>
      </Stack>
    </Container>
  );
}
