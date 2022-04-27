import React, { useMemo, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { isMobile } from "../../utils/constants";
import { generateRNFile } from '../SignUp';
import { getPrintableValidationError } from "../../utils/useValidationErrors";
import { CreatePostMutation, Scalars } from "../../generated/graphql";
import { gql, useMutation } from "@apollo/client";
import { AntDesign, Ionicons } from '@expo/vector-icons';
import {
  Button,
  TextArea,
  Box,
  HStack,
  Spacer,
  Heading,
  Icon,
  Image,
} from "native-base";

const Post = gql`
  mutation CreatePost($body: String!, $pictures: [Upload!]) {
    createPost(body: $body, pictures: $pictures) {
      id
      body
      user {
        id
      }
    }
  }
`;

let picture: Scalars["Upload"];

export function NewPost(props: any) {
  const [post, { loading }] = useMutation<CreatePostMutation>(Post);

  const [text, setText] = useState("");
  const [image, setImage] = useState<ImagePicker.ImageInfo>();

  const pickImage = async () => {
    setImage(undefined);
    picture = null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
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
      setImage(result);
    } else {
      if (!result.cancelled) {
        setImage(result);
        const file = generateRNFile(result.uri, "file.jpg");
        picture = file;
      }
    }
  };

  const onSubmit = () => {
    post({
      variables: {
        body: text,
        pictures: picture ? [picture] : []
      }
    })
      .then(() => {
        props.navigation.navigate("Feed");
      })
      .catch((error) => {
        alert(getPrintableValidationError(error));
      });
  };

  const Pictures = useMemo(() => {
    if (!image) return null;
    return (
      <Image
        mb={2}
        key={image.uri}
        alt={image.uri}
        source={{ uri: image?.uri }}
        rounded="xl"
        size="md"
      />
    );
  }, [image]);

  return (
    <Box>
      <HStack p={5} alignItems="center">
        <Heading size="lg">New Post</Heading>
        <Spacer />
        <Button
          mr={3}
          variant="outline"
          borderRadius="lg"
          onPress={pickImage}
          rightIcon={<Icon as={Ionicons} name="ios-attach" size="xs" />}
        >
          Attach
        </Button>
        <Button
          borderRadius="lg"
          isLoading={loading}
          onPress={onSubmit}
          rightIcon={<Icon as={AntDesign} name="plus" size="xs" />}
        >
          Post
        </Button>
      </HStack>
      <Box px={6}>
        {Pictures}
        <TextArea
          h={300}
          fontSize="xl"
          borderWidth={0}
          onChangeText={(value) => setText(value)}
          autoFocus
        />
      </Box>
    </Box>
  );
}