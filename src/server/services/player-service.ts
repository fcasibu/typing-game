import {
  WordStatus,
  type PlayerId,
  type PlayerState,
} from '@/types/game.types';
import type { WordService } from './word-service';

export class PlayerService {
  private playerState: PlayerState;
  private readonly safeGuardingThreshold = 10;

  constructor(
    id: PlayerId,
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
  }

  public getState() {
    return structuredClone(this.playerState);
  }

  public async initializeWords() {
    this.playerState.words = (await this.wordService.getCurrentWords()) ?? [];
  }

  public async update(
    typed: string,
    width: number,
    height: number,
    dt: number,
  ) {
    const updatedWords = await this.wordService.update(
      typed,
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
