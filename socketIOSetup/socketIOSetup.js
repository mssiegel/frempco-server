import { Server } from 'socket.io';

export default function socketIOSetup(server) {
  const io = new Server(server, {
    cors: {
      origin: ['https://www.frempco.com', 'http://localhost:3000'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('test event', () => {
      console.log('Logging this is a test from socket:', socket.id);
    });
  });
}
