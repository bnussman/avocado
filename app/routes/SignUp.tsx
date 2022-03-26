// @ts-expect-error yeah
import * as mime from "react-native-mime-types";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { gql, useMutation } from "@apollo/client";
import { Scalars, SignupMutation, SignupMutationVariables } from "../generated/graphql";
import { client } from "../utils/apollo";
import { useForm } from "react-hook-form";
import { isValidationError, useValidationErrors } from "../utils/useValidationErrors";
import { Container } from "../components/Container";
import { Input } from "../components/Input";
import { User } from "../utils/userUser";
import { useState } from "react";
import { isMobile } from "../utils/constants";
import { ReactNativeFile } from "apollo-upload-client";
import { TouchableOpacity } from "react-native";
import Profile from "../assets/profile.png";
import {
  Button,
  FormControl,
  Stack,
  Text,
  HStack,
  Avatar,
  Spacer
} from "native-base";

const SIGNUP = gql`
  mutation Signup($first: String!, $last: String!, $email: String!, $username: String!, $password: String!, $picture: Upload!) {
    signup(first: $first, last: $last, email: $email, username: $username, password: $password, picture: $picture) {
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

export function generateRNFile(uri: string, name: string) {
  return uri
    ? new ReactNativeFile({
        uri,
        type: mime.lookup(uri) || "image",
        name,
      })
    : null;
}

let picture: Scalars["Upload"];

export function SignUp() {
  const [signup, { loading, error }] = useMutation<SignupMutation>(SIGNUP);

  const [photo, setPhoto] = useState<any>();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupMutationVariables>({ mode: "onChange" });

    const chooseProfilePhoto = async () => {
    setPhoto(undefined);
    picture = null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      allowsEditing: true,
      aspect: [4, 3],
      base64: false,
    });

    if (result.cancelled) {
      return;
    }

    if (!isMobile) {
      const res = await fetch(result.uri);
      const blob = await res.blob();
      const fileType = blob.type.split("/")[1];
      const file = new File([blob], "photo." + fileType);
      picture = file;
      setPhoto(result);
    } else {
      if (!result.cancelled) {
        setPhoto(result);
        const file = generateRNFile(result.uri, "file.jpg");
        picture = file;
      }
    }
  };

  const validationErrors = useValidationErrors<SignupMutationVariables>(error);

  const onSubmit = handleSubmit(async (variables) => {
    signup({ variables: { ...variables, picture: picture } }).then(async ({ data }) => {
      await AsyncStorage.setItem('token', JSON.stringify({ token: data?.signup.token }));

      client.writeQuery({
        query: User,
        data: { getUser: { ...data?.signup.user } }
      });
    }).catch((e) => {
      if (!isValidationError(e)) {
        alert(e);
      }
    });

  });

  return (
    <Container keyboard>
      <Stack space={2} p={4}>
        {error && !validationErrors ? <Text>{error.message}</Text>: null}
        <HStack alignItems="center">
          <Stack space={2} w="70%">
            <FormControl isInvalid={Boolean(errors.first) || Boolean(validationErrors?.first)}>
              <FormControl.Label htmlFor='first'>First name</FormControl.Label>
              <Input
                size="lg"
                placeholder='John'
                name="first"
                control={control}
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
                name="last"
                control={control}
              />
              <FormControl.ErrorMessage>
                {errors.last && errors.last.message}
                {validationErrors?.last && validationErrors?.last[0]}
              </FormControl.ErrorMessage>
            </FormControl>
          </Stack>
          <Spacer />
          <TouchableOpacity onPress={chooseProfilePhoto}>
            <Avatar source={photo ? photo : Profile} size="xl" />
          </TouchableOpacity>
        </HStack>
        <FormControl isInvalid={Boolean(errors.email) || Boolean(validationErrors?.email)}>
          <FormControl.Label htmlFor='email'>Email</FormControl.Label>
          <Input
            size="lg"
            placeholder="john@doe.com"
            name="email"
            control={control}
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
            name="username"
            control={control}
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
            placeholder="••••••••••"
            type="password"
            name="password"
            control={control}
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
          isDisabled={!photo}
        >
          Sign Up
        </Button>
      </Stack>
    </Container>
  );
}
