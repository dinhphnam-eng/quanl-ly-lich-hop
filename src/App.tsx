import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useMeetings } from './hooks/useMeetings';
import { MeetingList } from './components/MeetingList';
import { DashboardStats } from './components/DashboardStats';
import { MeetingForm } from './components/MeetingForm';
import { ReminderModal } from './components/ReminderModal';
import { RoomStatsChart } from './components/RoomStatsChart';
import { RoomTracker } from './components/RoomTracker';
import { LoginModal } from './components/LoginModal';
import { getMeetingStatus, exportToExcel } from './lib/meeting-utils';
import { Download, LogOut, Calendar } from 'lucide-react';
import { initAuth, logout } from './lib/firebase';
import { User } from 'firebase/auth';

export default function App() {
  const { meetings, loading, addMeeting, updateMeeting, deleteMeeting } = useMeetings();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [now, setNow] = useState(new Date());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'create' | 'edit' | 'delete', payload?: any } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setIsAuthenticated(true);
        setUser(user);
      },
      () => {
        setIsAuthenticated(false);
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentMeetings = meetings.filter(m => m.date === todayStr);

  const [activeTab, setActiveTab] = useState<'trangchu' | 'lichtuan' | 'thongke' | 'phonghop'>('trangchu');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleOpenForm = (meeting?: Meeting) => {
    setEditingMeeting(meeting || null);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    if (isAuthenticated) {
      handleOpenForm();
    } else {
      setPendingAction({ type: 'create' });
      setShowLoginModal(true);
    }
  };

  const handleEditClick = (meeting: Meeting) => {
    if (isAuthenticated) {
      handleOpenForm(meeting);
    } else {
      setPendingAction({ type: 'edit', payload: meeting });
      setShowLoginModal(true);
    }
  };

  const handleDeleteClick = (meetingId: string) => {
    if (isAuthenticated) {
      deleteMeeting(meetingId);
    } else {
      setPendingAction({ type: 'delete', payload: meetingId });
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
    
    if (pendingAction) {
      if (pendingAction.type === 'create') {
        handleOpenForm();
      } else if (pendingAction.type === 'edit') {
        handleOpenForm(pendingAction.payload);
      } else if (pendingAction.type === 'delete') {
        deleteMeeting(pendingAction.payload);
      }
      setPendingAction(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMeeting(null);
  };

  const handleSubmit = async (data: Omit<Meeting, 'id' | 'createdAt'>) => {
    let meetingToSave = null;
    
    if (editingMeeting) {
      await updateMeeting(editingMeeting.id, data);
      meetingToSave = { ...data, id: editingMeeting.id, createdAt: editingMeeting.createdAt };
    } else {
      const newId = await addMeeting(data);
      meetingToSave = { ...data, id: newId, createdAt: Date.now() };
    }
    
    // Automatically push to Google Calendar if authenticated
    if (isAuthenticated) {
      try {
        const { pushToGoogleCalendar } = await import('./lib/calendar');
        await pushToGoogleCalendar(meetingToSave as Meeting);
        console.log('Successfully synced to Google Calendar');
      } catch (err) {
        console.error('Failed to sync to Google Calendar:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayedMeetings = activeTab === 'trangchu' ? currentMeetings : meetings;
  const totalPages = Math.ceil(displayedMeetings.length / itemsPerPage);
  const paginatedMeetings = displayedMeetings.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col pb-20">
      <header className="bg-[#1e293b] text-white px-4 sm:px-8 py-4 flex justify-between items-center shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain bg-white rounded-sm border-2 border-white"
            onError={(e) => {
              e.currentTarget.src = "https://ui-avatars.com/api/?name=UBND&background=dc2626&color=fff&rounded=sm&bold=true";
            }}
          />
          <div>
            <h1 className="text-lg font-bold leading-tight uppercase tracking-wide">ỨNG DỤNG QUẢN LÝ LỊCH HỌP</h1>
            <p className="text-xs text-slate-400 font-medium">Hệ thống đồng bộ đa phương tiện</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-xs text-slate-400">Phiên làm việc: Văn phòng HĐND và UBND Phường</p>
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-full border border-slate-600">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-5 h-5 rounded-full" />
                  <span className="text-xs text-slate-300 font-medium max-w-[120px] truncate">{user.displayName || user.email}</span>
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="h-10 w-10 bg-slate-600 rounded-full border-2 border-slate-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
          )}
        </div>
      </header>

      {activeTab === 'trangchu' && (
        <DashboardStats meetings={meetings} now={now} />
      )}

      <div className={`flex flex-col lg:flex-row gap-6 px-4 sm:px-8 pb-8 flex-1 ${activeTab === 'lichtuan' || activeTab === 'thongke' || activeTab === 'phonghop' ? 'justify-center pt-6' : ''}`}>
        {activeTab === 'thongke' ? (
          <RoomStatsChart meetings={meetings} now={now} />
        ) : activeTab === 'phonghop' ? (
          <RoomTracker meetings={meetings} now={now} />
        ) : (
          <>
            <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col ${activeTab === 'lichtuan' ? 'w-full max-w-5xl' : 'flex-[2]'}`}>
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 text-sm sm:text-base">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              {activeTab === 'trangchu' ? 'DANH SÁCH LỊCH HỌP TRONG NGÀY' : 'DANH SÁCH LỊCH TUẦN'}
            </h2>
            <div className="flex gap-2">
              {activeTab === 'lichtuan' && (
                <>
                  <button onClick={() => exportToExcel(meetings)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-md border border-green-100 hover:bg-green-100 transition-colors whitespace-nowrap" title="Xuất dữ liệu lịch họp ra file Excel">
                    <Download className="w-3.5 h-3.5" /> Xuất Excel
                  </button>
                  <button onClick={handleCreateClick} className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-md border border-blue-100 hover:bg-blue-100 transition-colors whitespace-nowrap">
                    + Tạo cuộc họp mới
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="p-4">
            <MeetingList 
              meetings={paginatedMeetings} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteClick} 
            />
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trước
                </button>
                <span className="text-sm font-medium text-slate-500">
                  Trang {page} / {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Tiếp theo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Status */}
        {activeTab === 'trangchu' && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                Trình trạng phòng họp
              </h3>
              <div className="space-y-4">
                {['Phòng họp 1', 'Phòng họp 2', 'Phòng họp 3', 'Hội trường UBND lầu 3', 'Trung tâm Chính trị phường'].map(room => {
                  const isBusy = meetings.some(m => m.room === room && getMeetingStatus(m, now) === 'Đang họp');
                  const isBooked = meetings.some(m => m.room === room && getMeetingStatus(m, now) === 'Sắp họp');
                  
                  let statusText = 'TRỐNG';
                  let statusClass = 'bg-green-50 text-green-600';
                  
                  if (isBusy) {
                    statusText = 'BẬN';
                    statusClass = 'bg-red-50 text-red-600';
                  } else if (isBooked) {
                    statusText = 'ĐÃ ĐẶT';
                    statusClass = 'bg-blue-50 text-blue-600';
                  }

                  return (
                    <div key={room} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">{room}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusClass}`}>{statusText}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-800 p-5 rounded-2xl shadow-sm text-white">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 font-mono">
                Firebase Live Sync
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-slate-700 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                </div>
                <div className="text-[10px] leading-relaxed">
                  <p className="font-bold text-slate-100">Đồng bộ di động tự động</p>
                  <p className="text-slate-400">Hệ thống đang đồng bộ dữ liệu thời gian thực.</p>
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full w-[85%]"></div>
              </div>
              <p className="text-[8px] mt-2 text-slate-500 text-right uppercase font-mono">Hệ thống hoạt động bình thường</p>
            </div>
            
            <div className="mt-auto flex justify-center hidden lg:flex">
               <div className="flex gap-4 opacity-40">
                 <div className="w-6 h-6 border border-slate-400 rounded"></div>
                 <div className="w-6 h-6 border border-slate-400 rounded"></div>
                 <div className="w-6 h-6 border border-slate-400 rounded"></div>
               </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 sm:px-8 py-3 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex gap-4">
          <button 
            onClick={() => handleTabChange('trangchu')}
            className={`text-[10px] font-bold uppercase transition-colors ${activeTab === 'trangchu' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Trang chủ
          </button>
          <button 
            onClick={() => handleTabChange('lichtuan')}
            className={`text-[10px] font-bold uppercase transition-colors ${activeTab === 'lichtuan' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Lịch tuần
          </button>
          
          <button 
            onClick={() => handleTabChange('thongke')}
            className={`text-[10px] font-bold uppercase transition-colors ${activeTab === 'thongke' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Thống kê
          </button>
          
          <button 
            onClick={() => handleTabChange('phonghop')}
            className={`text-[10px] font-bold uppercase transition-colors ${activeTab === 'phonghop' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Phòng họp
          </button>
        </div>
        <p className="text-[10px] text-slate-400">Bản quyền UBND Phường Bình Thới</p>
      </footer>

      {isFormOpen && (
        <MeetingForm
          initialData={editingMeeting}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}
      
      <ReminderModal meetings={meetings} now={now} />

      {showLoginModal && (
        <LoginModal 
          onLogin={handleLoginSuccess}
          onClose={() => {
            setShowLoginModal(false);
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
}
