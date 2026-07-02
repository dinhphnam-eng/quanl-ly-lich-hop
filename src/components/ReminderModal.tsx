import React, { useState, useEffect } from 'react';
import { Meeting } from '../types';
import { Bell, X, Calendar, MapPin, User } from 'lucide-react';

interface ReminderModalProps {
  meetings: Meeting[];
  now: Date;
}

export function ReminderModal({ meetings, now }: ReminderModalProps) {
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);

  useEffect(() => {
    // Check for meetings starting in the next 30 minutes
    const upcomingMeetings = meetings.filter(m => {
      const meetingDate = new Date(`${m.date}T${m.startTime}`);
      const diffMs = meetingDate.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      return diffMins > 0 && diffMins <= 30 && !m.isPostponed;
    });

    const newUpcoming = upcomingMeetings.filter(m => !remindedIds.has(m.id));
    if (newUpcoming.length > 0) {
      setUpcoming(prev => {
        const existing = new Set(prev.map(p => p.id));
        return [...prev, ...newUpcoming.filter(m => !existing.has(m.id))];
      });
      setRemindedIds(prev => {
        const next = new Set(prev);
        newUpcoming.forEach(m => next.add(m.id));
        return next;
      });
    }
  }, [meetings, now, remindedIds]);

  const dismiss = (id: string) => {
    setUpcoming(prev => prev.filter(p => p.id !== id));
  };

  const dismissAll = () => {
    setUpcoming([]);
  };

  if (upcoming.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Bell className="w-5 h-5 animate-bounce" />
            Nhắc nhở lịch họp
          </div>
          <button 
            onClick={dismissAll}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {upcoming.map(m => {
            const meetingDate = new Date(`${m.date}T${m.startTime}`);
            const diffMins = Math.floor((meetingDate.getTime() - now.getTime()) / 60000);
            
            return (
              <div key={m.id} className="relative bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                <button 
                  onClick={() => dismiss(m.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 rounded-full p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="inline-block px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-3">
                  Sắp diễn ra trong {diffMins} phút
                </div>
                <h4 className="font-bold text-slate-800 text-base mb-3 pr-6 leading-tight">{m.title}</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-700">{m.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{m.room}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{m.chairperson}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={dismissAll}
            className="px-6 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
