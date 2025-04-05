import {
  WordStatus,
  type PlayerState,
  type Word,
} from '../../types/game.types';
import type { ServerSocket } from '../../types/socket.events';
import type { WordService } from './word-service';
import assert from 'assert';

const CHAOS_POINTS_PER_COMPLETION = 5;
const CHAOS_POINTS_MAX = 100;

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

    let scoreDelta = 0;
    let chaosPointsDelta = 0;
    let healthDelta = 0;
    let brokeComboThisTick = false;
    let completedThisTick = 0;

    // TODO(fcasibu): combo is broken, need to fix heuristics with selecting the active word
    const comboAtTickStart = this.playerState.combo;

    for (const word of this.playerState.words) {
      switch (word.status) {
        case WordStatus.Completed:
          scoreDelta += this.calculateScore(
            word,
            comboAtTickStart + completedThisTick + 1,
          );
          chaosPointsDelta += CHAOS_POINTS_PER_COMPLETION;
          completedThisTick++;
          break;

        case WordStatus.Missed:
          scoreDelta += this.calculateScore(word, comboAtTickStart);
          healthDelta -= word.difficulty;
          brokeComboThisTick = true;
          break;

        case WordStatus.Error:
          scoreDelta += this.calculateScore(word, comboAtTickStart);
          break;

        case WordStatus.Active:
        case WordStatus.Typing:
        default:
          break;
      }

      this.playerState.score += Math.max(scoreDelta, 0);

      if (brokeComboThisTick) {
        this.playerState.combo = 0;
      } else {
        this.playerState.combo += completedThisTick;
      }

      this.playerState.health = Math.max(
        0,
        this.playerState.health + healthDelta,
      );

      this.playerState.chaosPoints =
        (this.playerState.chaosPoints + chaosPointsDelta) % CHAOS_POINTS_MAX;

      this.playerState.isSafe =
        this.playerState.combo >= this.safeGuardingThreshold;
    }
  }

  private calculateScore(word: Word, combo: number): number {
    const comboMultiplier = 0.1;
    const effectiveCombo = Math.max(0, combo);

    switch (word.status) {
      case WordStatus.Completed: {
        return word.difficulty * (1 + effectiveCombo * comboMultiplier);
      }
      case WordStatus.Missed: {
        return -(
          word.difficulty *
          (1 + effectiveCombo * comboMultiplier * 0.5)
        );
      }
      case WordStatus.Error: {
        return -(word.difficulty * 0.5);
      }
      default:
        return 0;
    }
  }
}
