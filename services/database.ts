export const classrooms = {}; // map classroomName => {teacherSocketId, students:[socketId]}
export const teachers = {}; // map socket.handshake.query.token => {socket, classroomName, }
export const students = {}; // map socket.handshake.query.token => {socket, classroomName, realName, peerSocketId}
export const chatIds = {}; // map student socket.handshake.query.token => chatId
export const messages = {}; // for keeping track of messages so they can be restored after reconnecting
export const timeouts = {}; // for keeping track of cancelleable timesout (ie: removing a stale student)

export function getClassroom(classroomName) {
  return classrooms[classroomName];
}

export function addClassroom(classroomName, socket) {
  const socketID = socket.handshake.query.token;
  // check to make sure we do not overwrite a class in session
  if (classrooms[classroomName]) return;
  teachers[socketID] = { socket, classroomName, token: socketID };
  classrooms[classroomName] = {
    teacherSocketId: socketID,
    students: [],
  };
}

export function deleteClassroom(teacher) {
  // only the teacher that created the class should be allowed to delete
  if (classrooms[teacher.classroomName].teacherSocketId != teacher.token)
    return;
  delete classrooms[teacher.classroomName];
  delete teachers[teacher.token];
}

export function getTeacher(socketId) {
  return teachers[socketId];
}

export function getStudent(socketId) {
  return students[socketId];
}

export function addStudentToClassroom(realName, classroomName, socket) {
  const sid = socket.handshake.query.token;
  if (!students[sid])
    students[sid] = {
      classroomName,
      realName,
      token: sid,
      peerSocketId: null,
    };
  students[sid].socket = socket;

  const classroom = getClassroom(classroomName);
  if (!classroom) {
    console.log('No Classroom Found!');
    return;
  }

  // double check student has not already joined classroom
  if (classroom.students.includes(sid)) {
    // if a remStudentFromClassroom timeout is present cancel it
    timeouts[sid] && timeouts[sid].cancel();

    // Not sure if we need this just yet.
    // socket.emit('student already in classroom - rejoin');

    const peerID = students[sid].peerSocketId;
    if (peerID) {
      socket.join(students[sid].chatId);
      socket.emit('chat start', {
        yourCharacter: students[sid].character,
        peersCharacter: students[peerID].character,
        messages: messages[students[sid].chatId],
      });
    }
    return;
  }
  classroom.students.push(sid);

  // inform teacher
  const teacherSocket = teachers[classroom.teacherSocketId].socket;
  teacherSocket.emit('new student joined', {
    realName,
    socketId: sid,
  });
}

export async function remStudentFromClassroom(student, force = false) {
  const sid = student.token;

  if (!force) {
    // if there is a timeout in progress cancel it (prevent duplicate timers)
    timeouts[sid] && timeouts[sid].cancel();

    // wait for a specified time before allowing the student to be removed
    // this gives them a chance to rejoin.
    const results = await delay(0.5 * 60 * 1000, sid);

    // if the timeout was cancelled (by student rejoining) then return early
    if (results === 'cancelled') return;
  }

  const classroomName = student.classroomName;
  const classroom = getClassroom(classroomName);

  let teacherSocket = null;
  // a classroom won't exist if the teacher already left
  if (classroom) {
    classroom.students = classroom.students.filter((s) => s !== sid);

    const teacher = getTeacher(classroom.teacherSocketId);
    teacherSocket = teacher.socket;

    // notify teacher if the student was unpaired
    if (!student.peerSocketId) {
      teacherSocket.emit('unpaired student left', {
        socketId: sid,
      });
    }
  }
  if (student.peerSocketId) unpairStudents(student, teacherSocket);

  delete students[sid];
}

export function pairStudents(studentPairs, teacherSocket) {
  for (const [tempStudent1, tempStudent2] of studentPairs) {
    const student1 = getStudent(tempStudent1.socketId);
    const student2 = getStudent(tempStudent2.socketId);
    if (!(student1 && student2)) {
      console.log(
        'Attempted to pair students failed, student not found',
        student1,
        student2,
      );
      return;
    }
    const chatId = student1.token + '#' + student2.token;

    // join them to a chat
    student1.socket.join(chatId);
    student2.socket.join(chatId);

    student1.character = tempStudent1.character;
    student2.character = tempStudent2.character;

    student1.chatId = chatId;
    student2.chatId = chatId;

    // map their socket ids to the chat
    chatIds[student1.token] = chatId;
    chatIds[student2.token] = chatId;

    messages[chatId] = [];

    // set peer ids so they can be later unpaired
    students[student1.token].peerSocketId = student2.token;
    students[student2.token].peerSocketId = student1.token;

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
  const chatId = chatIds[student.token];

  // a teacher socket won't exist if the teacher already left
  if (teacherSocket) {
    teacherSocket.emit('chat ended - two students', {
      chatId,
      student2: {
        realName: student2.realName,
        socketId: student2.token,
      },
    });
  }

  student.socket.to(chatId).emit('peer left chat', {});

  // remove both students from their chat
  student.socket.leave(chatId);
  student2.socket.leave(chatId);

  student.peerSocketId = null;
  student2.peerSocketId = null;

  delete chatIds[student.token];
  delete chatIds[student2.socketId];
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

  stud1 && delete chatIds[stud1.token];
  stud2 && delete chatIds[stud2.token];

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
  const socketId = socket.handshake.query.token;
  const chatId = chatIds[socketId];

  // a student won't exist if they have been deleted
  if (!students[socketId]) return;

  // send message to other student
  socket.to(chatId).emit('chat message', { character, message });
  if (!messages[chatId]) {
    console.log('Attempted to sendMessage, no chat found', messages, chatId);
    return;
  }
  messages[chatId].push({ character, message });

  const classroomName = students[socketId].classroomName;
  const classroom = getClassroom(classroomName);

  // a classroom won't exist if the teacher already left
  if (classroom) {
    // send message to teacher
    teachers[classroom.teacherSocketId].socket.emit('student chat message', {
      character,
      message,
      socketId,
      chatId,
    });
  }
}

export function sendUserTyping(character, socket) {
  const chatId = chatIds[socket.handshake.query.token];
  socket.to(chatId).emit('peer is typing', { character });
}

function delay(milisec, id) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve('completed');
    }, milisec);
    timeouts[id] = {
      timeout,
      cancel: () => {
        clearTimeout(timeout);
        delete timeouts[id];
        resolve('cancelled');
      },
    };
  });
}
