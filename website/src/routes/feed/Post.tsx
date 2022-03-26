import { DeleteIcon } from '@chakra-ui/icons';
import { DeletePostMutation, GetPostsQuery } from '../../generated/graphql';
import { Unpacked } from '../../utils/types';
import { useUser } from '../../utils/useUser';
import { ApolloError, gql, useMutation } from '@apollo/client';
import {
  Text,
  Avatar,
  Box,
  HStack,
  Stack,
  Spacer,
  IconButton,
  useToast
} from '@chakra-ui/react';

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
        toast({ status: 'success', description: 'Successfully deleted post' })
      })
      .catch((error: ApolloError) => {
        toast({ status: 'error', description: error.message })
    });
  };

  return (
    <Box borderWidth='1px' borderRadius='lg' p={8}>
      <Stack spacing={4}>
        <HStack>
          <Avatar src={user.picture}/>
          <Box>
            <Text fontWeight="extrabold">{user.name}</Text>
            <Text fontSize="sm">@{user.username}</Text>
          </Box>
          <Spacer />
          {user.id === me?.id &&
            <IconButton
              aria-label={`Delete post by ${user.name} (${id})`}
              colorScheme="red"
              isLoading={loading}
              icon={<DeleteIcon />}
              onClick={onClick}
            />
          }
        </HStack>
        <Box>
          {body}
        </Box>
      </Stack>
    </Box>
  );
}
