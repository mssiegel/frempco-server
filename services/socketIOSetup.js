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
  sendUserTyping
} from './database.js';

export default function socketIOSetup(server) {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.on('connect', (socket) => {
    socket.on('disconnect', () => {
      const teacher = getTeacher(socket.id);
      if (teacher) deleteClassroom(teacher.classroomName, socket.id);

      const student = getStudent(socket.id);
      if (student) remStudentFromClassroom(student, socket)
    });

    socket.on('activate classroom', ({ classroomName }) => {
      addClassroom(classroomName, socket);
    });

    socket.on('deactivate classroom', ({ classroomName }) => {
      deleteClassroom(classroomName, socket.id);
    });

    socket.on(
      'new student entered',
      ({ student: studentRealName, classroom: classroomName }) => {
        addStudentToClassroom(studentRealName, classroomName, socket);
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
    socket.on('student typing', ({ character, message }) => {
      sendUserTyping(character, message, socket);
    });
  });
}
