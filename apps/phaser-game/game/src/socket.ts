import { io } from 'socket.io-client';

// Change this URL to match your backend port if different.
// The default NestJS setup typically runs on port 3000.
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000';

export const socket = io(URL, {
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('Connected to server via WebSocket');
  
  // Send a test ping event
  socket.emit('ping', { test: true }, (response: any) => {
    console.log('Received response from server:', response);
  });
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
