import {
  WordStatus,
  type PlayerId,
  type PlayerState,
} from '@/types/game.types';
import type { WordService } from './word-service';
import assert from 'assert';
import type { ServerSocket } from '@/types/socket.events';

export class PlayerService {
  private playerState: PlayerState;
  private readonly safeGuardingThreshold = 10;
  private typed: string;

  constructor(
    public readonly id: PlayerId,
    public readonly io: ServerSocket,
    private readonly wordService: WordService,
  ) {
    this.playerState = {
      id,
      health: 100,
      name: '',
      score: 0,
      combo: 0,
      chaosPoints: 0,
      chaosEffects: [],
      effectsQueue: [],
      isSafe: false,
      words: [],
    };

    this.typed = '';

    io.on('typed', ({ playerId, letter }) => {
      if (playerId !== id) return;

      this.typed += letter;
    });

    io.on('submitted', ({ playerId }) => {
      if (playerId !== id) return;

      this.typed = '';
    });
  }

  public getState() {
    return structuredClone(this.playerState);
  }

  public async initializeWords() {
    this.playerState.words = (await this.wordService.getCurrentWords()) ?? [];
  }

  public isDead() {
    assert(
      this.playerState.health >= 0,
      'Player health should never become negative',
    );

    return this.playerState.health === 0;
  }

  public async update(width: number, height: number, dt: number) {
    const updatedWords = await this.wordService.update(
      this.typed,
      width,
      height,
      dt,
    );
    this.playerState.words = updatedWords;

    for (const word of this.playerState.words) {
      const comboBreaker =
        word.status === WordStatus.Missed || word.status === WordStatus.Error
          ? 0
          : this.playerState.combo;

      this.playerState.combo =
        word.status === WordStatus.Completed
          ? this.playerState.combo + 1
          : comboBreaker;

      this.playerState.isSafe =
        this.playerState.combo >= this.safeGuardingThreshold;

      this.playerState.score +=
        word.difficulty * (1 + this.playerState.combo * 0.1);

      this.playerState.chaosPoints =
        (this.playerState.chaosPoints + word.status === WordStatus.Completed
          ? 5
          : 0) % 100;

      if (word.status === WordStatus.Missed) {
        this.playerState.health = Math.max(
          this.playerState.health - word.difficulty,
          0,
        );
      }
    }
  }
}
