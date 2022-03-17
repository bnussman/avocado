import { ApolloError, gql, useMutation } from '@apollo/client';
import { DeletePostMutation, GetPostsQuery } from '../../generated/graphql';
import { Unpacked } from '../../utils/types';
import { useUser } from '../../utils/userUser';
import {
  Text,
  Avatar,
  Box,
  HStack,
  Stack,
  Spacer,
  IconButton,
  useToast
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
    <Box borderWidth='1px' borderRadius='lg' p={8}>
      <Stack space={4}>
        <HStack>
          <Avatar />
          <Box>
            <Text fontWeight="extrabold">{user.name}</Text>
            <Text fontSize="sm">@{user.username}</Text>
          </Box>
          <Spacer />
          {user.id === me?.id &&
            <IconButton
              aria-label={`Delete post by ${user.name} (${id})`}
              colorScheme="red"
              onPress={onClick}
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
