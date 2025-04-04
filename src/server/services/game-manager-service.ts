import type { ServerSocket } from '@/types/socket.events';
import { GameRoomService } from './game-room-service';

export class GameManagerService {
  private gameInstances = new Map<string, GameRoomService>();
  private maxRooms = 20;

  constructor(private readonly io: ServerSocket) {
    io.on('createRoom', ({ hostId }) => {
      this.createRoom(hostId);
    });
  }

  public findAvailableRooms(): string[] {
    return Array.from(this.gameInstances.values())
      .filter((room) => !room.isFull())
      .map((room) => room.hostId);
  }

  private createRoom(hostId: string) {
    if (this.gameInstances.size >= this.maxRooms) {
      this.io.emit(
        'roomCreationFailed',
        `There are ${this.maxRooms} available rooms. You cannot create a new room at the moment.`,
      );
    }

    const gameRoomService = new GameRoomService(hostId, this.io);

    this.io.join(hostId);
    this.gameInstances.set(hostId, gameRoomService);
    this.io.emit('listAvailableRooms', this.findAvailableRooms());
  }
}
