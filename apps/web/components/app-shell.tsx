'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, FolderKanban, LayoutDashboard, LogOut, Moon, Sun, CheckSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/auth-context';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
const navigation = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/tasks', label: 'My tasks', icon: CheckSquare },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  useEffect(() => {
    const pollNotifications = () => {
      void api<Array<{ readAt?: string }>>('/notifications').then((notifications) =>
        setNotificationCount(notifications.filter((notification) => !notification.readAt).length),
      );
    };
    pollNotifications();
    const intervalId = setInterval(pollNotifications, 5000);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-r bg-card p-5">
        <Link href="/dashboard" className="mb-10 flex items-center gap-2 text-xl font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
            B
          </span>
          BugForge
        </Link>
        <nav className="space-y-1">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                path.startsWith(href) ? 'bg-primary text-white' : 'hover:bg-muted',
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-10 border-t pt-5">
          <p className="px-3 text-sm font-medium">{user?.name ?? 'Workspace member'}</p>
          <p className="px-3 text-xs text-slate-500">{user?.email}</p>
          <Button
            variant="ghost"
            className="mt-3 w-full justify-start gap-3"
            onClick={() => {
              signOut();
              router.push('/login');
            }}
          >
            <LogOut size={18} />
            Sign out
          </Button>
        </div>
      </aside>
      <main>
        <header className="flex h-16 items-center justify-end gap-2 border-b px-6">
          <Button variant="ghost" size="icon" aria-label={`Notifications (${notificationCount})`}>
            <Bell size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </header>
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  );
}
