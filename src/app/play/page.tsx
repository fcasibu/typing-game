'use client';

import { GameInstance } from '@/components/game-instance';
import { useSocketClient } from '@/providers/socket-client-provider';

export default function Page() {
  const socketClient = useSocketClient();

  const roomId = socketClient.getRoomIdOfSelf();

  console.log(roomId);
  if (!roomId) return <div>Loading...</div>;

  return (
    <div>
      <GameInstance roomId={roomId} />
    </div>
  );
}
