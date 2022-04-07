import React from 'react';
import { ApolloError, gql, useMutation, useSubscription } from '@apollo/client';
import { DeletePostMutation, GetPostsQuery, LikePostMutation, LikesSubscription } from '../../generated/graphql';
import { Unpacked } from '../../utils/types';
import { useUser } from '../../utils/userUser';
import { Entypo, AntDesign, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; 
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
    likesPost(id: $id)
  }
`;

export function Post({ body, user, id, likes: initialLikes }: Unpacked<GetPostsQuery['getPosts']['data']>) {
  const { user: me } = useUser();
  const toast = useToast();

  const [deletePost, { loading: deleteLoading }] = useMutation<DeletePostMutation>(Delete);
  const [likePost, { loading: likeLoading }] = useMutation<LikePostMutation>(Like);
  const { data } = useSubscription<LikesSubscription>(Likes, { variables: { id }});

  const likes = data?.likesPost || initialLikes;

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
    likePost({ variables: { id } })
      .then(() => {
        // @TODO update cache :O
      })
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
          <Flex justifyContent="space-between" flexDirection="row" mt={1}>
            <Button
              variant="unstyled"
              leftIcon={<Icon as={AntDesign} name="heart" size="xs" />}
              isLoading={likeLoading}
              onPress={onLike}
            >
              {String(likes)}
            </Button>
            <Button
              variant="unstyled"
              leftIcon={<Icon as={MaterialCommunityIcons} name="comment-outline" size="xs" />}
              isLoading={false}
              onPress={undefined}
            >
              {5}
            </Button>
            <Button
              variant="unstyled"
              leftIcon={<Icon as={Ionicons} name="ios-share-outline" size="xs" />}
              isLoading={false}
              onPress={undefined}
            >
            </Button>
          </Flex>
        </Box>
        {user.id === me?.id &&
        <>
          <Box>
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
        </>
        }
      </HStack>
    </Box>
  );
}
