import React from 'react';
import { Meeting } from '../types';
import { getMeetingStatus } from '../lib/meeting-utils';

interface Props {
  meetings: Meeting[];
  now: Date;
}

const ROOMS = [
  'Phòng họp 1', 
  'Phòng họp 2', 
  'Phòng họp 3', 
  'Hội trường UBND lầu 3', 
  'Trung tâm Chính trị phường'
];

export function RoomTracker({ meetings, now }: Props) {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        BẢNG THEO DÕI TRẠNG THÁI PHÒNG HỌP
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ROOMS.map(room => {
          const roomMeetings = meetings
            .filter(m => m.room === room && m.date >= now.toISOString().split('T')[0])
            .sort((a, b) => {
              if (a.date !== b.date) return a.date.localeCompare(b.date);
              return a.startTime.localeCompare(b.startTime);
            });
          
          const currentMeeting = roomMeetings.find(m => {
            const status = getMeetingStatus(m, now);
            return status === 'Đang họp';
          });
          
          const upcomingMeeting = roomMeetings.find(m => {
            const status = getMeetingStatus(m, now);
            return status === 'Sắp họp';
          });

          let statusText = 'TRỐNG';
          let statusColor = 'bg-green-50 border-green-200 text-green-700';
          let indicatorColor = 'bg-green-500';

          if (currentMeeting) {
            statusText = 'ĐANG HỌP';
            statusColor = 'bg-red-50 border-red-200 text-red-700';
            indicatorColor = 'bg-red-500 animate-pulse';
          } else if (upcomingMeeting && upcomingMeeting.date === now.toISOString().split('T')[0]) {
            statusText = 'ĐÃ ĐẶT';
            statusColor = 'bg-blue-50 border-blue-200 text-blue-700';
            indicatorColor = 'bg-blue-500';
          }

          return (
            <div key={room} className={`rounded-xl border p-5 flex flex-col ${statusColor} transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{room}</h3>
                <div className="flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full border border-black/5 shadow-sm">
                  <div className={`w-2.5 h-2.5 rounded-full ${indicatorColor}`}></div>
                  <span className="text-xs font-bold uppercase tracking-wider">{statusText}</span>
                </div>
              </div>
              
              <div className="flex-1 bg-white/60 rounded-lg p-3 border border-black/5">
                {currentMeeting ? (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Đang diễn ra</p>
                    <p className="font-bold text-slate-800 line-clamp-2" title={currentMeeting.title}>{currentMeeting.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{currentMeeting.startTime} - {currentMeeting.endTime}</p>
                    <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      {currentMeeting.chair}
                    </p>
                  </div>
                ) : upcomingMeeting ? (
                  <div>
                    <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Lịch tiếp theo</p>
                    <p className="font-bold text-slate-800 line-clamp-2" title={upcomingMeeting.title}>{upcomingMeeting.title}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {upcomingMeeting.date === now.toISOString().split('T')[0] ? 'Hôm nay' : upcomingMeeting.date.split('-').reverse().join('/')}, {upcomingMeeting.startTime}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-50 py-4">
                    <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <p className="text-sm font-medium">Không có lịch sắp tới</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
