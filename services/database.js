export const classrooms = {}; // map classroomName => {teacherSocketId, students:[{name, socketId}]}
export const teachers = {}; // map socket.id => {socket, classroomName}
export const students = {}; // map socket.id => socket
export const studentRooms = {}; // map student socket.id => room

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

export function addStudentToClassroom(studentName, classroomName, socket) {
  // add student
  students[socket.id] = socket;
  const student = { name: studentName, socketId: socket.id };
  const classroom = classrooms[classroomName];
  classroom.students.push(student);

  // inform teacher
  const teacherSocket = teachers[classroom.teacherSocketId].socket;
  teacherSocket.emit('new student joined', student);
}

export function pairStudents(studentPairs, teacherSocket) {
  console.log(studentPairs);
  for (const [student1, student2] of studentPairs) {
    const room = student1.socketId + '#' + student2.socketId;
    const student1Socket = students[student1.socketId];
    const student2Socket = students[student2.socketId];
    // join them to a room
    student1Socket.join(room);
    student2Socket.join(room);
    // register the room to their socket ids
    studentRooms[student1.socketId] = room;
    studentRooms[student2.socketId] = room;
    // exchange names between the two students and start the chat
    student1Socket.emit('chat start', { peersName: student2.name });
    student2Socket.emit('chat start', { peersName: student1.name });

    // TODO: implement a way for teacher to listen in on students' chat messages
  }
}
