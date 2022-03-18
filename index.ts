import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createServer } from 'http';

import corsOptions from './services/corsOptions.js';
import socketIOSetup from './services/socketIOSetup.js';
import classroomRoutes from './routes/classrooms.js';
import { getStudent, getClassroom } from './services/database.js';
import { RESERVED_EVENTS } from 'socket.io/dist/socket';

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors(corsOptions));
const server = createServer(app);

socketIOSetup(server);

const port = process.env.PORT || 4000;

app.use('/api/v1/classrooms', classroomRoutes);

app.get('/api/v1/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const student = getStudent(studentId);
  const classroom = getClassroom(student?.classroomName);
  const isActive = student !== undefined && classroom !== undefined;
  if (!isActive) return res.status(200).json({ isActive });
  res.status(200).json({
    student: student.realName || null,
    classroom: student.classroomName || null,
    isActive,
  });
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
});
