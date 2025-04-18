import type { Socket } from 'socket.io';
import type { GameInstance } from './game.types';

export interface ClientPayloads {
  joinRoom: {
    roomId: string;
    playerId: string;
    name: string;
  };
  leaveRoom: {
    roomId: string;
    playerId: string;
  };
  createRoom: {
    hostId: string;
  };
  typed: {
    playerId: string;
    key: string;
  };
  startGame: {
    roomId: string;
  };
}

export interface ServerPayloads {
  gameInstanceUpdate: GameInstance;
  listAvailableRooms: string[];
  roomCreationFailed: string;
  joinRoomFailed: string;
  connect: string;
}

export type ClientToServerEvents = {
  [K in keyof ClientPayloads]: (payload: ClientPayloads[K]) => void;
} & {
  connection: (socket: Socket) => void;
};

export type ServerToClientEvents = {
  [K in keyof ServerPayloads]: (payload: ServerPayloads[K]) => void;
};

export type ServerSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
