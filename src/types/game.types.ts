export interface Vec2 {
  x: number;
  y: number;
}

export enum WordStatus {
  Active,
  Typing,
  Error,
  Completed,
  Missed,
}

export interface Word {
  id: string;
  text: string;
  position: Vec2;
  typed: string;
  difficulty: number;
  status: WordStatus;
}

export enum EffectStatus {
  Resolved,
  Active,
}

export interface BaseEffect {
  id: string;
  timestamp: number;
  duration: number;
  status: EffectStatus;
}

export interface JumbledWordsEffect extends BaseEffect {
  type: 'jumbled_words';
}

export interface SpeedUpEffect extends BaseEffect {
  type: 'speed_up';
}

export type ChaosEffect = JumbledWordsEffect | SpeedUpEffect;

export interface PlayerState {
  id: string;
  health: number;
  name: string;
  score: number;
  combo: number;
  chaosPoints: number;
  chaosEffects: ChaosEffect[];
  effectsQueue: ChaosEffect[];
  isSafe: boolean;
  words: Word[];
}

export enum GameStatus {
  Lobby,
  Playing,
  Finished,
}

export interface GameInstance {
  roomId: string;
  players: Record<string, PlayerState>;
  status: GameStatus;
}
