import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Meeting } from '../types';

interface RoomStatsChartProps {
  meetings: Meeting[];
  now: Date;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function RoomStatsChart({ meetings, now }: RoomStatsChartProps) {
  const [filterMode, setFilterMode] = useState<'week' | 'year'>('week');

  const data = useMemo(() => {
    let filteredMeetings = [];

    if (filterMode === 'week') {
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Điều chỉnh nếu là Chủ Nhật
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      const startOfWeekStr = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
      const endOfWeekStr = `${endOfWeek.getFullYear()}-${String(endOfWeek.getMonth() + 1).padStart(2, '0')}-${String(endOfWeek.getDate()).padStart(2, '0')}`;

      filteredMeetings = meetings.filter(m => m.date >= startOfWeekStr && m.date <= endOfWeekStr && !m.isPostponed);
    } else {
      const currentYearStr = now.getFullYear().toString();
      filteredMeetings = meetings.filter(m => m.date.startsWith(currentYearStr) && !m.isPostponed);
    }

    const counts: Record<string, number> = {};
    filteredMeetings.forEach(m => {
      counts[m.room] = (counts[m.room] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value); // Sắp xếp giảm dần theo số lượng
  }, [meetings, now, filterMode]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full max-w-4xl mx-auto mt-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wide">
          Tỷ lệ cuộc họp theo phòng
        </h2>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setFilterMode('week')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filterMode === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tuần này
          </button>
          <button
            onClick={() => setFilterMode('year')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filterMode === 'year' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Năm nay
          </button>
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 space-y-4">
          <svg className="w-16 h-16 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          <p>Không có dữ liệu cuộc họp trong {filterMode === 'week' ? 'tuần này' : 'năm nay'}</p>
        </div>
      ) : (
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} cuộc họp`, 'Số lượng']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
