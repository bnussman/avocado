import { ApolloClient, createHttpLink, InMemoryCache, split } from "@apollo/client";
import { createClient, ClientOptions, Client } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from "@apollo/client/utilities";
import { print } from 'graphql';
import {
  ApolloLink,
  Operation,
  FetchResult,
  Observable,
} from '@apollo/client/core';

class WebSocketLink extends ApolloLink {
  private client: Client;

  constructor(options: ClientOptions) {
    super();
    this.client = createClient(options);
  }

  public request(operation: Operation): Observable<FetchResult> {
    return new Observable((sink) => {
      return this.client.subscribe<FetchResult>(
        { ...operation, query: print(operation.query) },
        {
          next: sink.next.bind(sink),
          complete: sink.complete.bind(sink),
          error: sink.error.bind(sink),
        },
      );
    });
  }
}

const wsLink = new WebSocketLink({
  lazy: false,
  url: 'ws://localhost:3001/subscriptions',
  connectionParams: () => {
    const token = localStorage.getItem('token');
    if (token) {
      return { token };
    }
  },
});

const httpLink = createHttpLink({
  uri: 'http://localhost:3001/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');

  if (token) {
    return {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      }
    }
  }

  return { headers };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
);

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        getPosts: {
          keyArgs: false,
          // @ts-expect-error apollo is so bad
          merge(existing, incoming, { args: { offset = 0 }}) {
            // Slicing is necessary because the existing data is
            // immutable, and frozen in development.
            const merged = existing?.data ? existing.data.slice(0) : [];
            for (let i = 0; i < incoming.data.length; ++i) {
              merged[offset + i] = incoming.data[i];
            }
            return {
              ...incoming,
              data: merged,
            };
          },
        },
      },
    },
  },
});

export const client = new ApolloClient({
  link: ApolloLink.from([
    authLink,
    splitLink,
    httpLink
  ]),
  cache
});
