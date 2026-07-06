'use client';

import React from 'react';
import { Calendar, Clock, BookOpen, MapPin } from 'lucide-react';

export default function TeacherTimetablePage() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [
    { num: 'P1', time: '08:30 - 09:20 AM', title: 'Mathematics', classroom: '10-A' },
    { num: 'P2', time: '09:20 - 10:10 AM', title: 'Science', classroom: '10-B' },
    { num: 'P3', time: '10:30 - 11:20 AM', title: 'Mathematics', classroom: '9-A' },
    { num: 'P4', time: '11:20 - 12:10 PM', title: 'Free Period', classroom: 'Staff Room' },
    { num: 'P5', time: '01:00 - 01:50 PM', title: 'Science Lab', classroom: 'Lab 2' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Class Timetable</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review your weekly academic course lectures, timing slots, and classroom locations.
        </p>
      </div>

      {/* Grid scheduler */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Schedule</h3>

        <div className="space-y-6">
          {days.map((day) => (
            <div key={day} className="border-b border-slate-100 dark:border-slate-850 pb-4 last:border-b-0 last:pb-0">
              <span className="text-xs font-bold text-slate-850 dark:text-white block mb-3">{day}</span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {periods.map((p, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 space-y-2 text-xs transition ${
                      p.title === 'Free Period'
                        ? 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-850'
                        : 'bg-indigo-50/30 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>{p.num}</span>
                      <span>{p.time.split(' ')[0]}</span>
                    </div>
                    <span className="block font-bold truncate">{p.title}</span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" /> Room {p.classroom}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
