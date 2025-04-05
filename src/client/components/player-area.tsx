import type { GameInstance } from '../../types/game.types';
import { useSocketClient } from '../providers/socket-client-provider';
import { GameArea } from './game-area';
import { Keyboard } from './keyboard';
import { useEffect, useRef } from 'react';

export function PlayerArea({ gameState }: { gameState: GameInstance }) {
  const socketClient = useSocketClient();
  const player = gameState.players[socketClient.getSelfId()];

  const key = useRef('');
  const ref = useRef<HTMLDivElement>(null);
  const blurred = useRef(false);

  useEffect(() => {
    if (!player?.id || !ref.current) return;

    const handleKeypress = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const keyPressed = event.key;

      if (
        [' ', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(
          keyPressed,
        )
      ) {
        event.preventDefault();
      }

      key.current = keyPressed;

      switch (keyPressed) {
        case ' ':
          socketClient.type(player.id, 'Space');
          break;
        case 'Enter':
          socketClient.type(player.id, 'Enter');
          break;
        case 'Backspace':
          socketClient.type(player.id, 'Backspace');
          break;
        default:
          if (/^[a-zA-Z0-9]$/.test(keyPressed)) {
            socketClient.type(player.id, keyPressed);
          }
      }
    };

    window.addEventListener('keydown', handleKeypress);

    return () => window.removeEventListener('keydown', handleKeypress);
  }, [player?.id, socketClient]);

  if (!player) return null;

  const isBlurred = blurred.current;

  return (
    <div className="relative min-h-screen w-full">
      <div
        className={`flex flex-col items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)] outline-none transition-all duration-300 ${
          isBlurred ? 'filter blur-sm opacity-60 grayscale' : ''
        }`}
      >
        <div
          ref={ref}
          tabIndex={0}
          onFocus={() => {
            blurred.current = false;
          }}
          onBlur={() => {
            blurred.current = true;
          }}
        >
          <GameArea words={player.words} />
        </div>
        <Keyboard activeKey={key.current} />
      </div>

      {isBlurred && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-2xl font-bold text-white pointer-events-none">
          Click to refocus
        </div>
      )}
    </div>
  );
}
