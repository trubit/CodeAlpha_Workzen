import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { ENV } from '../config/env.js';

let globalIO: SocketIOServer | null = null;

export const getIO = (): SocketIOServer | null => globalIO;

export const initializeSocket = (httpServer: HttpServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ENV.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  globalIO = io;

  io.on('connection', (socket: Socket) => {
    console.log(`[WORKZEN Socket] Client connected: ${socket.id}`);

    // Join tenant-scoped room
    socket.on('tenant:join', (data: { organisationId: string; workspaceId?: string }) => {
      if (data.organisationId) {
        socket.join(`org:${data.organisationId}`);
        console.log(`[WORKZEN Socket] Socket ${socket.id} joined org:${data.organisationId}`);
      }
      if (data.workspaceId) {
        socket.join(`workspace:${data.workspaceId}`);
      }
    });

    // Project real-time room for Kanban syncing
    socket.on('project:join', (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`[WORKZEN Socket] Socket ${socket.id} joined project:${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[WORKZEN Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

