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
  correctWord: {
    playerId: string;
    wordId: string;
  };
  incorrectWord: {
    playerId: string;
    wordId: string;
  };
  missedWord: {
    playerId: string;
    wordId: string;
  };
}

export interface ServerPayloads {
  gameInstanceUpdate: GameInstance;
}

export type ClientToServerEvents = {
  [K in keyof ClientPayloads]: (payload: ClientPayloads[K]) => void;
};

export type ServerToClientEvents = {
  [K in keyof ServerPayloads]: (payload: ServerPayloads[K]) => void;
};
