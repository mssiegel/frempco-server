import { Server } from 'socket.io';

import corsOptions from './corsOptions.js';

import {
  addClassroom,
  deleteClassroom,
  getTeacher,
  getStudent,
  addStudentToClassroom,
  remStudentFromClassroom,
  unpairStudentChat,
  pairStudents,
  sendMessage,
  sendUserTyping,
} from './database.js';

export default function socketIOSetup(server) {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.on('connect', (socket) => {
    const socketId = socket.handshake.query.token;
    const student = getStudent(socketId);
    if (student) addStudentToClassroom(student, student.classroomName, socket);

    const userDisconnected = () => {
      const teacher = getTeacher(socketId);
      if (teacher) deleteClassroom(teacher);

      const student = getStudent(socketId);
      if (student) remStudentFromClassroom(student);
    };
    socket.on('disconnect', userDisconnected);
    socket.on('user disconnected', userDisconnected);

    socket.on('activate classroom', ({ classroomName }) => {
      addClassroom(classroomName, socket);
    });

    socket.on('deactivate classroom', () => {
      const teacher = getTeacher(socketId);
      if (teacher) deleteClassroom(teacher);
    });

    socket.on('new student entered', ({ realName, classroomName }) => {
      addStudentToClassroom(realName, classroomName, socket);
    });

    // Teacher pairs up their students
    socket.on('pair students', ({ studentPairs }) => {
      pairStudents(studentPairs, socket);
    });

    socket.on('remove student from classroom', ({ socketId }) => {
      const student = getStudent(socketId);
      if (student) {
        remStudentFromClassroom(student, true);
        student.socket.emit('remove student from classroom');
      }
    });

    socket.on('unpair student chat', ({ chatId, student1, student2 }) => {
      const teacher = getTeacher(socketId);
      if (!teacher) {
        console.log(
          'Attempted to unpair students, no teacher found!',
          socketId,
          chatId,
          student1,
          student2,
        );
        return;
      }
      unpairStudentChat(teacher.socket, chatId, student1, student2);
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
