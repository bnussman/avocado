import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
};

export type Auth = {
  __typename?: 'Auth';
  token: Scalars['String'];
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  createPost: Post;
  deletePost: Scalars['Boolean'];
  deleteToken: Scalars['Boolean'];
  login: Auth;
  logout: Scalars['Boolean'];
  signup: Auth;
};


export type MutationCreatePostArgs = {
  body: Scalars['String'];
};


export type MutationDeletePostArgs = {
  id: Scalars['String'];
};


export type MutationDeleteTokenArgs = {
  id: Scalars['String'];
};


export type MutationLoginArgs = {
  password: Scalars['String'];
  username: Scalars['String'];
};


export type MutationSignupArgs = {
  email: Scalars['String'];
  first: Scalars['String'];
  last: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
};

export type Post = {
  __typename?: 'Post';
  body: Scalars['String'];
  created: Scalars['DateTime'];
  id: Scalars['String'];
  user: User;
};

export type PostsResponse = {
  __typename?: 'PostsResponse';
  count: Scalars['Int'];
  data: Array<Post>;
};

export type Query = {
  __typename?: 'Query';
  getPosts: PostsResponse;
  getTokens: TokensResponse;
  getUser: User;
};


export type QueryGetPostsArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<Scalars['String']>;
};


export type QueryGetTokensArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<Scalars['String']>;
};


export type QueryGetUserArgs = {
  id?: InputMaybe<Scalars['String']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  addPost: Post;
  removePost: Scalars['String'];
};

export type Token = {
  __typename?: 'Token';
  created: Scalars['DateTime'];
  id: Scalars['String'];
  updated: Scalars['DateTime'];
  user: User;
};

export type TokensResponse = {
  __typename?: 'TokensResponse';
  count: Scalars['Int'];
  data: Array<Token>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  first: Scalars['String'];
  id: Scalars['String'];
  last: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['String'];
  posts: Array<Post>;
  tokens: Array<Token>;
  username: Scalars['String'];
};

export type GetPostsQueryVariables = Exact<{
  offset?: InputMaybe<Scalars['Int']>;
  limit?: InputMaybe<Scalars['Int']>;
}>;


export type GetPostsQuery = { __typename?: 'Query', getPosts: { __typename?: 'PostsResponse', count: number, data: Array<{ __typename?: 'Post', id: string, body: string, user: { __typename?: 'User', id: string, name: string, username: string } }> } };

export type AddPostSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AddPostSubscription = { __typename?: 'Subscription', addPost: { __typename?: 'Post', id: string, body: string, user: { __typename?: 'User', id: string, name: string, username: string } } };

export type SubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type SubscriptionSubscription = { __typename?: 'Subscription', removePost: string };


export const GetPostsDocument = gql`
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

/**
 * __useGetPostsQuery__
 *
 * To run a query within a React component, call `useGetPostsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPostsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPostsQuery({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetPostsQuery(baseOptions?: Apollo.QueryHookOptions<GetPostsQuery, GetPostsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPostsQuery, GetPostsQueryVariables>(GetPostsDocument, options);
      }
export function useGetPostsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPostsQuery, GetPostsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPostsQuery, GetPostsQueryVariables>(GetPostsDocument, options);
        }
export type GetPostsQueryHookResult = ReturnType<typeof useGetPostsQuery>;
export type GetPostsLazyQueryHookResult = ReturnType<typeof useGetPostsLazyQuery>;
export type GetPostsQueryResult = Apollo.QueryResult<GetPostsQuery, GetPostsQueryVariables>;
export const AddPostDocument = gql`
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

/**
 * __useAddPostSubscription__
 *
 * To run a query within a React component, call `useAddPostSubscription` and pass it any options that fit your needs.
 * When your component renders, `useAddPostSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAddPostSubscription({
 *   variables: {
 *   },
 * });
 */
export function useAddPostSubscription(baseOptions?: Apollo.SubscriptionHookOptions<AddPostSubscription, AddPostSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<AddPostSubscription, AddPostSubscriptionVariables>(AddPostDocument, options);
      }
export type AddPostSubscriptionHookResult = ReturnType<typeof useAddPostSubscription>;
export type AddPostSubscriptionResult = Apollo.SubscriptionResult<AddPostSubscription>;
export const SubscriptionDocument = gql`
    subscription Subscription {
  removePost
}
    `;

/**
 * __useSubscriptionSubscription__
 *
 * To run a query within a React component, call `useSubscriptionSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscriptionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscriptionSubscription({
 *   variables: {
 *   },
 * });
 */
export function useSubscriptionSubscription(baseOptions?: Apollo.SubscriptionHookOptions<SubscriptionSubscription, SubscriptionSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<SubscriptionSubscription, SubscriptionSubscriptionVariables>(SubscriptionDocument, options);
      }
export type SubscriptionSubscriptionHookResult = ReturnType<typeof useSubscriptionSubscription>;
export type SubscriptionSubscriptionResult = Apollo.SubscriptionResult<SubscriptionSubscription>;