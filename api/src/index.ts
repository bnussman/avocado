import "reflect-metadata";
import http from 'http';
import express from 'express';
import config from './mikro-orm.config';
import { Token } from "./entities/Token";
import { buildSchema } from "type-graphql";
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { ApolloServer, ExpressContext } from 'apollo-server-express';
import { ApolloError, ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { authChecker } from "./utils/auth";
import { ValidationError } from 'class-validator';
import { GraphQLError } from 'graphql';

export function errorFormatter(error: GraphQLError) {
  if (error?.message === "Argument Validation Error") {
    const errors = error?.extensions?.exception?.validationErrors as ValidationError[];

    let output = {};

    for (const error of errors) {
      if (!error.constraints) continue;

      const items = Object.values<string>(error.constraints);

      // @ts-ignore
      output[error.property] = items;
    }
    console.log(output);

    return new Error(JSON.stringify(output));
  }

  return error;
}

async function getContext(ctx: ExpressContext, orm: MikroORM<IDatabaseDriver<Connection>>) {
  const context = { em: orm.em.fork() };

  const bearer = ctx.req.get("Authorization")?.split(" ")[1];

  if (!bearer) {
    return context;
  }

  const token = await orm.em.fork().findOne(Token, bearer, { populate: ['user'] });

  return { user: token?.user, token, ...context };
}

async function startApolloServer() {
  const app = express();

  const httpServer = http.createServer(app);

  const orm = await MikroORM.init(config);

  const schema = await buildSchema({
    authChecker: authChecker,
    resolvers: [__dirname + '/**/resolver.{ts,js}'],
  });

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: (ctx) => getContext(ctx, orm),
    formatError: errorFormatter,
  });

  await server.start();

  server.applyMiddleware({ app });

  await new Promise<void>(resolve => httpServer.listen({ port: 3001 }, resolve));

  console.log(`🥑 Avocado API Server ready at \x1b[36mhttp://0.0.0.0:3001${server.graphqlPath}\x1b[0m`);
}

startApolloServer();
