'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Target, FileText, Calendar, MessageSquare, BarChart2, Settings, Search, Bookmark, Brain, CreditCard } from 'lucide-react';

const FOUNDER_NAV = [
  { icon: LayoutDashboard, label: 'Home', href: '/founder/dashboard' },
  { icon: Target, label: 'Matches', href: '/founder/dashboard/matches' },
  { icon: MessageSquare, label: 'Chat', href: '/founder/dashboard/messages' },
  { icon: Calendar, label: 'Events', href: '/founder/dashboard/events' },
  { icon: BarChart2, label: 'Stats', href: '/founder/dashboard/analytics' },
];

const INVESTOR_NAV = [
  { icon: LayoutDashboard, label: 'Home', href: '/investor/dashboard' },
  { icon: Search, label: 'Discover', href: '/investor/dashboard/discover' },
  { icon: Brain, label: 'AI Picks', href: '/investor/dashboard/recommendations' },
  { icon: MessageSquare, label: 'Chat', href: '/investor/dashboard/messages' },
  { icon: Bookmark, label: 'Saved', href: '/investor/dashboard/watchlist' },
];

interface MobileNavProps {
  role: 'FOUNDER' | 'INVESTOR';
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = role === 'FOUNDER' ? FOUNDER_NAV : INVESTOR_NAV;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-card-bg/95 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(item => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0 ${
                isActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate max-w-full">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
