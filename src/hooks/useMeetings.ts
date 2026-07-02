import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Meeting } from '../types';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Meeting[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Meeting);
      });
      setMeetings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addMeeting = async (meeting: Omit<Meeting, 'id' | 'createdAt'>) => {
    const docRef = await addDoc(collection(db, 'meetings'), {
      ...meeting,
      createdAt: Date.now()
    });
    return docRef.id;
  };

  const updateMeeting = async (id: string, data: Partial<Meeting>) => {
    await updateDoc(doc(db, 'meetings', id), data);
  };

  const deleteMeeting = async (id: string) => {
    await deleteDoc(doc(db, 'meetings', id));
  };

  return { meetings, loading, addMeeting, updateMeeting, deleteMeeting };
}
