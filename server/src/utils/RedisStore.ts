// import { SESSION_TTL } from "@constants";
// import type { FastifyRequest } from "fastify";

// import type { Redis } from "ioredis";

// const TTL = SESSION_TTL || 86400;

// type SessionId = string;
// type Session = FastifyRequest["session"] & { userId: number };

// export default class RedisStore {
//   redis: Redis;
//   prefix: string;
//   ttl: number;
//   constructor({
//     client,
//     prefix = "sess:",
//     ttl = TTL,
//   }: {
//     client: Redis;
//     prefix?: string;
//     ttl?: number;
//   }) {
//     this.redis = client;
//     this.prefix = prefix;
//     this.ttl = ttl;
//   }
//   getKey(sid: SessionId) {
//     return `${this.prefix}${sid}`;
//   }
//   async set(sid: SessionId, session: Session, callback: (err?: Error) => void) {
//     console.log("SET ", sid);

//     if (!session.userId) {
//       return callback(undefined);
//     }
//     await this.redis.set(
//       this.getKey(sid),
//       JSON.stringify(session),
//       "EX",
//       this.ttl
//     );
//     return callback(undefined);
//   }
//   async get(
//     sid: SessionId,
//     callback: (err?: Error, session?: Session) => void
//   ) {
//     console.log("GET ", sid);

//     const value = await this.redis.get(this.getKey(sid));
//     if (!value) {
//       return callback(undefined, undefined);
//     }
//     return callback(undefined, JSON.parse(value));
//   }
//   async destroy(sid: SessionId, callback: (err?: Error) => void) {
//     console.log("DEL ", sid);
//     await this.redis.del(this.getKey(sid));
//     return callback(undefined);
//   }
// }
