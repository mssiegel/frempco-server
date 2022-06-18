export interface Classrooms {
  [classroomName: string]: {
    teacherSocketId: string;
    students: string[];
  };
}
