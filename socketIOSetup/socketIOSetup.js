import { Server } from 'socket.io';

export default function socketIOSetup(server) {
  const PRODUCTION_URL = 'https://www.frempco.com';
  const DEV_URL = 'http://localhost:3000';
  const VERCEL_DEPLOY_PREVIEW_URL = /https:..frempco.*vercel.app/;

  const io = new Server(server, {
    cors: {
      origin: [PRODUCTION_URL, DEV_URL, VERCEL_DEPLOY_PREVIEW_URL],
    },
  });

  io.on('connection', (socket) => {
    socket.on('test event', () => {
      console.log('Logging this is a test from socket:', socket.id);
    });
  });
}
