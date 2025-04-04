export interface Vec2 {
  x: number;
  y: number;
}

export type PlayerId = string;

export interface Word {
  id: string;
  text: string;
  position: Vec2;
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
  id: PlayerId;
  health: number;
  name: string;
  score: number;
  combo: number;
  chaosPoints: number;
  chaosEffects: ChaosEffect[];
  effectsQueue: ChaosEffect[];
  isSafe: boolean;
}

export enum GameStatus {
  Lobby,
  Playing,
  Finished,
}

export interface GameInstance {
  roomId: string;
  players: Record<PlayerId, PlayerState>;
  words: Word[];
  status: GameStatus;
}
