import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';

import socketIOSetup from './socketIOSetup/socketIOSetup.js';

const app = express();

app.use(helmet());

const server = createServer(app);

socketIOSetup(server);

const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
});
