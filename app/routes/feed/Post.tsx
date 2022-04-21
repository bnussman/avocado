import React from 'react';
import { ApolloError, gql, OnSubscriptionDataOptions, useMutation, useSubscription } from '@apollo/client';
import { DeletePostMutation, GetPostsQuery, LikePostMutation, LikesSubscription } from '../../generated/graphql';
import { Unpacked } from '../../utils/types';
import { useUser } from '../../utils/userUser';
import { Entypo, AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; 
import { client } from '../../utils/apollo';
import { MAX_PAGE_SIZE } from '../../utils/constants';
import { Posts } from '.';
import {
  Text,
  Avatar,
  Box,
  HStack,
  useToast,
  Flex,
  Menu,
  Pressable,
  Icon,
  Button
} from 'native-base';

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

export function Post({ body, user, id, likes, liked }: Unpacked<GetPostsQuery['getPosts']['data']>) {
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

    if ((oldPosts[idx].likes === subscriptionData.likes) && (oldPosts[idx].liked === subscriptionData.liked)) {
      return;
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
  const [likePost] = useMutation<LikePostMutation>(Like);
  const { data } = useSubscription<LikesSubscription>(Likes, { variables: { id }, onSubscriptionData });

  const onDelete = () => {
    deletePost({ variables: { id } })
      .then(() => {
        toast.show({ status: 'success', title: 'Successfully deleted post' })
      })
      .catch((error: ApolloError) => {
        toast.show({ status: 'error', title: error.message })
    });
  };

  const onLike = () => {
    if (!me) {
      return;
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

    const wasLiked = oldPosts[idx].liked;
    const oldLikes = oldPosts[idx].likes;
    const newLiked = !wasLiked;
    const newLikes = wasLiked ? oldLikes - 1 : oldLikes + 1;

    if ((oldPosts[idx].likes === newLikes) && (oldPosts[idx].liked === newLiked)) {
      return;
    }

    oldPosts[idx] = { ...oldPosts[idx], liked: newLiked };
    oldPosts[idx] = { ...oldPosts[idx], likes: newLikes };

    client.writeQuery({
      query: Posts,
      data: {
        getPosts: {
          data: oldPosts,
          count: oldData.getPosts.count
        }
      }
    });

    likePost({ variables: { id } })
      .catch((error: ApolloError) => {
        toast.show({ status: 'error', title: error.message })
      });
  };

  return (
    <Box p={4} pb={2}>
      <HStack space={2}>
        <Avatar key={user.id} source={{ uri: user.picture }} />
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
        <Button
          variant="unstyled"
          leftIcon={<Icon as={AntDesign} name={liked ? "heart" : "hearto"} size="xs" color={liked ? "red.500" : undefined} />}
          onPress={onLike}
          isDisabled={!Boolean(user)}
        >
          {String(likes)}
        </Button>
        {user.id === me?.id &&
          <Box alignSelf="center">
            <Menu
              key={`menu-${id}`}
              w="190"
              trigger={triggerProps => (
                <Pressable accessibilityLabel="More options menu" {...triggerProps}>
                  <Entypo color="#949494" name="dots-three-horizontal" size={19} />
                </Pressable>
              )}
            >
              <Menu.Item _text={{ color: "red.400" }} onPress={onDelete}>
                {deleteLoading ? "Deleteing" : "Delete"}
              </Menu.Item>
            </Menu>
          </Box>
        }
      </HStack>
    </Box>
  );
}
