'use client';

import { motion } from 'framer-motion';
import { Eye, Target, MessageSquare, Star, TrendingUp, UserPlus, Calendar } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  match: Target,
  view: Eye,
  message: MessageSquare,
  connection: UserPlus,
  event: Calendar,
  upgrade: TrendingUp,
};

const COLOR_MAP: Record<string, string> = {
  match: '#8b5cf6',
  view: '#0ea5e9',
  message: '#06b6d4',
  connection: '#10b981',
  event: '#f59e0b',
  upgrade: '#ec4899',
};

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="font-display font-bold text-lg text-white mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <TrendingUp className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No recent activity</p>
          <p className="text-gray-600 text-xs mt-1">Activity will appear here as you use the platform.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="font-display font-bold text-lg text-white mb-4">Recent Activity</h3>
      <div className="space-y-0">
        {activities.slice(0, 10).map((activity, i) => {
          const Icon = ICON_MAP[activity.type] || Star;
          const color = COLOR_MAP[activity.type] || '#0ea5e9';
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 py-3 border-b border-white/3 last:border-0"
            >
              <div className="relative flex items-start pt-0.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 z-10"
                  style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                {i < activities.length - 1 && (
                  <div className="absolute top-8 left-4 w-px h-full bg-white/5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{activity.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{activity.description}</p>
                <p className="text-gray-600 text-xs mt-1">
                  {new Date(activity.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
