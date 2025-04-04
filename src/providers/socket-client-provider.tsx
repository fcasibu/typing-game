'use client';

import { SocketClientService } from '@/services/socket-client-service';
import { createContext, useContext } from 'react';

const SocketClientContext = createContext<SocketClientService | null>(null);

export function useSocketClient() {
  const ctx = useContext(SocketClientContext);

  if (!ctx) {
    throw new Error(
      'useSocketClient must be used within a SocketClientProvider',
    );
  }

  return ctx;
}

export function SocketClientProvider({ children }: React.PropsWithChildren) {
  return (
    <SocketClientContext.Provider value={SocketClientService.getInstance()}>
      {children}
    </SocketClientContext.Provider>
  );
}
