'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';

interface MobileHeaderProps {
  title: string;
  action?: ReactNode;
}

export function MobileHeader({ title, action }: MobileHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-gray-800"
      style={{ 
        backgroundColor: '#16181d',
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
      }}
    >
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </motion.header>
  );
}

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export function MobileContainer({ children, className = '' }: MobileContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`max-w-screen-md mx-auto px-4 pb-20 ${className}`}
      style={{
        backgroundColor: '#0e0f12',
        minHeight: '100vh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: `calc(80px + env(safe-area-inset-bottom))`,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  );
}

interface MobileShellProps {
  children: ReactNode;
  title: string;
  headerAction?: ReactNode;
}

export default function MobileShell({ children, title, headerAction }: MobileShellProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Mise à jour fluide du contenu lors du changement de page
    setDisplayChildren(children);
  }, [pathname, children]);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#0e0f12',
        fontFamily: 'Inter, Poppins, system-ui, -apple-system, sans-serif',
      }}
    >
      <MobileHeader title={title} action={headerAction} />
      <AnimatePresence mode="wait">
        <MobileContainer key={pathname}>{displayChildren}</MobileContainer>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}

