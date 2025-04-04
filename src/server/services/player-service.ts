import type { PlayerState } from '@/types/game.types';

export class PlayerService {
  public create(id: string): PlayerState {
    return {
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
}
