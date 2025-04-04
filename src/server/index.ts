import type { ServerSocket } from '@/types/socket.events';
import Fastify from 'fastify';
import fastifyIo from 'fastify-socket.io';
import { GameManagerService } from './services/game-manager-service';
import cors from '@fastify/cors';
import type { Socket } from 'socket.io';

const fastify = Fastify({ logger: true });

fastify.register(fastifyIo, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

fastify.register(cors, {
  origin: 'http://localhost:3000',
});

const gameManager = new GameManagerService();

fastify.ready((err) => {
  if (err) throw err;

  fastify.io.on('connection', (socket) => {
    gameManager.init(socket);
  });
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
