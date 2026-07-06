'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

export default function StudentTimetablePage() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [timetable, setTimetable] = useState<Record<string, any[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await fetch('/api/student/timetable');
        const data = await res.json();
        if (data.success) {
          setTimetable(data.timetable);
        } else {
          setError(data.error || 'Failed to fetch timetable.');
        }
      } catch (err) {
        console.error('Error fetching timetable:', err);
        setError('Error connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Class Timetable</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review your weekly academic course lectures, timing slots, and classroom locations.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Scheduler */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Schedule</h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading your timetable...</div>
        ) : (
          <div className="space-y-6">
            {days.map((day) => {
              const periods = timetable[day] || [];
              return (
                <div key={day} className="border-b border-slate-100 dark:border-slate-850 pb-4 last:border-b-0 last:pb-0">
                  <span className="text-xs font-bold text-slate-850 dark:text-white block mb-3">{day}</span>
                  {periods.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No classes scheduled.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {periods.map((p, idx) => (
                        <div
                          key={idx}
                          className={`rounded-2xl border p-4 space-y-2 text-xs transition ${
                            p.isBreak
                              ? 'bg-amber-50/40 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400'
                              : 'bg-indigo-50/30 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                            <span>P{idx + 1}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 shrink-0" /> {p.startTime} - {p.endTime}
                            </span>
                          </div>
                          <span className="block font-bold truncate">
                            {p.isBreak ? (p.breakTitle || 'Break') : p.subjectName}
                          </span>
                          {!p.isBreak && (
                            <>
                              <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                Teacher: {p.teacherName}
                              </span>
                              {p.roomNumber && (
                                <span className="block text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <MapPin className="h-3 w-3 shrink-0" /> Room {p.roomNumber}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
