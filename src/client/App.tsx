import { useEffect, useState } from 'react';
import { GameInstance } from './components/game-instance';
import { useSocketClient } from './providers/socket-client-provider';

export function App() {
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [roomSelected, setRoomSelected] = useState('');

  const socketClient = useSocketClient();

  useEffect(() => {
    const unsub = socketClient.initializeListAvailableRoomsListener((rooms) => {
      setAvailableRooms(rooms);
    });

    return () => {
      unsub();
    };
  }, [socketClient]);

  if (roomSelected) {
    return (
      <div>
        <GameInstance roomId={roomSelected} />
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <button
        type="button"
        onClick={() => {
          socketClient.createRoom(socketClient.getSelfId());
          setRoomSelected(socketClient.getSelfId());
        }}
      >
        Create room
      </button>
      <ul>
        {availableRooms.map((room) => (
          <li key={room}>
            <button
              type="button"
              onClick={() => {
                socketClient.joinRoom(room, socketClient.getSelfId());
                setRoomSelected(room);
              }}
            >
              {room}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
