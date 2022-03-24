import AsyncStorage from '@react-native-async-storage/async-storage';
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

// const url = __DEV__ ? 'http://localhost:3001/graphql' : 'https://api.avocado.community/graphql' ;
// const wsUrl = __DEV__  ? 'ws://localhost:3001/subscriptions' : 'wss://api.avocado.community/subscriptions';
const url = 'https://api.avocado.community/graphql';
const wsUrl = 'wss://api.avocado.community/subscriptions';

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
  url: wsUrl,
  connectionParams: async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      return { token };
    }
  },
});

const httpLink = createHttpLink({
  uri: url,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem('token');

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

const cache = new InMemoryCache();

export const client = new ApolloClient({
  link: ApolloLink.from([
    authLink,
    splitLink,
    httpLink
  ]),
  cache
});
