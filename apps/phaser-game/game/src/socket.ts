import { io } from 'socket.io-client';
import { useGameStore } from './store/gameStore';

// Change this URL to match your backend port if different.
// The default NestJS setup typically runs on port 3000.
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';

export const socket = io(URL, {
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('Connected to server via WebSocket');
  useGameStore.getState().setConnectionStatus(true);
  
  // Send a test ping event
  socket.emit('ping', { test: true }, (response: any) => {
    console.log('Received response from server:', response);
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  useGameStore.getState().setConnectionStatus(false);
});

// Example of server acting as the source of truth
socket.on('gameStateUpdate', (data: any) => {
  useGameStore.getState().setServerState(data);
});

