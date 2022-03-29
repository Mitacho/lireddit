import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "apollo-server-fastify";
import "dotenv/config";
import type { FastifyInstance } from "fastify";
import fastify from "fastify";
import fastifyCors from "fastify-cors";
import fastifySession from "fastify-secure-session";
import Redis from "ioredis";
import "module-alias/register";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import {
  COOKIE_NAME,
  DATABASE_USER,
  DATABASE_USER_PASSWORD,
  PROD,
  SESSION_SECRET,
  SESSION_TTL,
} from "./constants";
import { Post, User } from "./entities";
import { HelloResolver, PostResolver, UserResolver } from "./resolvers";

function fastifyAppClosePlugin(app: FastifyInstance) {
  return {
    async serverWillStart() {
      return {
        async drainServer() {
          await app.close();
        },
      };
    },
  };
}

(async function main(): Promise<void> {
  const conn = await createConnection({
    type: "postgres",
    database: "lireddit",
    username: DATABASE_USER,
    password: DATABASE_USER_PASSWORD,
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [User, Post],
  });

  await conn.runMigrations();

  // await Post.delete({});

  const redis = new Redis();

  const app = fastify();
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ request, reply }) => ({ request, reply, redis }),
    plugins: [
      fastifyAppClosePlugin(app),
      ApolloServerPluginDrainHttpServer({ httpServer: app.server }),
    ],
  });

  await server.start();
  app.register(
    server.createHandler({
      cors: false,
    })
  );
  app.register(fastifyCors, {
    origin: ["http://localhost:3000", "https://studio.apollographql.com"],
    credentials: true,
  });
  app.register(fastifySession, {
    secret: SESSION_SECRET as string,
    salt: (SESSION_SECRET as string).substring(3, 19),
    cookieName: COOKIE_NAME,
    cookie: {
      secure: PROD,
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_TTL,
    },
  });
  await app.listen(4000);
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
})().catch((error) => console.error(error));
