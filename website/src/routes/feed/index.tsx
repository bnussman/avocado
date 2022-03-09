import { NewPostModal } from '../../components/NewPostModal';
import { Loading } from '../../components/Loading';
import { Error } from '../../components/Error';
import { AddIcon } from '@chakra-ui/icons';
import { gql, useQuery } from '@apollo/client';
import { GetPostsQuery, GetUserQuery } from '../../generated/graphql';
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
import { MAX_PAGE_SIZE } from '../../utils/constants';
import { User } from '../../App';
import { Waypoint } from 'react-waypoint';

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
  const { data: userData } = useQuery<GetUserQuery>(User, { fetchPolicy: 'cache-only' });
  const { data, loading, error, subscribeToMore, fetchMore } = useQuery<GetPostsQuery>(
    Posts,
    {
      variables: {
        offset: 0,
        limit: MAX_PAGE_SIZE,
      }
    }
  );
  const { isOpen, onClose, onOpen } = useDisclosure();

  const posts = data?.getPosts.data;
  const count = data?.getPosts.count || 0;
  const user = userData?.getUser;

  const canLoadMore = posts && posts.length < count;

  const loadMore = () => {
    fetchMore({
      variables: {
        offset: posts?.length || 0,
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
          getPosts: {
            data: [post, ...prev.getPosts.data],
            count: prev.getPosts.count + 1
          }
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
        {posts?.map((post) => (
          <Post key={post.id} {...post} />
        ))}
      </Stack>
      {canLoadMore && <Waypoint onEnter={loadMore}><Box><Loading /></Box></Waypoint>}
      {loading && <Loading />}
      <NewPostModal
        isOpen={isOpen}
        onClose={onClose}
      />
    </Box>
  );
}