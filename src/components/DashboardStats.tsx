import React from 'react';
import { Meeting } from '../types';
import { getMeetingStatus } from '../lib/meeting-utils';

interface Props {
  meetings: Meeting[];
  now: Date;
}

export function DashboardStats({ meetings, now }: Props) {
  const stats = meetings.reduce((acc, meeting) => {
    const status = getMeetingStatus(meeting, now);
    acc.total++;
    if (status === 'Sắp họp') acc.upcoming++;
    if (status === 'Đã họp') acc.completed++;
    if (status === 'Đang họp') acc.ongoing++;
    if (status === 'Hoãn họp') acc.postponed++;
    return acc;
  }, { total: 0, upcoming: 0, completed: 0, ongoing: 0, postponed: 0 });

  const statCards = [
    { label: 'Tổng số cuộc họp', value: stats.total, color: 'text-[#1e293b]', border: '', subtitle: 'Hôm nay và sắp tới' },
    { label: 'Sắp họp', value: stats.upcoming, color: 'text-indigo-600', border: 'border-l-4 border-l-indigo-500', subtitle: 'Chuẩn bị diễn ra' },
    { label: 'Đang họp', value: stats.ongoing, color: 'text-green-600', border: 'border-l-4 border-l-green-500', subtitle: 'Xem chi tiết phòng', ping: true },
    { label: 'Đã họp', value: stats.completed, color: 'text-blue-600', border: 'border-l-4 border-l-blue-500', subtitle: 'Đã cập nhật tự động sau 5h' },
    { label: 'Hoãn họp', value: stats.postponed, color: 'text-red-600', border: 'border-l-4 border-l-red-500', subtitle: 'Cần xếp lịch lại' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4 sm:px-8 py-6 shrink-0">
      {statCards.map((stat, i) => {
        return (
          <div key={i} className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm ${stat.border}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <div className="flex items-center gap-2">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value < 10 ? `0${stat.value}` : stat.value}</p>
              {stat.ping && stat.value > 0 && (
                <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
              )}
            </div>
            <div className={`mt-2 text-[10px] text-slate-400 font-medium ${stat.ping ? 'underline' : ''}`}>{stat.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
}
