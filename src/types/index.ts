export type Room = 'Phòng họp 1' | 'Phòng họp 2' | 'Phòng họp 3' | 'Hội trường UBND lầu 3' | 'Trung tâm Chính trị phường';

export type MeetingStatus = 'Sắp họp' | 'Đang họp' | 'Đã họp' | 'Hoãn họp';

export interface Meeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  chairperson: string;
  documentUrl: string;
  meetingLink: string;
  room: Room;
  isPostponed: boolean;
  createdAt: number;
}
