import type { ServerPayloads, ServerSocket } from '@/types/socket.events';
import Fastify from 'fastify';
import fastifyIo from 'fastify-socket.io';

const fastify = Fastify({ logger: true });

fastify.register(fastifyIo);

fastify.ready((err) => {
  if (err) throw err;
});

declare module 'fastify' {
  interface FastifyInstance {
    io: ServerSocket;
  }
}
