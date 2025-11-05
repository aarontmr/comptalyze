'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AdvancedKPICardProps {
  title: string;
  value: string | ReactNode;
  subtitle?: string;
  delay?: number;
  valueColor?: string;
}

export function AdvancedKPICard({ title, value, subtitle, delay = 0, valueColor }: AdvancedKPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-2xl p-6"
      style={{
        backgroundColor: '#16181d',
        border: '1px solid rgba(45, 52, 65, 0.5)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
      <div 
        className="text-3xl font-semibold mb-1"
        style={{ color: valueColor || '#fff' }}
      >
        {value}
      </div>
      {subtitle && (
        <p className="text-gray-500 text-xs">{subtitle}</p>
      )}
    </motion.div>
  );
}





