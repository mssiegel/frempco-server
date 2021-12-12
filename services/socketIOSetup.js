import { Server } from 'socket.io';

import corsOptions from './corsOptions.js';

export default function socketIOSetup(server) {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.on('connection', (socket) => {
    socket.on('test event', () => {
      console.log('Logging this is a test from socket:', socket.id);
    });
  });
}
