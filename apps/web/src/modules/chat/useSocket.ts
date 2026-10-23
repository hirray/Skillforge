import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface UseSocketOptions {
  projectId?: string;
  chatId?: string;
  onNewMessage?: (message: any) => void;
  onEditMessage?: (message: any) => void;
  onDeleteMessage?: (message: any) => void;
  onReadMessage?: (data: { roomId: string; userId: string }) => void;
  onTypingStart?: (data: { userId: string; name: string; projectId?: string; roomId?: string }) => void;
  onTypingStop?: (data: { userId: string; projectId?: string; roomId?: string }) => void;
  onPresenceUpdate?: (data: { userId: string; status: 'online' | 'offline'; onlineUserIds: string[] }) => void;
  onProjectKicked?: (data: { projectId: string; message: string }) => void;
}

export function useSocket({
  projectId,
  chatId,
  onNewMessage,
  onEditMessage,
  onDeleteMessage,
  onReadMessage,
  onTypingStart,
  onTypingStop,
  onPresenceUpdate,
  onProjectKicked,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  const currentUserId = localStorage.getItem('token') || 'user-001';

  useEffect(() => {
    const socket = io('http://localhost:4000', {
      auth: { token: currentUserId },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (projectId) {
        socket.emit('project:join', projectId);
      }
      if (chatId) {
        socket.emit('chat:join', chatId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('presence:update', (data: { userId: string; status: string; onlineUserIds: string[] }) => {
      if (data?.onlineUserIds) {
        setOnlineUserIds(data.onlineUserIds);
      }
      onPresenceUpdate?.(data as any);
    });

    socket.on('message:new', (msg: any) => {
      onNewMessage?.(msg);
    });

    socket.on('message:edit', (msg: any) => {
      onEditMessage?.(msg);
    });

    socket.on('message:delete', (msg: any) => {
      onDeleteMessage?.(msg);
    });

    socket.on('message:read', (data: any) => {
      onReadMessage?.(data);
    });

    socket.on('typing:start', (data: any) => {
      if (data.userId !== currentUserId) {
        onTypingStart?.(data);
      }
    });

    socket.on('typing:stop', (data: any) => {
      if (data.userId !== currentUserId) {
        onTypingStop?.(data);
      }
    });

    socket.on('project:kicked', (data: any) => {
      onProjectKicked?.(data);
    });

    return () => {
      if (projectId) {
        socket.emit('project:leave', projectId);
      }
      if (chatId) {
        socket.emit('chat:leave', chatId);
      }
      socket.disconnect();
    };
  }, [projectId, chatId, currentUserId]);

  const emitTypingStart = useCallback(
    (name?: string) => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('typing:start', {
          projectId,
          roomId: chatId,
          name: name || currentUserId,
        });
      }
    },
    [projectId, chatId, currentUserId]
  );

  const emitTypingStop = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing:stop', {
        projectId,
        roomId: chatId,
      });
    }
  }, [projectId, chatId]);

  return {
    socket: socketRef.current,
    isConnected,
    onlineUserIds,
    emitTypingStart,
    emitTypingStop,
  };
}
