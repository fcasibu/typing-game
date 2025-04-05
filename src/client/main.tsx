import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import { SocketClientProvider } from './providers/socket-client-provider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SocketClientProvider>
      <main className="h-screen">
        <App />
      </main>
    </SocketClientProvider>
  </StrictMode>,
);
