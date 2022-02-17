import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { buildSchema } from "type-graphql";
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import config from './mikro-orm.config';
import express from 'express';
import http from 'http';

async function startApolloServer() {
  const app = express();

  const httpServer = http.createServer(app);

  const orm = await MikroORM.init(config);

  const schema = await buildSchema({
    resolvers: [__dirname + '/**/resolver.{ts,js}'],
  });

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  server.applyMiddleware({ app });

  await new Promise<void>(resolve => httpServer.listen({ port: 3001 }, resolve));

  console.log(`🥑 Avocado API Server ready at \x1b[36mhttp://0.0.0.0:3001${server.graphqlPath}\x1b[0m`);
}

startApolloServer();
