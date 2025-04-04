import type { Socket } from 'socket.io';
import type { GameInstance, PlayerId } from './game.types';

export interface ClientPayloads {
  joinRoom: {
    roomId: string;
    playerId: PlayerId;
    name: string;
  };
  leaveRoom: {
    roomId: string;
    playerId: PlayerId;
  };
  typed: {
    playerId: string;
    letter: string;
  };
  submitted: {
    playerId: string;
  };
  startGame: {
    roomId: string;
  };
}

export interface ServerPayloads {
  gameInstanceUpdate: GameInstance;
  roomCreationFailed: string;
  joinRoomFailed: string;
}

export type ClientToServerEvents = {
  [K in keyof ClientPayloads]: (payload: ClientPayloads[K]) => void;
};

export type ServerToClientEvents = {
  [K in keyof ServerPayloads]: (payload: ServerPayloads[K]) => void;
};

export type ServerSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
