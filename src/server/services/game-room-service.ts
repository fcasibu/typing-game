import { GameStatus, type GameInstance } from '@/types/game.types';
import { PlayerService } from './player-service';
import { WordService } from './word-service';
import { OpenRouter } from './ai-service';
import type { ServerSocket } from '@/types/socket.events';

export class GameRoomService {
  private id: string;
  private players = new Map<string, PlayerService>();
  private status: GameStatus;
  private nonPlayingPlayers = new Set<string>();
  private interval: NodeJS.Timeout | undefined;
  private readonly maxPlayers = 15;

  constructor(
    public readonly hostId: string,
    private readonly io: ServerSocket,
  ) {
    this.id = crypto.randomUUID();
    this.status = GameStatus.Lobby;

    this.addPlayer(hostId);

    io.on('startGame', ({ roomId }) => {
      if (this.id !== roomId) return;

      this.startGame(800, 1200);
    });

    io.on('joinRoom', ({ roomId, playerId }) => {
      if (this.id !== roomId) return;

      if (this.players.size === this.maxPlayers) {
        io.emit('joinRoomFailed', 'The room is full');
        return;
      }

      this.addPlayer(playerId);
    });

    io.on('leaveRoom', ({ roomId, playerId }) => {
      if (this.id !== roomId) return;

      this.removePlayer(playerId);
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
      roomId: this.id,
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

    const update = () => {
      const now = performance.now();
      const dt = (lastUpdate - now) / 1000;
      lastUpdate = now;

      for (const player of players.values()) {
        if (player.isDead()) {
          this.nonPlayingPlayers.add(player.id);
          continue;
        }

        player.update(width, height, dt);
      }
    };

    this.interval = setInterval(() => {
      if (this.nonPlayingPlayers.size === this.players.size) {
        this.endGame();
        clearInterval(this.interval);
      } else {
        update();
      }

      this.io.in(this.id).emit('gameInstanceUpdate', this.getState());
    }, 100);
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
