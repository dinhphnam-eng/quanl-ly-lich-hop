import { getAccessToken } from './firebase';
import { Meeting } from '../types';

export const pushToGoogleCalendar = async (meeting: Meeting) => {
  const token = await getAccessToken();
  if (!token) {
    console.error('No Google Calendar access token found');
    return;
  }

  // Format the meeting time
  // Google Calendar needs RFC3339 format, e.g., '2015-05-28T09:00:00-07:00'
  // Or simply ISO string for the local timezone
  // The meeting object has: date (YYYY-MM-DD), startTime (HH:MM), endTime (HH:MM)
  
  // Since time is in AM/PM or HH:MM? Let's check meeting data
  // The form uses time inputs, typically "HH:MM" in 24h format. Wait, the form has AM/PM?
  // Let's assume startTime and endTime are HH:MM string like "14:00"
  let startDateTime = `${meeting.date}T${meeting.startTime}:00`;
  let endDateTime = meeting.endTime ? `${meeting.date}T${meeting.endTime}:00` : `${meeting.date}T${meeting.startTime}:00`;
  
  // Create a proper Date object, assuming local time
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  
  if (start.getTime() === end.getTime()) {
    end.setHours(end.getHours() + 1);
  }

  const event = {
    summary: meeting.title,
    location: meeting.room,
    description: `Chủ trì: ${meeting.chair}\nThành phần: ${meeting.attendees || ''}\n${meeting.notes ? `Ghi chú: ${meeting.notes}` : ''}`,
    start: {
      dateTime: start.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error creating calendar event:', errorData);
      throw new Error('Failed to create calendar event');
    }

    return await res.json();
  } catch (error) {
    console.error('Error in pushToGoogleCalendar:', error);
    throw error;
  }
};

export const generateIcsFile = (meeting: Meeting) => {
  let startDateTime = `${meeting.date}T${meeting.startTime}:00`;
  let endDateTime = meeting.endTime ? `${meeting.date}T${meeting.endTime}:00` : `${meeting.date}T${meeting.startTime}:00`;
  
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  
  if (start.getTime() === end.getTime()) {
    end.setHours(end.getHours() + 1);
  }

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UBND Phuong//Lich Hop//VI',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `UID:${meeting.id || Date.now()}@ubndphuong.local`,
    `SUMMARY:${meeting.title}`,
    `LOCATION:${meeting.room}`,
    `DESCRIPTION:Chủ trì: ${meeting.chair}\\nThành phần: ${meeting.attendees || ''}\\n${meeting.notes ? `Ghi chú: ${meeting.notes}` : ''}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `lich-hop-${meeting.date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
