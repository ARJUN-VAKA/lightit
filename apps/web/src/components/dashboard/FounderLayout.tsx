'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Target, FileText, Calendar, MessageSquare,
  BarChart2, Settings, LogOut, Rocket, ChevronRight, Bell,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview',         href: '/founder/dashboard' },
  { icon: Target,          label: 'Investor Matches', href: '/founder/dashboard/matches' },
  { icon: FileText,        label: 'Pitch Deck',       href: '/founder/dashboard/pitch' },
  { icon: Calendar,        label: 'Events',           href: '/founder/dashboard/events' },
  { icon: MessageSquare,   label: 'Messages',         href: '/founder/dashboard/messages' },
  { icon: BarChart2,       label: 'Analytics',        href: '/founder/dashboard/analytics' },
  { icon: Settings,        label: 'Settings',         href: '/founder/dashboard/settings' },
];

function Sidebar({ user, onLogout }: { user: any; onLogout: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 h-screen sticky top-0 flex flex-col transition-all duration-300 bg-card-bg border-r border-white/5`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
              <Rocket className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-white">LightIt</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-500 hover:text-white p-1">
          <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* User profile */}
      {!collapsed && (
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'F'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name || 'Founder'}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email || ''}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Profile Complete</span><span>72%</span>
            </div>
            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: '72%' }} /></div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-3 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/founder/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={`sidebar-item ${isActive ? 'active' : ''}`}>
                  <item.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.label === 'Messages' && (
                    <span className="ml-auto w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button onClick={onLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut style={{ width: 18, height: 18 }} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}

interface FounderLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function FounderLayout({ children, title = 'Dashboard', subtitle }: FounderLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const stored = localStorage.getItem('user');
    if (!token || !stored) { router.replace('/auth/founder'); return; }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== 'FOUNDER' && parsed.role !== 'ADMIN') { router.replace('/auth/founder'); return; }
      setUser(parsed);
    } catch { router.replace('/auth/founder'); }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    toast.success('Signed out successfully.');
    router.push('/');
  };

  if (!user) return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-deep-black">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-deep-black/90 backdrop-blur-xl">
          <div>
            <h1 className="font-display font-bold text-xl text-white">{title}</h1>
            {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
            {!subtitle && <p className="text-gray-500 text-xs">Welcome back, {user.name}</p>}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
            </button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)' }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
