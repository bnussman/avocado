import { NewPostModal } from '../../components/NewPostModal';
import { MAX_PAGE_SIZE } from '../../utils/constants';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';
import { AddIcon } from '@chakra-ui/icons';
import { gql, useQuery } from '@apollo/client';
import { GetPostsQuery } from '../../generated/graphql';
import { Post } from './Post';
import { useEffect } from 'react';
import {
  Flex,
  Heading,
  Button,
  Spacer,
  Box,
  useDisclosure,
  Stack
} from '@chakra-ui/react';

const Posts = gql`
  query GetPosts($offset: Int, $limit: Int) {
    getPosts(offset: $offset, limit: $limit) {
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

const NewPost = gql`
  subscription NewPost {
    newPost {
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

let subscription: any;

export function Feed() {
  const { data, loading, error, subscribeToMore, fetchMore } = useQuery<GetPostsQuery>(
    Posts,
    {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
      variables: {
        limit: MAX_PAGE_SIZE,
      }
    }
  );
  const { isOpen, onClose, onOpen } = useDisclosure();

  const posts = data?.getPosts;

  const loadMore = () => {
    console.log("should see", posts?.length);
    fetchMore({
      variables: {
        offset: data?.getPosts.length || 0,
        limit: MAX_PAGE_SIZE
      },
    });
  };

  useEffect(() => {
    subscribeToMore({
      document: NewPost,
      updateQuery: (prev, { subscriptionData }) => {
        // @ts-ignore how is this type still incorrect apollo, you're trash
        const post = subscriptionData.data.newPost;
        return {
          getPosts: [post, ...prev.getPosts],
        };
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Box>
      <Flex mb={4}>
        <Heading>Feed</Heading>
        <Spacer />
        <Button
          colorScheme="purple"
          rightIcon={<AddIcon />}
          onClick={onOpen}
        >
          New Post
        </Button>
      </Flex>
      {error && <Error error={error} />}
      {loading && <Loading />}
      <Stack spacing={4}>
        {posts?.map((post) => (
          <Post key={post.id} {...post} />
        ))}
        {<Button onClick={loadMore}>Load More</Button>}
      </Stack>
      <NewPostModal
        isOpen={isOpen}
        onClose={onClose}
      />
    </Box>
  );
}