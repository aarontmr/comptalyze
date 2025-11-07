"use client";

import { motion } from 'framer-motion';

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        transition: {
          duration: 0.35,
          ease: [0.215, 0.61, 0.355, 1]
        }
      }}
      exit={{ 
        opacity: 0,
        x: -20,
        transition: {
          duration: 0.25,
          ease: [0.215, 0.61, 0.355, 1]
        }
      }}
    >
      {children}
    </motion.div>
  );
}

