import { Socket } from 'socket.io';

export interface Classrooms {
  [classroomName: SocketId]: {
    teacherSocketId: string;
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
  [studentSocketId: SocketId]: {
    socket: Socket;
    classroomName: string;
    realName: string;
    peerSocketId: SocketId | null;
  };
}

export interface ChatIds {
  [socketId: SocketId]: string;
}

type SocketId = string;
