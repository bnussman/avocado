import React from 'react';
import { ApolloError, gql, useMutation } from '@apollo/client';
import { DeletePostMutation, GetPostsQuery } from '../../generated/graphql';
import { Unpacked } from '../../utils/types';
import { useUser } from '../../utils/userUser';
import { Entypo } from '@expo/vector-icons'; 
import {
  Text,
  Avatar,
  Box,
  HStack,
  Stack,
  Spacer,
  IconButton,
  useToast,
  Flex,
  Menu,
  Pressable
} from 'native-base';

const Delete = gql`
  mutation DeletePost($id: String!) {
    deletePost(id: $id)
  }
`;

export function Post({ body, user, id }: Unpacked<GetPostsQuery['getPosts']['data']>) {
  const { user: me } = useUser();
  const toast = useToast();

  const [deletePost, { loading }] = useMutation<DeletePostMutation>(Delete);

  const onClick = () => {
    deletePost({ variables: { id } })
      .then(() => {
        toast.show({ status: 'success', title: 'Successfully deleted post' })
      })
      .catch((error: ApolloError) => {
        toast.show({ status: 'error', title: error.message })
    });
  };

  return (
    <Box p={4}>
      <HStack space={2}>
        <Avatar key={user.id} source={{ uri: user.picture }}/>
        <Box flexGrow={1}>
          <Text>
            <Text fontWeight="extrabold">{user.name}</Text>{' '}
            <Text fontSize="sm" color="gray.400">@{user.username}</Text>
          </Text>
          <Flex flexDirection="row" flexGrow={1}>
            <Text flex={1}>
              {body}
            </Text>
          </Flex>
        </Box>
        {user.id === me?.id &&
        <>
          <Box>
            <Menu
              w="190"
              trigger={triggerProps => (
                <Pressable accessibilityLabel="More options menu" {...triggerProps}>
                  <Entypo color="#949494" name="dots-three-horizontal" size={19} />
                </Pressable>
              )}
            >
              <Menu.Item _text={{ color: "red.400" }} onPress={onClick}>
                {loading ? "Deleteing" : "Delete"}
              </Menu.Item>
            </Menu>
          </Box>
        </>
        }
      </HStack>
    </Box>
  );
}
