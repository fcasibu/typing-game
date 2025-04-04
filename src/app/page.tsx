'use client';

import { GameArea } from '@/components/game-area';
import { useSocketClient } from '@/providers/socket-client-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const router = useRouter();

  const socketClient = useSocketClient();

  useEffect(() => {
    const unsub = socketClient.initializeListAvailableRoomsListener((rooms) => {
      setAvailableRooms(rooms);
    });

    return () => {
      unsub();
    };
  }, [socketClient]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <button
        type="button"
        onClick={() => {
          socketClient.createRoom(socketClient.getSelfId());
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
                router.push('/play');
              }}
            >
              {room}
            </button>
          </li>
        ))}
      </ul>
      <GameArea words={[]} width={800} height={800} />
    </div>
  );
}
