'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, UserX, Percent, AlertCircle } from 'lucide-react';

export default function AdminAttendancePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setStats({
        presentPercent: 91.5,
        totalPresent: 285,
        totalAbsent: 21,
        totalLeave: 5,
        classWise: [
          { className: 'Class 10 A', present: 32, absent: 2, leave: 1, percent: 91.4 },
          { className: 'Class 9 A', present: 28, absent: 1, leave: 0, percent: 96.5 },
          { className: 'Class 8 A', present: 30, absent: 4, leave: 2, percent: 83.3 },
        ],
      });
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Daily Attendance Monitoring</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review school-wide attendance metrics, class compliance ratios, and absence counts.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">Loading attendance data...</div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Present Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">{stats.presentPercent}%</span>
                <span className="text-xs text-slate-400">of enrolled</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Present Roster</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalPresent}</span>
                <span className="text-xs text-slate-400">Students</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Absent Students</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-500">{stats.totalAbsent}</span>
                <span className="text-xs text-slate-400">Students</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">On Approved Leave</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-500">{stats.totalLeave}</span>
                <span className="text-xs text-slate-400">Students</span>
              </div>
            </div>
          </div>

          {/* Class-wise Compliance Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class-wise Attendance Ratio</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="py-2.5">Class Name</th>
                    <th className="py-2.5">Enrolled Present</th>
                    <th className="py-2.5">Absent</th>
                    <th className="py-2.5">Leave</th>
                    <th className="py-2.5">Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-750 dark:text-slate-350">
                  {stats.classWise.map((c: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                      <td className="py-3 font-bold text-indigo-650 dark:text-indigo-400">{c.className}</td>
                      <td className="py-3 font-extrabold">{c.present}</td>
                      <td className="py-3 text-rose-500 font-bold">{c.absent}</td>
                      <td className="py-3 text-indigo-500">{c.leave}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[100px] h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${c.percent}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">{c.percent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
