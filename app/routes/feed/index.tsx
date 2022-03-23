import React, { useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Post } from './Post';
import { MAX_PAGE_SIZE } from '../../utils/constants';
import { Waypoint } from 'react-waypoint';
import { client } from '../../utils/apollo';
import { GetPostsQuery } from '../../src/generated/graphql';
import { Box, Text, Button, Center, Flex, Heading, Spacer, Spinner, Stack, FlatList } from 'native-base';
import { useUser } from '../../utils/userUser';

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
      {posts?.length === 0 && (
        <Center>
          <Text fontSize='xl' fontWeight='extrabold'>
            No Posts
          </Text>
        </Center>
      )}
      {posts && (
          <FlatList
              data={posts}
              renderItem={({ item: post }) => <Post key={post.id} {...post} />}
              keyExtractor={(post) => post.id}
          />
      )}
      {canLoadMore && (
        <Waypoint onEnter={getMore}>
          <div>
            <Spinner />
          </div>
        </Waypoint>)
      }
      {loading && <Spinner />}
    </Box>
  );
}
