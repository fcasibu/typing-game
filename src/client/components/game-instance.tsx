'use client';

import { useEffect, useState } from 'react';
import { PlayerArea } from './player-area';
import { OpponentsArea } from './opponents-area';
import { useSocketClient } from '../providers/socket-client-provider';
import type { GameInstance } from '../../types/game.types';

export function GameInstance({ roomId }: { roomId: string }) {
  const socketClient = useSocketClient();
  const [gameState, setGameState] = useState<GameInstance | null>(null);

  useEffect(() => {
    const unsub = socketClient.initializeGameInstanceUpdateListener(
      (updatedInstance) => {
        if (updatedInstance.roomId === roomId) {
          setGameState(updatedInstance);
        }
      },
    );

    return () => {
      unsub();
    };
  }, [socketClient, roomId]);

  if (!gameState) {
    if (roomId !== socketClient.getSelfId())
      return <div>Waiting for host to start</div>;

    return (
      <div>
        <button
          type="button"
          onClick={() => {
            socketClient.startGame(roomId);
          }}
        >
          Start
        </button>
      </div>
    );
  }

  console.log(gameState);

  return (
    <div className="flex gap-12 items-start justify-center p-20">
      <div className="w-full">
        <PlayerArea gameState={gameState} />
      </div>
      <div>
        <OpponentsArea
          opponents={Object.values(gameState.players).filter(
            (player) => player.id !== socketClient.getSelfId(),
          )}
        />
      </div>
    </div>
  );
}
