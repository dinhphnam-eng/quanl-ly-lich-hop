import React, { useState, useEffect } from 'react';
import { Meeting, MeetingStatus } from '../types';
import { getMeetingStatus, downloadICS, getGoogleCalendarUrl } from '../lib/meeting-utils';
import { Calendar, Clock, MapPin, User, Link as LinkIcon, FileText, Download, Edit, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  meetings: Meeting[];
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
}

export function MeetingList({ meetings, onEdit, onDelete }: Props) {
  const [now, setNow] = useState(new Date());

  // Update current time every minute to keep status accurate
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: MeetingStatus) => {
    switch (status) {
      case 'Sắp họp': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'Đang họp': return 'bg-green-500 text-white shadow-sm shadow-green-200 animate-pulse border border-green-600';
      case 'Đã họp': return 'bg-slate-50 text-slate-500 border border-slate-200';
      case 'Hoãn họp': return 'bg-red-50 text-red-600 border border-red-100';
    }
  };

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700">Chưa có lịch họp nào</h3>
        <p className="text-slate-500 mt-1 text-sm">Bấm "+ Tạo cuộc họp mới" để thêm lịch.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map(meeting => {
        const status = getMeetingStatus(meeting, now);
        
        return (
          <div key={meeting.id} className="bg-white p-5 rounded-xl border border-slate-100 hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-bold text-slate-700 leading-tight">
                    {meeting.title}
                  </h3>
                  <span className={cn("px-2.5 py-1 text-[10px] font-bold rounded-full uppercase shrink-0 whitespace-nowrap", getStatusColor(status))}>
                    {status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="italic">{meeting.date.split('-').reverse().join('/')} - <span className="font-bold text-slate-600 not-italic">{meeting.startTime}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Chủ trì: {meeting.chairperson}</span>
                  </div>
                  <div className="flex items-center gap-1.5 md:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{meeting.room}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  {meeting.documentUrl && (
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-blue-600 bg-blue-50/50 w-fit px-2 py-1 rounded">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{meeting.documentUrl}</span>
                    </div>
                  )}
                  {meeting.meetingLink && (
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600 bg-slate-50 w-fit px-2 py-1 rounded">
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>{meeting.meetingLink}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 md:flex-col md:items-end justify-end pt-3 md:pt-0">
                <a
                  href={getGoogleCalendarUrl(meeting)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors w-full md:w-auto uppercase"
                  title="Thêm vào Google Calendar"
                >
                  <Calendar className="w-3 h-3 text-blue-500" />
                  <span className="hidden md:inline">Thêm vào Lịch</span>
                </a>
                <div className="flex items-center gap-1 w-full md:w-auto">
                  <button
                    onClick={() => status !== 'Đã họp' && onEdit(meeting)}
                    disabled={status === 'Đã họp'}
                    className={cn(
                      "flex-1 md:flex-none flex items-center justify-center p-1.5 rounded transition-colors",
                      status === 'Đã họp' 
                        ? "text-slate-200 cursor-not-allowed bg-slate-50" 
                        : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    )}
                    title={status === 'Đã họp' ? "Không thể sửa cuộc họp đã kết thúc" : "Chỉnh sửa"}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa cuộc họp này?')) {
                        onDelete(meeting.id);
                      }
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
