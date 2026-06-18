import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import { prisma } from '../lib/prisma';

let io: SocketServer;

const onlineUsers = new Map<string, string>(); // userId -> socketId

function encryptMessage(content: string): string {
  return CryptoJS.AES.encrypt(content, process.env.ENCRYPTION_KEY || 'lightit-secret').toString();
}

function decryptMessage(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, process.env.ENCRYPTION_KEY || 'lightit-secret');
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function initSocketServer(server: HttpServer) {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // ─── Auth Middleware ──────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        email: string;
        role: string;
      };
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ─── Connection Handler ───────────────────────────────────
  io.on('connection', (socket) => {
    const user = (socket as any).user;
    console.log(`🔌 Socket connected: ${user.id} (${user.role})`);

    // Mark user online
    onlineUsers.set(user.id, socket.id);
    io.emit('user:online', { userId: user.id });

    // ─── Join Chat Room ───────────────────────────────────
    socket.on('chat:join', async ({ chatId }: { chatId: string }) => {
      try {
        const chat = await prisma.chat.findUnique({ where: { id: chatId } });
        if (!chat || !chat.isActive) return socket.emit('error', { message: 'Chat not found' });
        socket.join(`chat:${chatId}`);
        socket.emit('chat:joined', { chatId });
      } catch (err) {
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // ─── Send Message ─────────────────────────────────────
    socket.on('message:send', async (data: {
      chatId: string;
      content: string;
      messageType?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
    }) => {
      try {
        const { chatId, content, messageType = 'text', fileUrl, fileName, fileSize } = data;

        const encryptedContent = encryptMessage(content);

        const message = await prisma.message.create({
          data: {
            chatId,
            senderId: user.id,
            content: encryptedContent,
            messageType,
            fileUrl,
            fileName,
            fileSize,
          },
        });

        // Emit to chat room with decrypted content for display
        const payload = {
          ...message,
          content, // send plain to room members
        };

        io.to(`chat:${chatId}`).emit('message:new', payload);

        // Update chat timestamp
        await prisma.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── Typing Indicators ────────────────────────────────
    socket.on('typing:start', ({ chatId }: { chatId: string }) => {
      socket.to(`chat:${chatId}`).emit('typing:started', { userId: user.id });
    });

    socket.on('typing:stop', ({ chatId }: { chatId: string }) => {
      socket.to(`chat:${chatId}`).emit('typing:stopped', { userId: user.id });
    });

    // ─── Read Receipts ────────────────────────────────────
    socket.on('message:read', async ({ chatId, messageId }: { chatId: string; messageId: string }) => {
      await prisma.message.update({
        where: { id: messageId },
        data: { isRead: true, readAt: new Date() },
      });
      socket.to(`chat:${chatId}`).emit('message:read', { messageId, readAt: new Date() });
    });

    // ─── Meeting Request ──────────────────────────────────
    socket.on('meeting:request', async (data: {
      chatId: string;
      proposedTime: string;
      agenda: string;
    }) => {
      const { chatId, proposedTime, agenda } = data;
      const content = JSON.stringify({ type: 'meeting_request', proposedTime, agenda });
      const message = await prisma.message.create({
        data: { chatId, senderId: user.id, content: encryptMessage(content), messageType: 'meeting_request' },
      });
      io.to(`chat:${chatId}`).emit('message:new', { ...message, content: JSON.parse(content) });
    });

    // ─── Notifications ────────────────────────────────────
    socket.on('notification:subscribe', () => {
      socket.join(`notifications:${user.id}`);
    });

    // ─── Disconnect ───────────────────────────────────────
    socket.on('disconnect', () => {
      onlineUsers.delete(user.id);
      io.emit('user:offline', { userId: user.id });
      console.log(`🔌 Socket disconnected: ${user.id}`);
    });
  });

  return io;
}

export const getSocketServer = () => io;

export const sendNotification = async (userId: string, notification: {
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown>;
}) => {
  if (io) {
    io.to(`notifications:${userId}`).emit('notification:new', notification);
  }
};

export const isUserOnline = (userId: string) => onlineUsers.has(userId);
