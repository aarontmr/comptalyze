"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MouseEvent, ReactNode } from 'react';

interface SmoothLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  [key: string]: any;
}

export default function SmoothLink({ 
  href, 
  children, 
  className = '', 
  style = {},
  onClick,
  ...props 
}: SmoothLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Si c'est un lien externe, laisser le comportement par défaut
    if (href.startsWith('http') || href.startsWith('mailto:')) {
      return;
    }

    // Pour les liens internes
    e.preventDefault();
    
    // Callback personnalisé si fourni
    if (onClick) {
      onClick();
    }

    // Ajouter une classe de transition au body pour un effet global
    document.body.style.opacity = '0.95';
    document.body.style.transition = 'opacity 0.2s ease';

    // Petit délai pour l'effet visuel
    setTimeout(() => {
      router.push(href);
      
      // Restaurer l'opacité après navigation
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);
    }, 200);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Link>
  );
}

