import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Meeting, Room } from '../types';
import { X } from 'lucide-react';

const roomOptions: Room[] = ['Phòng họp 1', 'Phòng họp 2', 'Phòng họp 3', 'Hội trường UBND lầu 3', 'Trung tâm Chính trị phường'];

const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập nội dung cuộc họp'),
  date: z.string().min(1, 'Vui lòng chọn ngày họp'),
  startTime: z.string().min(1, 'Vui lòng chọn giờ họp'),
  chairperson: z.string().min(1, 'Vui lòng nhập người chủ trì'),
  documentUrl: z.string().optional(),
  meetingLink: z.string().optional(),
  room: z.enum(['Phòng họp 1', 'Phòng họp 2', 'Phòng họp 3', 'Hội trường UBND lầu 3', 'Trung tâm Chính trị phường']),
  isPostponed: z.preprocess(val => val === true || val === 'true', z.boolean()),
  syncToCalendar: z.boolean().optional()
});

type FormData = {
  title: string;
  date: string;
  startTime: string;
  chairperson: string;
  documentUrl: string;
  meetingLink: string;
  room: Room;
  isPostponed: boolean | string;
  syncToCalendar?: boolean;
};

interface Props {
  initialData?: Meeting | null;
  onSubmit: (data: Omit<Meeting, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
}

export function MeetingForm({ initialData, onSubmit, onClose }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      chairperson: '',
      documentUrl: '',
      meetingLink: '',
      room: 'Phòng họp 1',
      isPostponed: 'false',
      syncToCalendar: true
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        date: initialData.date,
        startTime: initialData.startTime,
        chairperson: initialData.chairperson,
        documentUrl: initialData.documentUrl || '',
        meetingLink: initialData.meetingLink || '',
        room: initialData.room,
        isPostponed: initialData.isPostponed ? 'true' : 'false',
        syncToCalendar: false
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: any) => {
    const meetingData = {
      title: data.title,
      date: data.date,
      startTime: data.startTime,
      chairperson: data.chairperson,
      documentUrl: data.documentUrl,
      meetingLink: data.meetingLink,
      room: data.room,
      isPostponed: data.isPostponed === true || data.isPostponed === 'true'
    };
    
    await onSubmit(meetingData);
    
    if (data.syncToCalendar) {
      import('../lib/meeting-utils').then(({ getGoogleCalendarUrl }) => {
        const url = getGoogleCalendarUrl(meetingData as any);
        window.open(url, '_blank');
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Cập nhật cuộc họp' : 'Lên lịch họp mới'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung cuộc họp <span className="text-red-500">*</span></label>
              <textarea
                {...register('title')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                rows={3}
                placeholder="Nhập nội dung/chủ đề cuộc họp..."
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày họp <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ họp <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  {...register('startTime')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chủ trì <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('chairperson')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Người chủ trì..."
                />
                {errors.chairperson && <p className="text-red-500 text-sm mt-1">{errors.chairperson.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phòng họp <span className="text-red-500">*</span></label>
                <select
                  {...register('room')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  {roomOptions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.room && <p className="text-red-500 text-sm mt-1">{errors.room.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Văn bản họp</label>
                <input
                  type="text"
                  {...register('documentUrl')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Nội dung văn bản họp..."
                />
                {errors.documentUrl && <p className="text-red-500 text-sm mt-1">{errors.documentUrl.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link họp trực tuyến</label>
                <input
                  type="text"
                  {...register('meetingLink')}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Thông tin link họp trực tuyến..."
                />
                {errors.meetingLink && <p className="text-red-500 text-sm mt-1">{errors.meetingLink.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng họp <span className="text-red-500">*</span></label>
              <select
                {...register('isPostponed')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
              >
                <option value="false">Theo lịch trình (Sắp diễn ra / Đang họp / Đã họp)</option>
                <option value="true">Hoãn họp</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="syncToCalendar" 
                {...register('syncToCalendar')} 
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
              />
              <label htmlFor="syncToCalendar" className="text-sm font-medium text-gray-700 cursor-pointer">
                Thêm vào Google Calendar của tôi sau khi lưu
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu cuộc họp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
