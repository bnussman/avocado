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
import {createUploadLink} from "apollo-upload-client";

const url = import.meta.env.PROD ? 'https://api.avocado.community/graphql' : 'http://localhost:3001/graphql';
const wsUrl = import.meta.env.PROD ? 'wss://api.avocado.community/subscriptions' : 'ws://localhost:3001/subscriptions';

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
  connectionParams: () => {
    const token = localStorage.getItem('token');
    if (token) {
      return { token };
    }
  },
});

const uploadLink = createUploadLink({
  uri: url,
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

const cache = new InMemoryCache();

export const client = new ApolloClient({
  link: ApolloLink.from([
    authLink,
    splitLink,
    // @ts-ignore
    uploadLink
  ]),
  cache
});
