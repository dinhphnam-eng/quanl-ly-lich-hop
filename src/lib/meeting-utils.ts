import { Meeting, MeetingStatus } from '../types';
import { parseISO, isBefore, addHours } from 'date-fns';
import * as XLSX from 'xlsx';

export function getMeetingStatus(meeting: Meeting, now = new Date()): MeetingStatus {
  if (meeting.isPostponed) return 'Hoãn họp';
  
  const startDateTime = parseISO(`${meeting.date}T${meeting.startTime}`);
  const endDateTime = addHours(startDateTime, 5);
  
  if (isBefore(now, startDateTime)) {
    return 'Sắp họp';
  } else if (isBefore(now, endDateTime)) {
    return 'Đang họp';
  } else {
    return 'Đã họp';
  }
}

export function generateICS(meeting: Meeting): string {
  const startDateTime = parseISO(`${meeting.date}T${meeting.startTime}`);
  const endDateTime = addHours(startDateTime, 5);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UBND Phuong//Meeting App//VI',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(startDateTime)}`,
    `DTEND:${formatDate(endDateTime)}`,
    `SUMMARY:${meeting.title}`,
    `DESCRIPTION:Chủ trì: ${meeting.chairperson}\\nPhòng họp: ${meeting.room}\\nVăn bản: ${meeting.documentUrl}\\nLink họp: ${meeting.meetingLink}`,
    `LOCATION:${meeting.room}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

export function getGoogleCalendarUrl(meeting: Meeting): string {
  const startDateTime = parseISO(`${meeting.date}T${meeting.startTime}`);
  const endDateTime = addHours(startDateTime, 1); // Assuming 1 hour default duration for calendar event

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const details = `Chủ trì: ${meeting.chairperson}\nPhòng họp: ${meeting.room}${meeting.documentUrl ? `\nVăn bản: ${meeting.documentUrl}` : ''}${meeting.meetingLink ? `\nLink họp: ${meeting.meetingLink}` : ''}`;

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', meeting.title);
  url.searchParams.append('dates', `${formatDate(startDateTime)}/${formatDate(endDateTime)}`);
  url.searchParams.append('details', details);
  url.searchParams.append('location', meeting.room);
  
  return url.toString();
}

export function downloadICS(meeting: Meeting) {
  const ics = generateICS(meeting);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `cuoc-hop-${meeting.date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(meetings: Meeting[], filename = 'danh_sach_cuoc_hop.xlsx') {
  const data = meetings.map((m, index) => ({
    'STT': index + 1,
    'Ngày': m.date.split('-').reverse().join('/'),
    'Giờ': m.startTime,
    'Nội dung': m.title,
    'Phòng họp': m.room,
    'Chủ trì': m.chairperson,
    'Tài liệu': m.documentUrl || '',
    'Link trực tuyến': m.meetingLink || '',
    'Trạng thái': m.isPostponed ? 'Hoãn họp' : 'Bình thường'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Lịch họp");

  // Format header row
  XLSX.writeFile(workbook, filename);
}
