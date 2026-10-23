import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let io: SocketIOServer | null = null;

// Map of userId -> Set of Socket IDs
const userSockets = new Map<string, Set<string>>();

// Set of currently online user IDs
const onlineUsers = new Set<string>();

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // JWT / Bearer Token Authentication Middleware
  io.use(async (socket: Socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!authHeader) {
        return next(new Error('Authentication error: Token required'));
      }
      const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
      if (!token) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Resolve user ID
      (socket as any).userId = token;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    if (!userId) {
      socket.disconnect();
      return;
    }

    // Track user socket
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);
    onlineUsers.add(userId);

    // Broadcast presence update
    io?.emit('presence:update', { userId, status: 'online', onlineUserIds: Array.from(onlineUsers) });

    // Join project room handler
    socket.on('project:join', async (projectId: string) => {
      try {
        if (!projectId) return;
        // Verify user is member or owner
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            members: {
              where: { status: 'active' }
            }
          }
        });

        if (!project) {
          socket.emit('error', { message: 'Project not found' });
          return;
        }

        const isOwner = project.ownerId === userId;
        const isMember = project.members.some(m => m.userId === userId);

        if (!isOwner && !isMember) {
          socket.emit('error', { message: 'Forbidden: Not a member of this project' });
          return;
        }

        socket.join(`project_${projectId}`);
        socket.emit('project:joined', { projectId });
      } catch (e) {
        console.error('Error in project:join', e);
      }
    });

    // Leave project room
    socket.on('project:leave', (projectId: string) => {
      socket.leave(`project_${projectId}`);
    });

    // Join direct 1:1 chat room handler
    socket.on('chat:join', async (chatId: string) => {
      try {
        if (!chatId) return;
        const room = await prisma.chatRoom.findUnique({
          where: { id: chatId }
        });

        if (!room) {
          socket.emit('error', { message: 'Chat room not found' });
          return;
        }

        // Privacy: only participants
        if (room.type === 'direct') {
          if (room.participant1Id !== userId && room.participant2Id !== userId) {
            socket.emit('error', { message: 'Forbidden: Private 1:1 chat' });
            return;
          }
        }

        socket.join(`chat_${chatId}`);
        socket.emit('chat:joined', { chatId });
      } catch (e) {
        console.error('Error in chat:join', e);
      }
    });

    // Leave direct chat
    socket.on('chat:leave', (chatId: string) => {
      socket.leave(`chat_${chatId}`);
    });

    // Typing indicators
    socket.on('typing:start', (data: { roomId?: string; projectId?: string; name?: string }) => {
      if (data.projectId) {
        socket.to(`project_${data.projectId}`).emit('typing:start', {
          userId,
          name: data.name || userId,
          projectId: data.projectId,
          roomId: data.roomId
        });
      }
      if (data.roomId) {
        socket.to(`chat_${data.roomId}`).emit('typing:start', {
          userId,
          name: data.name || userId,
          roomId: data.roomId
        });
      }
    });

    socket.on('typing:stop', (data: { roomId?: string; projectId?: string }) => {
      if (data.projectId) {
        socket.to(`project_${data.projectId}`).emit('typing:stop', {
          userId,
          projectId: data.projectId,
          roomId: data.roomId
        });
      }
      if (data.roomId) {
        socket.to(`chat_${data.roomId}`).emit('typing:stop', {
          userId,
          roomId: data.roomId
        });
      }
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
          onlineUsers.delete(userId);
          io?.emit('presence:update', { userId, status: 'offline', onlineUserIds: Array.from(onlineUsers) });
        }
      }
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastToProject(projectId: string, event: string, payload: any) {
  if (io) {
    io.to(`project_${projectId}`).emit(event, payload);
  }
}

export function broadcastToChat(chatId: string, event: string, payload: any) {
  if (io) {
    io.to(`chat_${chatId}`).emit(event, payload);
  }
}

export function removeUserFromProjectRoom(projectId: string, userId: string) {
  if (!io) return;
  const socketIds = userSockets.get(userId);
  if (socketIds) {
    socketIds.forEach(socketId => {
      const socket = io!.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(`project_${projectId}`);
        socket.emit('project:kicked', { projectId, message: 'You have been removed from this project.' });
      }
    });
  }
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}

export function getOnlineUsers(): string[] {
  return Array.from(onlineUsers);
}
