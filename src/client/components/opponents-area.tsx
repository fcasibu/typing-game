import type { PlayerState } from '../../types/game.types';
import { GameArea } from './game-area';

export function OpponentsArea({ opponents }: { opponents: PlayerState[] }) {
  return (
    <div>
      {opponents && opponents.length > 0 && (
        <div className="grid grid-cols-3 gap-4 w-[100] h-[200px]">
          {opponents.map((opponent) => (
            <div
              key={opponent.id}
              className="flex flex-col items-center justify-items-center font-[family-name:var(--font-geist-sans)] outline-none transition-all duration-300"
            >
              <div tabIndex={0}>
                <GameArea words={opponent.words} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
