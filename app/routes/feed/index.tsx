import React, { useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Post } from './Post';
import { MAX_PAGE_SIZE } from '../../utils/constants';
import { client } from '../../utils/apollo';
import { GetPostsQuery } from '../../src/generated/graphql';
import { Box, Text, Center, Spinner, FlatList, Divider, useColorMode } from 'native-base';
import { Container } from '../../components/Container';
import { Dimensions, RefreshControl, Vibration, View } from 'react-native';

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
  const { colorMode } = useColorMode();
  const { data, loading, error, subscribeToMore, fetchMore, refetch } = useQuery<GetPostsQuery>(
    Posts,
    {
      variables: {
        offset: 0,
        limit: MAX_PAGE_SIZE,
      },
      notifyOnNetworkStatusChange: true
    }
  );

  const posts = data?.getPosts.data;
  const count = data?.getPosts.count || 0;

  const getMore = () => {
    const canLoadMore = posts && posts.length < count;

    if (!canLoadMore) return;

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
        Vibration.vibrate(1000);
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

  if (error) {
    return <Box>Some error state</Box>;
  }

  if (!data && loading) {
    return (
      <Container alignItems="center" justifyContent="center">
        <Spinner color="gray.400" size="lg" />
      </Container>
    );
  }

  if (posts?.length === 0) {
    return (
      <Center>
        <Text>
          No Posts
        </Text>
      </Center>
    );
  }

  return (
    <Container>
      <FlatList
        data={posts}
        renderItem={({ item: post }) => <Post key={post.id} {...post} />}
        keyExtractor={(post) => post.id}
        onEndReached={getMore}
        onEndReachedThreshold={0.1}
        ItemSeparatorComponent={Divider}
        refreshControl={
          <RefreshControl
            tintColor={colorMode === "dark" ? "#cfcfcf" : undefined}
            refreshing={Boolean(data) && loading}
            onRefresh={refetch}
          />
        }
      />
    </Container>
  );
}
