import type { GameInstance } from '@/types/game.types';
import type { ClientSocket } from '@/types/socket.events';
import { io } from 'socket.io-client';

export class SocketClientService {
  private static instance: SocketClientService | undefined;
  private io: ClientSocket;
  private rooms = new Map<string, string>();

  private constructor() {
    this.io = io('http://localhost:8080') as unknown as ClientSocket;
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SocketClientService();
    }

    return this.instance;
  }

  public getSelfId() {
    return this.io.id;
  }

  public getRoomIdOfSelf() {
    return this.rooms.get(this.getSelfId());
  }

  public initializeGameInstanceUpdateListener(
    callback: (data: GameInstance) => void,
  ) {
    const event = 'gameInstanceUpdate';
    this.io.on(event, callback);

    return () => this.io.removeAllListeners(event);
  }

  public initializeJoinRoomFailedListener(callback: (data: string) => void) {
    const event = 'joinRoomFailed';
    this.io.on(event, callback);

    return () => this.io.removeAllListeners(event);
  }

  public initializeListAvailableRoomsListener(
    callback: (data: string[]) => void,
  ) {
    const event = 'listAvailableRooms';
    this.io.on(event, callback);

    return () => this.io.removeAllListeners(event);
  }

  public initializeRoomCreationFailedListener(
    callback: (data: string) => void,
  ) {
    const event = 'roomCreationFailed';
    this.io.on(event, callback);

    return () => this.io.removeAllListeners(event);
  }

  public joinRoom(roomId: string, playerId: string) {
    this.io.emit('joinRoom', { roomId, playerId, name: 'nevz' });
    this.rooms.set(playerId, roomId);
  }

  public leaveRoom(roomId: string, playerId: string) {
    this.io.emit('leaveRoom', { roomId, playerId });
    this.rooms.delete(playerId);
  }

  public createRoom(hostId: string) {
    this.io.emit('createRoom', { hostId });
    this.rooms.set(hostId, hostId);
  }

  public type(playerId: string, key: string) {
    this.io.emit('typed', { playerId, key });
  }

  public startGame(roomId: string) {
    this.io.emit('startGame', { roomId });
  }
}
