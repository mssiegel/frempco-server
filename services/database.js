export const classrooms = {}; // map classroomName => {teacherSocketId, students:[{realName, socketId}]}
export const teachers = {}; // map socket.id => {classroomName, socket}
export const students = {}; // map socket.id => {classroomName, socket}
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

export function deleteClassroom(classroomName, teacherSocketId) {
  delete classrooms[classroomName];
  delete teachers[teacherSocketId];
}

export function getTeacher(socketId) {
  return teachers[socketId];
}

export function addStudentToClassroom(studentRealName, classroomName, socket) {
  // add student
  students[socket.id] = { socket, classroomName };
  const student = { realName: studentRealName, socketId: socket.id };
  const classroom = classrooms[classroomName];
  classroom.students.push(student);

  // inform teacher
  const teacherSocket = teachers[classroom.teacherSocketId].socket;
  teacherSocket.emit('new student joined', student);
}

export function pairStudents(studentPairs, teacherSocket) {
  console.log(studentPairs);
  for (const [student1, student2] of studentPairs) {
    const chatId = student1.socketId + '#' + student2.socketId;
    const student1Socket = students[student1.socketId].socket;
    const student2Socket = students[student2.socketId].socket;
    // join them to a chat
    student1Socket.join(chatId);
    student2Socket.join(chatId);
    // map their socket ids to the chat
    chatIds[student1.socketId] = chatId;
    chatIds[student2.socketId] = chatId;
    // exchange names between the two students and start the chat
    student1Socket.emit('chat start', {
      yourCharacter: student1.character,
      peersCharacter: student2.character,
    });
    student2Socket.emit('chat start', {
      yourCharacter: student2.character,
      peersCharacter: student1.character,
    });

    teacherSocket.emit('chat started - two students', {
      chatId,
      studentPair: [student1, student2],
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
  const teacherSocketId = classrooms[classroomName].teacherSocketId;
  socket
    .to(teacherSocketId)
    .emit('student chat message', { character, message, socketId, chatId });
}

export function sendUserTyping(character, message, socket) {
  const socketId = socket.id;
  const chatId = chatIds[socketId];
  const student = students[socketId];
  if (!student) return;
  student.lastKnownCharacterName = character;
  // send message to other student
  socket.to(chatId).emit('peer is typing', { character, message });
  // send message to teacher
  const classroomName = students[socketId].classroomName;
  const teacherSocketId = classrooms[classroomName].teacherSocketId;
  socket
    .to(teacherSocketId)
    .emit('student is typing', { character, message, socketId, chatId });
}
