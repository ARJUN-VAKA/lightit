'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, MessageSquare, Calendar, Target, TrendingUp, UserPlus, Check } from 'lucide-react';
import axios from '@/lib/axios';

const API = process.env.NEXT_PUBLIC_API_URL;

const ICON_MAP: Record<string, typeof Bell> = {
  MATCH: Target,
  MESSAGE: MessageSquare,
  EVENT: Calendar,
  VIEW: TrendingUp,
  CONNECTION: UserPlus,
};

const COLOR_MAP: Record<string, string> = {
  MATCH: '#a4161a',
  MESSAGE: '#e5383b',
  EVENT: '#ba181b',
  VIEW: '#f59e0b',
  CONNECTION: '#b1a7a6',
};

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axios.get(`${API}/notifications`)
      .then(r => setNotifications(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const markRead = async (id: string) => {
    try {
      await axios.patch(`${API}/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await axios.patch(`${API}/notifications/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-card-bg border-l border-white/5 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-400" />
                <h2 className="font-display font-bold text-lg text-white">Notifications</h2>
                {unread > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400">
                    {unread} new
                  </span>
                )}
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {unread > 0 && (
              <div className="px-5 py-2 border-b border-white/5">
                <button
                  onClick={markAllRead}
                  className="text-xs text-red-400 hover:text-red-400 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all as read
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="text-center py-10 text-gray-500 text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-16">
                  <Bell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No notifications yet</p>
                  <p className="text-gray-600 text-xs mt-1">
                    You'll see updates about matches, messages, and events here.
                  </p>
                </div>
              ) : (
                notifications.map((n, i) => {
                  const Icon = ICON_MAP[n.type] || Bell;
                  const color = COLOR_MAP[n.type] || '#e5383b';
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => !n.isRead && markRead(n.id)}
                      className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                        n.isRead ? 'opacity-60' : 'bg-white/3 border border-white/5'
                      } hover:bg-white/5`}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold">{n.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{n.body}</p>
                        <p className="text-gray-600 text-xs mt-1">
                          {new Date(n.createdAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0 mt-1" />
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
