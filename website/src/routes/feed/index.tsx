import { NewPostModal } from '../../components/NewPostModal';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';
import { AddIcon, WarningIcon } from '@chakra-ui/icons';
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
  Heading,
  Button,
  Spacer,
  Box,
  useDisclosure,
  Stack,
  Center,
  Text
} from '@chakra-ui/react';

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

        const idx = prev.getPosts.data.findIndex(post => post.id === id);

        if (!id || !normalizedId || idx === -1) return prev;

        client.cache.evict({ id: normalizedId });

        const data = [...prev.getPosts.data]

        data.splice(idx, 1);

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
      {posts?.length === 0 && (
      <Center>
        <Text
          bgGradient='linear(to-tr, #7928CA, green.200)'
          bgClip='text'
          fontSize='3xl'
          fontWeight='extrabold'
        >
          No Posts
        </Text>
      </Center>)}
      <Stack spacing={4}>
        {posts?.map((post, idx) => (
          <Post key={`${post.id}-${idx}`} {...post} />
        ))}
      </Stack>
      {canLoadMore && (
        <Waypoint onEnter={getMore}>
          <Box>``
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