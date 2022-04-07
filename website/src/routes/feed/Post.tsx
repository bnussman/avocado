import { DeleteIcon, StarIcon } from '@chakra-ui/icons';
import { Unpacked } from '../../utils/types';
import { useUser } from '../../utils/useUser';
import { ApolloError, gql, useMutation, useSubscription } from '@apollo/client';
import {
  DeletePostMutation,
  GetPostsQuery,
  LikePostMutation,
  LikesSubscription
} from '../../generated/graphql';
import {
  Text,
  Avatar,
  Box,
  HStack,
  Stack,
  Spacer,
  IconButton,
  useToast,
  Button
} from '@chakra-ui/react';

const Delete = gql`
  mutation DeletePost($id: String!) {
    deletePost(id: $id)
  }
`;

const Like = gql`
  mutation LikePost($id: String!) {
    toggleLike(id: $id)
  }
`;

const Likes = gql`
  subscription Likes($id: String!) {
    likesPost(id: $id)
  }
`;

export function Post({ body, user, id, likes: intialLikes }: Unpacked<GetPostsQuery['getPosts']['data']>) {
  const { user: me } = useUser();
  const toast = useToast();

  const [deletePost, { loading: deleteLoading }] = useMutation<DeletePostMutation>(Delete);
  const [likePost, { loading: likeLoading }] = useMutation<LikePostMutation>(Like);
  const { data } = useSubscription<LikesSubscription>(Likes, { variables: { id }});

  const likes = data?.likesPost || intialLikes;

  const onDelete = () => {
    deletePost({ variables: { id } })
      .then(() => {
        toast({ status: 'success', description: 'Successfully deleted post' })
      })
      .catch((error: ApolloError) => {
        toast({ status: 'error', description: error.message })
      });
  };

  const onLike = () => {
    likePost({ variables: { id } })
      .then(() => {
        // @TODO update cache :O
      })
      .catch((error: ApolloError) => {
        toast({ status: 'error', description: error.message })
      });
  };

  return (
    <Box borderWidth='1px' borderRadius='lg' p={8}>
      <Stack spacing={4}>
        <HStack>
          <Avatar src={user.picture} />
          <Box>
            <Text fontWeight="extrabold">{user.name}</Text>
            <Text fontSize="sm">@{user.username}</Text>
          </Box>
          <Spacer />
          {user.id === me?.id &&
            <HStack>
              <Button
                aria-label={`Like post by ${user.name} (${id})`}
                colorScheme="pink"
                isLoading={likeLoading}
                leftIcon={<StarIcon />}
                onClick={onLike}
              >
                {likes}
              </Button>
              <IconButton
                aria-label={`Delete post by ${user.name} (${id})`}
                colorScheme="red"
                isLoading={deleteLoading}
                icon={<DeleteIcon />}
                onClick={onDelete}
              />
            </HStack>
          }
        </HStack>
        <Box>
          {body}
        </Box>
      </Stack>
    </Box>
  );
}
