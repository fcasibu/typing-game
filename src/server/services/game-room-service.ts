import { GameStatus, type GameInstance } from '@/types/game.types';
import { PlayerService } from './player-service';
import { WordService } from './word-service';
import { OpenRouter } from './ai-service';
import type { ServerSocket } from '@/types/socket.events';

export class GameRoomService {
  private players = new Map<string, PlayerService>();
  private status: GameStatus;
  private nonPlayingPlayers = new Set<string>();
  private readonly maxPlayers = 15;

  constructor(
    public readonly hostId: string,
    private readonly io: ServerSocket,
  ) {
    this.status = GameStatus.Lobby;

    this.addPlayer(hostId);

    io.on('startGame', ({ roomId }) => {
      if (this.hostId !== roomId) return;

      this.startGame(800, 800);
    });

    io.on('joinRoom', ({ roomId, playerId }) => {
      if (this.hostId !== roomId) return;

      if (this.players.size === this.maxPlayers) {
        io.emit('joinRoomFailed', 'The room is full');
        return;
      }

      this.addPlayer(playerId);
    });

    io.on('leaveRoom', ({ roomId, playerId }) => {
      if (this.hostId !== roomId) return;

      this.removePlayer(playerId);
    });

    io.on('disconnect', () => {
      this.removePlayer(io.id);
    });
  }

  public getState(): GameInstance {
    return {
      status: this.status,
      players: Object.fromEntries(
        this.players
          .entries()
          .map(([playerId, player]) => [playerId, player.getState()]),
      ),
      roomId: this.hostId,
    };
  }

  public isFull() {
    return this.players.size === this.maxPlayers;
  }

  private async startGame(width: number, height: number) {
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
      }

      if (
        this.nonPlayingPlayers.size === this.players.size ||
        this.players.size === 0
      ) {
        this.endGame();
        return;
      }

      this.io.emit('gameInstanceUpdate', this.getState());

      setTimeout(tick, 1000 / 60);
    };

    tick();
  }

  private endGame() {
    this.status = GameStatus.Finished;
  }

  private addPlayer(playerId: string) {
    this.players.set(
      playerId,
      new PlayerService(
        playerId,
        this.io,
        new WordService(OpenRouter.getInstance()),
      ),
    );
  }

  private removePlayer(playerId: string) {
    this.players.delete(playerId);
  }
}
