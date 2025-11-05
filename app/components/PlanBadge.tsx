'use client';

import { Sparkles, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlanBadgeProps {
  plan: 'pro' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showIcon?: boolean;
}

export default function PlanBadge({ 
  plan, 
  size = 'md',
  animated = true,
  showIcon = true 
}: PlanBadgeProps) {
  const isPremium = plan === 'premium';
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const badge = (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses[size]}`}
      style={{
        background: isPremium 
          ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
          : 'linear-gradient(135deg, #00D084, #2E6CF6)',
        boxShadow: isPremium
          ? '0 2px 12px rgba(139, 92, 246, 0.3)'
          : '0 2px 12px rgba(0, 208, 132, 0.3)',
      }}
    >
      {showIcon && (
        isPremium ? (
          <Sparkles className={`${iconSizes[size]} text-white`} />
        ) : (
          <Zap className={`${iconSizes[size]} text-white`} />
        )
      )}
      <span className="text-white">
        {isPremium ? 'Premium' : 'Pro'}
      </span>
    </div>
  );

  if (!animated) {
    return badge;
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 260,
        damping: 20 
      }}
      whileHover={{ scale: 1.05 }}
    >
      {badge}
    </motion.div>
  );
}


