'use client';

import { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface MobileHeaderProps {
  title: string;
  action?: ReactNode;
}

export function MobileHeader({ title, action }: MobileHeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-gray-800"
      style={{ backgroundColor: '#16181d' }}
    >
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </header>
  );
}

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export function MobileContainer({ children, className = '' }: MobileContainerProps) {
  return (
    <div
      className={`max-w-screen-md mx-auto px-4 pb-20 ${className}`}
      style={{
        backgroundColor: '#0e0f12',
        minHeight: '100vh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: `calc(80px + env(safe-area-inset-bottom))`,
      }}
    >
      {children}
    </div>
  );
}

interface MobileShellProps {
  children: ReactNode;
  title: string;
  headerAction?: ReactNode;
}

export default function MobileShell({ children, title, headerAction }: MobileShellProps) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#0e0f12',
        fontFamily: 'Inter, Poppins, system-ui, -apple-system, sans-serif',
      }}
    >
      <MobileHeader title={title} action={headerAction} />
      <MobileContainer>{children}</MobileContainer>
      <BottomNav />
    </div>
  );
}

