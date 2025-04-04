import type { ServerSocket } from '@/types/socket.events';
import Fastify from 'fastify';
import fastifyIo from 'fastify-socket.io';
import { GameManagerService } from './services/game-manager-service';

const fastify = Fastify({ logger: true });

fastify.register(fastifyIo);

const gameManager = new GameManagerService();

fastify.ready((err) => {
  if (err) throw err;

  gameManager.init(fastify.io);
});

fastify.get('/api/rooms', (_, reply) => {
  reply.send(gameManager.findAvailableRooms());
});

fastify.listen({ port: 8080 });

declare module 'fastify' {
  interface FastifyInstance {
    io: ServerSocket;
  }
}
