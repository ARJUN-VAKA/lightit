'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Search, Bookmark, Brain, MessageSquare,
  Calendar, CreditCard, BarChart2, Settings, LogOut, Zap, Bell, Menu, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DashboardBackground } from '@/components/three/DashboardBackground';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { MobileNav } from '@/components/dashboard/MobileNav';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview',      href: '/investor/dashboard' },
  { icon: Search,          label: 'Discover',      href: '/investor/dashboard/discover' },
  { icon: Brain,           label: 'AI Picks',      href: '/investor/dashboard/recommendations', badge: 'New' },
  { icon: Bookmark,        label: 'Watchlist',     href: '/investor/dashboard/watchlist' },
  { icon: MessageSquare,   label: 'Messages',      href: '/investor/dashboard/messages' },
  { icon: Calendar,        label: 'Events',        href: '/investor/dashboard/events' },
  { icon: BarChart2,       label: 'Analytics',     href: '/investor/dashboard/analytics' },
  { icon: CreditCard,      label: 'Subscription',  href: '/investor/dashboard/subscription' },
  { icon: Settings,        label: 'Settings',      href: '/investor/dashboard/settings' },
];

function Sidebar({ user, onLogout }: { user: any; onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 h-screen sticky top-0 flex-col bg-card-bg/80 backdrop-blur-xl border-r border-white/5 hidden md:flex">
      <div className="flex items-center gap-2 p-5 border-b border-white/5 h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">LightIt</span>
        </Link>
      </div>

      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'I'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name || 'Investor'}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>

      <nav className="p-3 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/investor/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={`sidebar-item ${isActive ? 'active' : ''}`}>
                  <item.icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                  <span>{item.label}</span>
                  {item.badge && <span className="ml-auto badge badge-blue text-xs py-0.5 px-1.5">{item.badge}</span>}
                  {item.label === 'Messages' && <span className="ml-auto w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">5</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-white/5">
        <button onClick={onLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut style={{ width: 18, height: 18 }} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

interface InvestorLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function InvestorLayout({ children, title = 'Dashboard', subtitle }: InvestorLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const stored = localStorage.getItem('user');
    if (!token || !stored) { router.replace('/auth/investor'); return; }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== 'INVESTOR' && parsed.role !== 'ADMIN') { router.replace('/auth/investor'); return; }
      setUser(parsed);
    } catch { router.replace('/auth/investor'); }
  }, [router]);

  useEffect(() => { setMobileMenu(false); }, [pathname]);

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
    <div className="flex min-h-screen bg-deep-black relative">
      <DashboardBackground />
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col relative z-10">
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-deep-black/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="font-display font-bold text-lg md:text-xl text-white">{title}</h1>
              {subtitle && <p className="text-gray-500 text-xs hidden sm:block">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            <button
              onClick={() => setNotifOpen(true)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
            </button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-card-bg/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'I'}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{user?.name || 'Investor'}</p>
                <p className="text-gray-500 text-xs">{user?.email || ''}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</div>
      </main>
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <MobileNav role="INVESTOR" />
    </div>
  );
}
