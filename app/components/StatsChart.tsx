'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface ChartData {
  month: string;
  ca: number;
}

interface StatsChartProps {
  data: ChartData[];
  title: string;
  delay?: number;
}

export default function StatsChart({ data, title, delay = 0 }: StatsChartProps) {
  if (data.length === 0 || data.every(d => d.ca === 0)) {
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
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <div className="mt-4 p-8 text-center rounded-lg" style={{ backgroundColor: '#23272f', border: '1px solid #2d3441' }}>
          <p className="text-gray-400">Aucune donnée enregistrée pour le moment.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-2xl p-6 mb-6"
      style={{
        backgroundColor: '#16181d',
        border: '1px solid rgba(45, 52, 65, 0.5)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
    >
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <div className="w-full" style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3441" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${value.toLocaleString('fr-FR')} €`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1d24',
                border: '1px solid #2d3441',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => [`${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`, 'CA']}
            />
            <Legend 
              wrapperStyle={{ color: '#9ca3af', fontSize: '14px' }}
            />
            <Line 
              type="monotone" 
              dataKey="ca" 
              stroke="url(#gradient)"
              strokeWidth={2}
              dot={{ fill: '#00D084', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00D084" />
                <stop offset="100%" stopColor="#2E6CF6" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}



