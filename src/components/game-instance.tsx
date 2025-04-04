'use client';

import type { GameInstance } from '@/types/game.types';
import { useEffect, useState } from 'react';
import { PlayerArea } from './player-area';
import { useSocketClient } from '@/providers/socket-client-provider';

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
  }, [socketClient]);

  if (!gameState)
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

  return (
    <div>
      <PlayerArea gameState={gameState} />
    </div>
  );
}
