export const classrooms = {}; // map classroomName => {teacherSocketId, students:[{realName, socketId}]}
export const teachers = {}; // map socket.id => {classroomName, socket}
export const students = {}; // map socket.id => {classroomName, socket}
export const rooms = {}; // map student socket.id => socketRoom

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
    const socketRoom = student1.socketId + '#' + student2.socketId;
    const student1Socket = students[student1.socketId].socket;
    const student2Socket = students[student2.socketId].socket;
    // join them to a room
    student1Socket.join(socketRoom);
    student2Socket.join(socketRoom);
    // register the socket room to their socket ids
    rooms[student1.socketId] = socketRoom;
    rooms[student2.socketId] = socketRoom;
    // exchange names between the two students and start the chat
    student1Socket.emit('chat start', {
      yourCharacter: student1.character,
      peersCharacter: student2.character,
    });
    student2Socket.emit('chat start', {
      yourCharacter: student2.character,
      peersCharacter: student1.character,
    });

    // TODO: write an event listener on teacher's front end for this chat event
    teacherSocket.emit('chat started - two students', {
      socketRoom,
      studentPair: [student1, student2],
    });
  }
}
