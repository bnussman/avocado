import "reflect-metadata";
import "dotenv/config";
import express from 'express';
import config from './mikro-orm.config';
import Redis from 'ioredis';
import { createServer } from 'http';
import { Token } from "./entities/Token";
import { buildSchema } from "type-graphql";
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { ApolloServer, ExpressContext } from 'apollo-server-express';
import { ApolloError, ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { authChecker } from "./utils/auth";
import { ValidationError } from 'class-validator';
import { GraphQLError, GraphQLSchema, parse } from 'graphql';
import { RedisPubSub } from "graphql-redis-subscriptions";
import { WebSocketServer } from "ws";
import { graphqlUploadExpress } from "graphql-upload";
import { useServer } from 'graphql-ws/lib/use/ws';
import { Context as WSContext, SubscribeMessage } from "graphql-ws";
import { REDIS_HOST, REDIS_PASSWORD } from "./utils/constants";

async function onSubscribe(
  { connectionParams }: WSContext<Record<string, unknown> | undefined>,
  msg: SubscribeMessage,
  schema: GraphQLSchema,
  orm: MikroORM<IDatabaseDriver<Connection>>
) {
  const bearer = connectionParams?.token as string | undefined;

  if (!bearer) {
    return;
  }

  const token = await orm.em.fork().findOne(
    Token,
    bearer,
    {
      populate: ['user'],
    }
  );

  return {
    contextValue: { user: token?.user, token },
    schema,
    document: parse(msg.payload.query),
    variableValues: msg.payload.variables
  }
}


export function errorFormatter(error: GraphQLError) {
  if (error?.message === "Argument Validation Error") {
    const errors = error?.extensions?.exception?.validationErrors as ValidationError[];

    let output: { [key: string]: string[] } = {};

    for (const error of errors) {
      if (!error.constraints) continue;

      const items = Object.values<string>(error.constraints);

      output[error.property] = items;
    }

    return new ApolloError("Validation Error", undefined, output);
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

  app.use(graphqlUploadExpress());

  const httpServer = createServer(app);

  const orm = await MikroORM.init(config);

  const generator = orm.getSchemaGenerator();

  try {
     await generator.createSchema();
  } catch (error) {
    console.log("Database scheme is already set up");
  }

  if (!await generator.ensureDatabase()) {
    await generator.updateSchema();
  }

  const options: Redis.RedisOptions = {
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
    port: 6379,
  };

  const pubSub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options)
  });

  const schema = await buildSchema({
    authChecker: authChecker,
    resolvers: [__dirname + '/**/resolver.{ts,js}'],
    pubSub
  });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/subscriptions',
  });

  const serverCleanup = useServer({
    schema,
    onConnect: async (data) => {
      const auth = data.connectionParams?.token as string | undefined;
      const context = { em: orm.em.fork() };

      if (!auth) return context;

      const token = await orm.em.fork().findOne(Token, auth, { populate: ['user'] });

      if (token) {
        return {
          contextValue: { user: token.user, token },
          schema,
        }
      }
    },
  }, wsServer);

  const server = new ApolloServer({
    schema,
    context: (ctx) => getContext(ctx, orm),
    formatError: errorFormatter,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  server.applyMiddleware({ app });

  await new Promise<void>(resolve => httpServer.listen({ port: 3001 }, resolve));

  console.log(`🥑 Avocado API Server ready at \x1b[36mhttp://0.0.0.0:3001${server.graphqlPath}\x1b[0m`);
}

startApolloServer();
