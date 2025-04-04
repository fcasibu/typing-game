import type { ServerSocket } from '@/types/socket.events';
import { GameRoomService } from './game-room-service';
import type { PlayerId } from '@/types/game.types';

export class GameManagerService {
  private gameInstances = new Map<string, GameRoomService>();
  private maxRooms = 20;

  constructor(private readonly io: ServerSocket) {}

  public createRoom(hostId: PlayerId) {
    if (this.gameInstances.size >= this.maxRooms) {
      this.io.emit(
        'roomCreationFailed',
        `There are ${this.maxRooms} available rooms. You cannot create a new room at the moment.`,
      );
    }

    const gameRoomService = new GameRoomService(hostId, this.io);

    this.io.join(hostId);
    this.gameInstances.set(hostId, gameRoomService);
  }

  public findAvailableRooms(): GameRoomService[] {
    return Array.from(this.gameInstances.values()).filter(
      (room) => !room.isFull(),
    );
  }
}
