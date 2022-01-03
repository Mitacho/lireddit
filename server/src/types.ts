import type { FastifyRequest, FastifyReply } from "fastify";
import type { Redis } from "ioredis";

export type Context = {
  request: FastifyRequest;
  reply: FastifyReply;
  redis: Redis;
};
