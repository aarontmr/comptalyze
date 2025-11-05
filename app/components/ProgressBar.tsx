'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  delay?: number;
}

export default function ProgressBar({ value, max, label, delay = 0 }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm font-medium">{label}</span>
        <span className="text-white text-sm font-semibold">
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div
        className="w-full h-3 rounded-full overflow-hidden"
        style={{
          backgroundColor: '#23272f',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #00D084, #2E6CF6)',
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-gray-500 text-xs">
          {value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} / {max.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </span>
      </div>
    </motion.div>
  );
}






