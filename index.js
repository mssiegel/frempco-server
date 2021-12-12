import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createServer } from 'http';

import corsOptions from './services/corsOptions.js';
import socketIOSetup from './services/socketIOSetup.js';
import classroomRoutes from './routes/classrooms.js';

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors(corsOptions));
const server = createServer(app);

socketIOSetup(server);

const port = process.env.PORT || 4000;

app.use('/api/v1/classrooms', classroomRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
});
