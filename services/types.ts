import { Socket } from 'socket.io';

export interface Classrooms {
  [classroomName: string]: {
    teacherSocketId: SocketId;
    students: SocketId[];
  };
}

export interface Teachers {
  [teacherSocketId: SocketId]: {
    socket: Socket;
    classroomName: string;
  };
}

export interface Students {
  [studentSocketId: SocketId]: Student;
}

export interface Student {
  socket: Socket;
  classroomName: string;
  realName: string;
  peerSocketId: SocketId | null;
}

export interface ChatIds {
  [socketId: SocketId]: ChatId;
}

export type ChatId = '${SocketId}#${SocketId}';

type SocketId = string;
