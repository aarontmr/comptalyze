'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Calculator, BarChart3, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getUserSubscription } from '@/lib/subscriptionUtils';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresPremium?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Aperçu', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Calcul', href: '/dashboard/simulateur', icon: Calculator },
  { label: 'Statistiques', href: '/dashboard/statistiques', icon: BarChart3, requiresPremium: true },
  { label: 'Compte', href: '/dashboard/compte', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const subscription = getUserSubscription(user);
  const filteredNavItems = navItems.filter((item) => {
    if (item.requiresPremium && !subscription.isPremium) return false;
    return true;
  });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 pb-safe"
      style={{
        backgroundColor: '#16181d',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        minHeight: '60px',
      }}
    >
      <div className={`max-w-screen-md mx-auto grid`} style={{ gridTemplateColumns: `repeat(${filteredNavItems.length}, minmax(0, 1fr))` }}>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 min-h-[60px] transition-colors ${
                isActive ? 'text-white' : 'text-gray-400'
              }`}
              aria-label={item.label}
            >
              <div className="relative flex items-center justify-center h-6">
                <Icon className="w-5 h-5" />
                {isActive && (
                  <div
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #00D084 0%, #2E6CF6 100%)',
                    }}
                  />
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-medium leading-tight max-w-full px-1 text-center overflow-hidden text-ellipsis whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

