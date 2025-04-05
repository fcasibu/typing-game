import { PlayerService } from './player-service';
import { WordService } from './word-service';
import { OpenRouter } from './ai-service';
import { GameStatus, type GameInstance } from '../../types/game.types';
import type { ServerSocket } from '../../types/socket.events';

export class GameRoomService {
  private players = new Map<string, PlayerService>();
  private status: GameStatus;
  private nonPlayingPlayers = new Set<string>();
  private readonly maxPlayers = 15;

  constructor(public readonly hostId: string) {
    this.status = GameStatus.Lobby;
  }

  public getState(): GameInstance {
    return {
      status: this.status,
      players: Object.fromEntries(
        Array.from(this.players.entries()).map(([playerId, player]) => [
          playerId,
          player.getState(),
        ]),
      ),
      roomId: this.hostId,
    };
  }

  public addPlayer(playerId: string, socket: ServerSocket) {
    this.players.set(
      playerId,
      new PlayerService(
        playerId,
        socket,
        new WordService(OpenRouter.getInstance()),
      ),
    );
  }

  public removePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  public isFull() {
    return this.players.size === this.maxPlayers;
  }

  public async startGame(width: number, height: number) {
    await new Promise(async (resolve) => {
      for (const player of this.players.values()) {
        await player.initializeWords();
      }

      resolve(true);
    });

    this.status = GameStatus.Playing;
    this.loop(width, height);
  }

  private loop(width: number, height: number) {
    let lastUpdate = performance.now();
    const players = this.players;

    const tick = () => {
      const now = performance.now();
      const dt = (now - lastUpdate) / 1000;
      lastUpdate = now;

      for (const player of players.values()) {
        if (player.isDead()) {
          this.nonPlayingPlayers.add(player.id);
          continue;
        }

        player.update(width, height, dt);

        player.io.emit('gameInstanceUpdate', this.getState());
      }

      if (
        this.nonPlayingPlayers.size === this.players.size ||
        this.players.size === 0
      ) {
        this.endGame();
        return;
      }

      setTimeout(tick, 1000 / 60);
    };

    tick();
  }

  private endGame() {
    this.status = GameStatus.Finished;
  }
}
