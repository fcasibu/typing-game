import { WordStatus, type PlayerState } from '@/types/game.types';
import type { WordService } from './word-service';
import assert from 'assert';
import type { ServerSocket } from '@/types/socket.events';

export class PlayerService {
  private playerState: PlayerState;
  private readonly safeGuardingThreshold = 10;
  private inputPayload: { submit: boolean; backspace: boolean };

  constructor(
    public readonly id: string,
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
      typed: '',
    };

    this.inputPayload = {
      submit: false,
      backspace: false,
    };

    io.on('typed', ({ playerId, key }) => {
      if (playerId !== id) return;

      switch (key) {
        case 'Backspace': {
          this.playerState.typed = this.playerState.typed.slice(0, -1);
          break;
        }
        case 'Enter':
        case 'Space': {
          this.inputPayload.submit = true;
          break;
        }
        default: {
          if (this.inputPayload.submit) {
            this.playerState.typed = '';
          }

          this.inputPayload.submit = false;
          this.inputPayload.backspace = false;
          this.playerState.typed += key;
        }
      }
    });
  }

  public getState() {
    return this.playerState;
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
      {
        backspace: this.inputPayload.backspace,
        submit: this.inputPayload.submit,
        typed: this.playerState.typed,
      },
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
        console.log(this.playerState.health, word.text);
      }
    }
  }
}
