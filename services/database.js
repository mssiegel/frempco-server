export const classrooms = {}; // map classroomName => {teacherSocketId, students:[{name, socketId}]}
export const teachers = {}; // map socket.id => {socket, classroomName}
export const students = {}; // map socket.id => socket

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
