import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl p-6 ${className}`}
      style={{
        backgroundColor: '#16181d',
        border: '1px solid rgba(45, 52, 65, 0.5)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      }}
    >
      {children}
    </div>
  );
}

