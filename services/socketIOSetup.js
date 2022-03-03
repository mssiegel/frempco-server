import { Server } from 'socket.io';

import corsOptions from './corsOptions.js';

import {
  addClassroom,
  deleteClassroom,
  getTeacher,
  getStudent,
  addStudentToClassroom,
  remStudentFromClassroom,
  pairStudents,
  sendMessage,
  sendUserTyping,
} from './database.js';

export default function socketIOSetup(server) {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.on('connect', (socket) => {
    const userDisconnected = () => {
      const teacher = getTeacher(socket.id);
      if (teacher) deleteClassroom(teacher);

      const student = getStudent(socket.id);
      if (student) remStudentFromClassroom(student);
    }
    socket.on('disconnect', userDisconnected);
    socket.on('user disconnected', userDisconnected);

    socket.on('activate classroom', ({ classroomName }) => {
      addClassroom(classroomName, socket);
    });

    socket.on('deactivate classroom', () => {
      const teacher = getTeacher(socket.id);
      if (teacher) deleteClassroom(teacher);
    });

    socket.on(
      'new student entered',
      ({ student: realName, classroom: classroomName }) => {
        addStudentToClassroom(realName, classroomName, socket);
      },
    );

    // Teacher pairs up their students
    socket.on('pair students', ({ studentPairs }) => {
      pairStudents(studentPairs, socket);
    });

    // New chat message sent from one student to their peer
    socket.on('chat message', ({ character, message }) => {
      sendMessage(character, message, socket);
    });

    // New chat message sent from one student to their peer
    socket.on('student typing', ({ character }) => {
      sendUserTyping(character, socket);
    });
  });
}
