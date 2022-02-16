import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import config from './mikro-orm.config';
import { MikroORM } from "@mikro-orm/core";

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

  console.log(`🚀 Server ready at http://localhost:3001${server.graphqlPath}`);
}

startApolloServer();
