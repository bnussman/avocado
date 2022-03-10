import { NewPostModal } from '../../components/NewPostModal';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';
import { AddIcon } from '@chakra-ui/icons';
import { gql, useQuery, useSubscription } from '@apollo/client';
import { GetPostsQuery } from '../../generated/graphql';
import { Post } from './Post';
import { useEffect } from 'react';
import { MAX_PAGE_SIZE } from '../../utils/constants';
import { Waypoint } from 'react-waypoint';
import { useUser } from '../../utils/useUser';
import {
  Flex,
  Heading,
  Button,
  Spacer,
  Box,
  useDisclosure,
  Stack
} from '@chakra-ui/react';
import { client } from '../../utils/apollo';

const Posts = gql`
  query GetPosts($offset: Int, $limit: Int) {
    getPosts(offset: $offset, limit: $limit) {
      data {
        id
        body
        user {
          id
          name
          username
        }
      }
      count
    }
  }
`;

const AddPost = gql`
  subscription AddPost {
    addPost {
      id
      body
      user {
        id
        name
        username
      }
    }
  }
`;

const RemovePost = gql`
  subscription Subscription {
    removePost
  }
`;

export function Feed() {
  const { user } = useUser();
  const { isOpen, onClose, onOpen } = useDisclosure();

  const { data, loading, error, subscribeToMore, fetchMore } = useQuery<GetPostsQuery>(
    Posts,
    {
      variables: {
        offset: 0,
        limit: MAX_PAGE_SIZE,
      }
    }
  );

  const posts = data?.getPosts.data;
  const count = data?.getPosts.count || 0;
  const canLoadMore = posts && posts.length < count;

  const getMore = () => {
    fetchMore({
      variables: {
        offset: posts?.length || 0,
        limit: MAX_PAGE_SIZE
      },
    });
  };

  // useSubscription(RemovePost, {
  //   onSubscriptionData: ({ client, subscriptionData }) => {
  //     const id = subscriptionData.data.removePost;
  //     const normalizedId = client.cache.identify({ id, __typename: 'Post' });
  //     client.cache.evict({ id: normalizedId });
  //     client.cache.gc();
  //     client.writeQuery({
  //       query: Posts,
  //       data: {
  //         getPosts: {
  //           data: posts?.filter(post => post.id !== id),
  //           count: count - 1
  //         }
  //       }
  //     });
  //   }
  // });

  // useSubscription(RemovePost, {
  //   onSubscriptionData: ({ client, subscriptionData }) => {
  //     // if we don't have posts, no reason to delete anything
  //     if (!posts) return;

  //     // the id of the post to remove
  //     const id = subscriptionData.data.removePost as string;

  //     // find the index of the post in the current data array
  //     const idx = posts.findIndex(post => post.id === id) || -1;

  //     // if the post is not found (idx is -1), don't do anything. It's probably not loaded
  //     if (idx < 0) return;

  //     const data = [...posts];

  //     data.splice(idx, 1);

  //     console.log("deleting", id);

  //     client.writeQuery({
  //       query: Posts,
  //       data: {
  //         getPosts: {
  //           data,
  //           count: count - 1
  //         }
  //       }
  //     });
  //   }
  // });


  useEffect(() => {
    subscribeToMore({
      document: AddPost,
      updateQuery: (prev, { subscriptionData }) => {
        // @ts-ignore how is this type still incorrect apollo, you're trash
        const post = subscriptionData.data.addPost;
        return {
          getPosts: {
            data: [post, ...prev.getPosts.data],
            count: prev.getPosts.count + 1
          }
        };
      }
    });
    subscribeToMore({
      document: RemovePost,
      updateQuery: (prev, { subscriptionData }) => {
        // @ts-ignore how is this type still incorrect apollo, you're trash
        const id = subscriptionData.data.removePost;
        const normalizedId = client.cache.identify({ id, __typename: 'Post' });
        client.cache.evict({ id: normalizedId });
        // client.cache.gc();
        return {
          getPosts: {
            data: prev.getPosts.data?.filter(post => post.id !== id),
            count: prev.getPosts.count - 1
          }
        };
      }
    });
  }, []);

  return (
    <Box>
      <Flex mb={4}>
        <Heading>Feed</Heading>
        <Spacer />
        <Button
          isDisabled={!user}
          colorScheme="purple"
          rightIcon={<AddIcon />}
          onClick={onOpen}
        >
          New Post
        </Button>
      </Flex>
      {error && <Error error={error} />}
      <Stack spacing={4}>
        {posts?.map((post, idx) => (
          <Post key={`${post.id}-${idx}`} {...post} />
        ))}
      </Stack>
      {canLoadMore && (
        <Waypoint onEnter={getMore}>
          <Box>
            <Loading />
          </Box>
        </Waypoint>)
      }
      {loading && <Loading />}
      <NewPostModal
        isOpen={isOpen}
        onClose={onClose}
      />
    </Box>
  );
}