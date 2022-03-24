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
  Flex
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
        toast.show({ status: 'success', description: 'Successfully deleted post' })
      })
      .catch((error: ApolloError) => {
        toast.show({ status: 'error', description: error.message })
    });
  };

  return (
    <Box p={4}>
      <Stack space={2}>
        <HStack space={2}>
          <Avatar />
          <Box>
            <Text>
              <Text fontWeight="extrabold">{user.name}</Text>{' '}
              <Text fontSize="sm" color="gray.400">@{user.username}</Text>
            </Text>
            <Flex flexDirection="row">
              <Text flex={1}>
                {body}
              </Text>
            </Flex>
          </Box>
          <Spacer />
          {user.id === me?.id &&
            <IconButton
              aria-label={`Delete post by ${user.name} (${id})`}
              colorScheme="red"
              icon={<Entypo name="dots-three-horizontal" size={18} color="black" />}
              onPress={onClick}
            />
          }
        </HStack>
      </Stack>
    </Box>
  );
}
