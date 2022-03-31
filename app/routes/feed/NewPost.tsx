import React, {useState} from "react";
import { CreatePostMutation } from "../../generated/graphql";
import { gql, useMutation } from "@apollo/client";
import { AntDesign } from '@expo/vector-icons';
import {
  Button,
  TextArea,
  Box,
  HStack,
  Spacer,
  Heading,
  Icon,
} from "native-base";

const Post = gql`
  mutation CreatePost($body: String!) {
    createPost(body: $body) {
      id
      body
      user {
        id
      }
    }
  }
`;

export function NewPost(props: any) {
  const [post, { loading }] = useMutation<CreatePostMutation>(Post);

  const [text, setText] = useState("");

  const onSubmit = () => {
    post({
      variables: {
        body: text
      }
    })
      .then((data) => {
        props.navigation.navigate("Feed");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <Box>
      <HStack p={5} alignItems="center">
        <Heading size="lg">New Post</Heading>
        <Spacer />
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
