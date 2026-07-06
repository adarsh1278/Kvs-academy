'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, UploadCloud, CheckCircle2, Clock } from 'lucide-react';

export default function StudentHomeworkPage() {
  const [loading, setLoading] = useState(true);
  const [homework, setHomework] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setHomework([
        { id: '1', subjectName: 'Mathematics', title: 'Quadratic Equations Exercise 4.2', dueDate: '2026-07-10', desc: 'Solve questions 1 to 10 in your class notebook.', status: 'Pending' },
        { id: '2', subjectName: 'Science', title: 'Chemical Reactions Practicum Writeup', dueDate: '2026-07-12', desc: 'Complete the lab manual analysis for the oxidation experiment.', status: 'Pending' },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  const handleUpload = (id: string) => {
    alert('File uploaded successfully! Homework submitted.');
    setHomework(homework.map(h => h.id === id ? { ...h, status: 'Submitted' } : h));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Assignments Tracker</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review course assignments uploaded by your teachers. Upload and submit your homework documents.
        </p>
      </div>

      {/* Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assignments Checklist</h3>

        {loading ? (
          <div className="text-center py-10 text-slate-450">Loading assignments...</div>
        ) : (
          <div className="space-y-4">
            {homework.map((hw) => (
              <div
                key={hw.id}
                className="border border-slate-100 dark:border-slate-850 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-750 dark:text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-150">
                      {hw.subjectName}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      hw.status === 'Submitted'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-150'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-150'
                    }`}>
                      {hw.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {hw.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {hw.desc}
                  </p>
                  <span className="block text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Due: {hw.dueDate}
                  </span>
                </div>

                <div className="shrink-0">
                  {hw.status === 'Pending' ? (
                    <button
                      onClick={() => handleUpload(hw.id)}
                      className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-[10px] font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud className="h-4 w-4" /> Upload Homework
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4.5 w-4.5" /> Submitted
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
