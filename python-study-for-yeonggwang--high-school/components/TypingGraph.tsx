

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TypingDataPoint } from '../types';
import { useLocale } from '../store/LocaleContext';

interface TypingGraphProps {
  data: TypingDataPoint[];
}

export const TypingGraph: React.FC<TypingGraphProps> = ({ data }) => {
  const { t } = useLocale();
  const formattedData = data.map(point => ({
    ...point,
    time: (point.timestamp / 1000).toFixed(1), // Convert ms to seconds
  }));

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-inner h-96">
      <h3 className="text-xl font-semibold mb-4 text-sky-400">{t('typingGraph.title')}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis 
            dataKey="time" 
            label={{ value: t('typingGraph.timeLabel'), position: 'insideBottom', offset: -15, fill: '#cbd5e1' }} 
            stroke="#94a3b8"
          />
          <YAxis 
            label={{ value: t('typingGraph.charLabel'), angle: -90, position: 'insideLeft', fill: '#cbd5e1' }}
            stroke="#94a3b8"
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Line 
            type="monotone" 
            dataKey="codeLength" 
            name={t('typingGraph.legend')}
            stroke="#38bdf8" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};