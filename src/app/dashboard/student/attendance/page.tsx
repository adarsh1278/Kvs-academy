'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function StudentAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setLogs([
        { date: '2026-07-01', status: 'Present', remarks: 'On time' },
        { date: '2026-07-02', status: 'Present', remarks: 'On time' },
        { date: '2026-07-03', status: 'Late', remarks: 'Late by 10m (Traffic)' },
        { date: '2026-07-04', status: 'Present', remarks: 'On time' },
        { date: '2026-07-05', status: 'Absent', remarks: 'Unwell' },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900';
      case 'Absent':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 border-rose-100 dark:border-rose-900';
      case 'Late':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-950/20 dark:text-slate-400 border-slate-100 dark:border-slate-900';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Attendance Logs</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review your daily attendance history reports, remarks, and late entries.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Term Logs</h3>

        {loading ? (
          <div className="text-center py-10 text-slate-450">Loading logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Status Code</th>
                  <th className="py-2.5">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-750 dark:text-slate-350">
                {logs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                    <td className="py-3 font-semibold flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{log.remarks || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
