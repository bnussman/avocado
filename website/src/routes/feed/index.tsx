import { NewPostModal } from '../../components/NewPostModal';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';
import { AddIcon } from '@chakra-ui/icons';
import { gql, useQuery } from '@apollo/client';
import { GetPostsQuery } from '../../generated/graphql';
import { Post } from './Post';
import { useEffect } from 'react';
import { MAX_PAGE_SIZE } from '../../utils/constants';
import { Waypoint } from 'react-waypoint';
import { useUser } from '../../utils/useUser';
import { client } from '../../utils/apollo';
import {
  Flex,
  Button,
  Box,
  useDisclosure,
  Stack,
  Center,
  Text
} from '@chakra-ui/react';

export const Posts = gql`
  query GetPosts($offset: Int, $limit: Int) {
    getPosts(offset: $offset, limit: $limit) {
      data {
        id
        body
        likes
        liked
        user {
          id
          name
          username
          picture
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
      likes
      liked
      user {
        id
        name
        username
        picture
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
  const canLoadMore = Boolean(posts) && Boolean(count) && posts!.length < count;

  const getMore = () => {
    fetchMore({
      variables: {
        offset: posts?.length || 0,
        limit: MAX_PAGE_SIZE
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        return {
          getPosts: {
            data: [...prev.getPosts.data, ...fetchMoreResult.getPosts.data],
            count: fetchMoreResult.getPosts.count
          }
        };
      }
    });
  };

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
      {error && <Error error={error} />}
      {posts?.length === 0 && (
        <Center>
          <Text fontSize='xl' fontWeight='extrabold'>
            No Posts
          </Text>
        </Center>
      )}
      <Stack spacing={4}>
        {posts?.map((post) => (
          <Post key={post.id} {...post} />
        ))}
      </Stack>
      {canLoadMore && (
        <Waypoint onEnter={getMore}>
          <Box>
            <Loading />
          </Box>
        </Waypoint>
      )}
      {loading && <Loading />}
    </Box>
  );
}
