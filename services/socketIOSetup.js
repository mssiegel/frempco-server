import { Server } from 'socket.io';

import corsOptions from './corsOptions.js';

import {
  addClassroom,
  deleteClassroom,
  getTeacher,
  addStudentToClassroom,
  pairStudents,
} from './database.js';

export default function socketIOSetup(server) {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.on('connect', (socket) => {
    socket.on('disconnect', () => {
      const teacher = getTeacher(socket.id);
      if (teacher) deleteClassroom(teacher.classroomName, socket.id);

      // TODO: Inform teacher if student disconnects
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

    socket.on('pair students', ({ studentPairs }) => {
      pairStudents(studentPairs, socket);
    });
  });
}
