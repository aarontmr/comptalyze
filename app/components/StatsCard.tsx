'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  gradient?: boolean;
  delay?: number;
}

export default function StatsCard({ title, value, icon: Icon, gradient = true, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative rounded-2xl p-6"
      style={{
        backgroundColor: '#16181d',
        border: '1px solid rgba(45, 52, 65, 0.5)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      {gradient && (
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
          style={{
            background: 'linear-gradient(90deg, #00D084, #2E6CF6)',
          }}
        />
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-white text-2xl font-semibold">{value}</p>
        </div>
        <div
          className="p-3 rounded-lg"
          style={{
            backgroundColor: 'rgba(0, 208, 132, 0.1)',
          }}
        >
          <Icon className="w-6 h-6" style={{ color: '#00D084' }} />
        </div>
      </div>
    </motion.div>
  );
}




