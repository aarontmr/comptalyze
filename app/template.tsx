"use client";

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.215, 0.61, 0.355, 1]
        }
      }}
      exit={{ 
        opacity: 0,
        transition: {
          duration: 0.3,
          ease: [0.215, 0.61, 0.355, 1]
        }
      }}
    >
      {children}
    </motion.div>
  );
}

