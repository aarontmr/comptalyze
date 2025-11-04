import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-[#16181d] border border-gray-800 rounded-2xl p-4 shadow ${className} ${
        onClick ? 'cursor-pointer transition-transform hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
      style={{ minHeight: onClick ? '44px' : 'auto' }}
    >
      {children}
    </div>
  );
}

