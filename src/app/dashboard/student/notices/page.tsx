'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock } from 'lucide-react';

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setNotices([
        { id: '1', title: 'Summer Vacation Circular 2026', content: 'The school will remain closed from May 15th to June 25th for summer vacations. Online assignments will be published on the portal.', target: 'All', date: '2026-05-01' },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Notice Board</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Stay updated with official bulletins, holiday announcements, and school events.
        </p>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Bulletins</h3>

        {loading ? (
          <div className="text-center py-10 text-slate-450">Loading notice board...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-10 text-slate-450">No notifications published.</div>
        ) : (
          <div className="space-y-4">
            {notices.map((n) => (
              <div
                key={n.id}
                className="border border-slate-100 dark:border-slate-850 rounded-2xl p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                  <div className="flex gap-2 text-[9px] font-bold">
                    <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                      Audience: {n.target}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                      {n.date}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed">
                  {n.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
