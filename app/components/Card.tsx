import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl p-6 relative ${className}`}
      style={{
        backgroundColor: '#16181d',
        border: '1px solid rgba(45, 52, 65, 0.6)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Effet de bordure éclairée subtile */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.02)',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

