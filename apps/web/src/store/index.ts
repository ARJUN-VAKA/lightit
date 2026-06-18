import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: 'FOUNDER' | 'INVESTOR' | 'ADMIN';
  name?: string;
  emailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setUser: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, accessToken, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  initFromStorage: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, accessToken: token, isAuthenticated: true });
      } catch {}
    }
  },
}));

// ─── Chat Store ───────────────────────────────────────────────
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  messageType: string;
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatState {
  activeChat: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, string[]>;
  setActiveChat: (chatId: string | null) => void;
  addMessage: (chatId: string, message: Message) => void;
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
  markRead: (chatId: string, messageId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChat: null,
  messages: {},
  typingUsers: {},

  setActiveChat: (chatId) => set({ activeChat: chatId }),

  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),

  setTyping: (chatId, userId, isTyping) =>
    set((state) => {
      const current = state.typingUsers[chatId] || [];
      const updated = isTyping
        ? [...new Set([...current, userId])]
        : current.filter((id) => id !== userId);
      return { typingUsers: { ...state.typingUsers, [chatId]: updated } };
    }),

  markRead: (chatId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m.id === messageId ? { ...m, isRead: true } : m
        ),
      },
    })),
}));

// ─── Notification Store ───────────────────────────────────────
interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => void;
  setNotifications: (ns: Notification[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + (n.isRead ? 0 : 1),
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  setNotifications: (ns) =>
    set({
      notifications: ns,
      unreadCount: ns.filter((n) => !n.isRead).length,
    }),
}));
