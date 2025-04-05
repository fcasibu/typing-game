import type { ServerSocket } from '../../types/socket.events';
import { GameRoomService } from './game-room-service';

export class GameManagerService {
  private gameInstances = new Map<string, GameRoomService>();
  private maxRooms = 20;
  private io: ServerSocket | undefined;

  constructor() {}

  public init(io: ServerSocket) {
    this.io = io;

    this.io.on('connection', (socket: ServerSocket) => {
      socket.on('createRoom', ({ hostId }) => {
        if (this.gameInstances.size >= this.maxRooms) {
          socket.emit(
            'roomCreationFailed',
            `There are ${this.maxRooms} available rooms. You cannot create a new room at the moment.`,
          );
        }

        this.gameInstances.set(hostId, new GameRoomService(hostId, socket));

        const gameInstance = this.gameInstances.get(hostId);

        // TODO(fcasibu): handle error
        if (!gameInstance) return;

        socket.join(hostId);
        socket.broadcast.emit('listAvailableRooms', this.findAvailableRooms());
        gameInstance.addPlayer(hostId, socket);
      });

      socket.on('startGame', ({ roomId }) => {
        this.gameInstances.get(roomId)?.startGame(800, 800);
      });

      socket.on('joinRoom', ({ roomId, playerId }) => {
        socket.join(roomId);

        const gameInstance = this.gameInstances.get(roomId);

        // TODO(fcasibu): handle error
        if (!gameInstance) return;

        if (gameInstance.isFull()) {
          socket.emit('joinRoomFailed', 'The room is full');
          return;
        }

        gameInstance.addPlayer(playerId, socket);
      });

      socket.on('leaveRoom', ({ roomId, playerId }) => {
        const gameInstance = this.gameInstances.get(roomId);

        if (!gameInstance) return;

        gameInstance.removePlayer(playerId);
      });
    });
  }

  public findAvailableRooms(): string[] {
    return Array.from(this.gameInstances.values())
      .filter((room) => !room.isFull())
      .map((room) => room.hostId);
  }
}
