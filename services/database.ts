export const classrooms = {}; // map classroomName => {teacherSocketId, students:[socketId]}
export const teachers = {}; // map socket.id => {socket, classroomName, }
export const students = {}; // map socket.id => {socket, classroomName, realName, peerSocketId}
export const chatIds = {}; // map student socket.id => chatId

export function getClassroom(classroomName) {
  return classrooms[classroomName];
}

export function addClassroom(classroomName, socket) {
  teachers[socket.id] = { socket, classroomName };
  classrooms[classroomName] = {
    teacherSocketId: socket.id,
    students: [],
  };
}

export function deleteClassroom(teacher) {
  delete classrooms[teacher.classroomName];
  delete teachers[teacher.socket.id];
}

export function getTeacher(socketId) {
  return teachers[socketId];
}

export function getStudent(socketId) {
  return students[socketId];
}

export function addStudentToClassroom(realName, classroomName, socket) {
  students[socket.id] = {
    socket,
    classroomName,
    realName,
    peerSocketId: null,
  };

  const classroom = getClassroom(classroomName);
  // double check student has not already joined classroom
  if (classroom.students.includes(socket.id)) return;
  classroom.students.push(socket.id);

  // inform teacher
  const teacherSocket = teachers[classroom.teacherSocketId].socket;
  teacherSocket.emit('new student joined', { realName, socketId: socket.id });
}

export function remStudentFromClassroom(student) {
  const classroomName = student.classroomName;
  const classroom = getClassroom(classroomName);

  let teacherSocket = null;
  // a classroom won't exist if the teacher already left
  if (classroom) {
    classroom.students = classroom.students.filter(
      (socketId) => socketId !== student.socket.id,
    );

    const teacher = getTeacher(classroom.teacherSocketId);
    teacherSocket = teacher.socket;

    // notify teacher if the student was unpaired
    if (!student.peerSocketId) {
      teacherSocket.emit('unpaired student left', {
        socketId: student.socket.id,
      });
    }
  }
  if (student.peerSocketId) unpairStudents(student, teacherSocket);

  delete students[student.socket.id];
}

export function pairStudents(studentPairs, teacherSocket) {
  for (const [tempStudent1, tempStudent2] of studentPairs) {
    const student1 = getStudent(tempStudent1.socketId);
    const student2 = getStudent(tempStudent2.socketId);
    const chatId = student1.socket.id + '#' + student2.socket.id;

    // join them to a chat
    student1.socket.join(chatId);
    student2.socket.join(chatId);
    // map their socket ids to the chat
    chatIds[student1.socket.id] = chatId;
    chatIds[student2.socket.id] = chatId;

    // set peer ids so they can be later unpaired
    students[student1.socket.id].peerSocketId = student2.socket.id;
    students[student2.socket.id].peerSocketId = student1.socket.id;

    // exchange names between the two students and start the chat
    student1.socket.emit('chat start', {
      yourCharacter: tempStudent1.character,
      peersCharacter: tempStudent2.character,
    });
    student2.socket.emit('chat start', {
      yourCharacter: tempStudent2.character,
      peersCharacter: tempStudent1.character,
    });

    teacherSocket.emit('chat started - two students', {
      chatId,
      studentPair: [tempStudent1, tempStudent2],
    });
  }
}

function unpairStudents(student, teacherSocket) {
  const student2 = getStudent(student.peerSocketId);
  const chatId = chatIds[student.socket.id];

  // a teacher socket won't exist if the teacher already left
  if (teacherSocket) {
    teacherSocket.emit('chat ended - two students', {
      chatId,
      student2: {
        realName: student2.realName,
        socketId: student2.socket.id,
      },
    });
  }

  student.socket.to(chatId).emit('peer left chat', {});

  // remove both students from their chat
  student.socket.leave(chatId);
  student2.socket.leave(chatId);

  student.peerSocketId = null;
  student2.peerSocketId = null;

  delete chatIds[student.socket.id];
  delete chatIds[student2.socket.id];
}

export function unpairStudentChat(teacherSocket, chatId, student1, student2) {
  const stud1 = getStudent(student1.socketId);
  const stud2 = getStudent(student2.socketId);

  stud1 && stud1.socket.to(chatId).emit('peer left chat', {});
  stud2 && stud2.socket.to(chatId).emit('peer left chat', {});

  // remove both students from their chat
  stud1 && stud1.socket.leave(chatId);
  stud2 && stud2.socket.leave(chatId);

  stud1 && (stud1.peerSocketId = null);
  stud2 && (stud2.peerSocketId = null);

  stud1 && delete chatIds[stud1.socket.id];
  stud2 && delete chatIds[stud2.socket.id];

  // a teacher socket won't exist if the teacher already left
  if (teacherSocket) {
    teacherSocket.emit('student chat unpaired', {
      chatId,
      student1,
      student2,
    });
  }
}

export function sendMessage(character, message, socket) {
  const socketId = socket.id;
  const chatId = chatIds[socketId];

  // send message to other student
  socket.to(chatId).emit('chat message', { character, message });
  // send message to teacher
  const classroomName = students[socketId].classroomName;
  const classroom = getClassroom(classroomName);
  // a classroom won't exist if the teacher already left
  if (classroom) {
    socket
      .to(classroom.teacherSocketId)
      .emit('student chat message', { character, message, socketId, chatId });
  }
}

export function sendUserTyping(character, socket) {
  const chatId = chatIds[socket.id];
  socket.to(chatId).emit('peer is typing', { character });
}
