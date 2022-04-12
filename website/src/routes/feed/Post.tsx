import { DeleteIcon, StarIcon } from '@chakra-ui/icons';
import { Unpacked } from '../../utils/types';
import { useUser } from '../../utils/useUser';
import { ApolloError, gql, OnSubscriptionDataOptions, useMutation, useSubscription } from '@apollo/client';
import {
  DeletePostMutation,
  GetPostsQuery,
  LikePostMutation,
  LikesSubscription,
  PostsResponse
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
import { client } from '../../utils/apollo';
import { Posts } from '.';
import { MAX_PAGE_SIZE } from '../../utils/constants';

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
    likesPost(id: $id) {
      liker {
        id
      }
      liked
      likes
    }
  }
`;

export function Post({ body, user, id, likes: intialLikes, liked }: Unpacked<GetPostsQuery['getPosts']['data']>) {
  const { user: me } = useUser();
  const toast = useToast();

  const onSubscriptionData = (data: OnSubscriptionDataOptions<LikesSubscription>) => {
    const subscriptionData = data.subscriptionData.data?.likesPost;

    if (!subscriptionData) {
      return console.warn("Invalid subscription data from a like event");
    }

    const oldData: GetPostsQuery | null = client.readQuery({ query: Posts, variables: { limit: MAX_PAGE_SIZE, offset: 0 } });

    if (!oldData) {
      return console.warn("No Posts Query Data");
    }

    const oldPosts: GetPostsQuery['getPosts']['data'] = [...oldData.getPosts.data];
    const idx = oldPosts.findIndex(post => post.id === id);

    if (idx < 0) {
      return console.warn(`Unable to find post ${id} in cache to mutate its likes value`);
    }

    if (subscriptionData?.liker.id === me?.id) {
      oldPosts[idx] = { ...oldPosts[idx], liked: subscriptionData.liked };
    }

    oldPosts[idx] = { ...oldPosts[idx], likes: subscriptionData.likes || 0 };

    client.writeQuery({
      query: Posts,
      data: {
        getPosts: {
          data: oldPosts,
          count: oldData.getPosts.count
        }
      }
    });
  };

  const [deletePost, { loading: deleteLoading }] = useMutation<DeletePostMutation>(Delete);
  const [likePost, { loading: likeLoading }] = useMutation<LikePostMutation>(Like);
  const { data } = useSubscription<LikesSubscription>(Likes, { variables: { id }, onSubscriptionData });

  const likes = data?.likesPost?.likes || intialLikes;

  console.log("likes", data?.likesPost.likes);

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
          <HStack>
            <Button
              aria-label={`Like post by ${user.name} (${id})`}
              colorScheme={liked ? "red" : "gray"}
              isLoading={likeLoading}
              leftIcon={<StarIcon />}
              onClick={onLike}
            >
              {likes}
            </Button>
            {user.id === me?.id &&
              <IconButton
                aria-label={`Delete post by ${user.name} (${id})`}
                colorScheme="red"
                isLoading={deleteLoading}
                icon={<DeleteIcon />}
                onClick={onDelete}
              />
            }
          </HStack>
        </HStack>
        <Box>
          {body}
        </Box>
      </Stack>
    </Box>
  );
}