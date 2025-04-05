import Fastify from 'fastify';
import fastifyIo from 'fastify-socket.io';
import { GameManagerService } from './services/game-manager-service';
import cors from '@fastify/cors';
import type { Socket } from 'socket.io';
import type { ServerSocket } from '../types/socket.events';

const fastify = Fastify({ logger: true });

fastify.register(fastifyIo, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

fastify.register(cors, {
  origin: 'http://localhost:5173',
});

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
    io: ServerSocket & {
      connection: (socket: Socket) => void;
    };
  }
}
