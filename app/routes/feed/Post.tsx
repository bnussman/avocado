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
        toast.show({ status: 'success', title: 'Successfully deleted post' })
      })
      .catch((error: ApolloError) => {
        toast.show({ status: 'error', title: error.message })
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
              p={1}
              onPress={onClick}
              icon={<Entypo color="#949494" name="dots-three-horizontal" size={16} />}
              _pressed={{ bg: "transparent" }}
            />
          }
        </HStack>
      </Stack>
    </Box>
  );
}
