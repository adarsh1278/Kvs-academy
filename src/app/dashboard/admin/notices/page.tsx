'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState('All');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notices');
      const data = await res.json();
      if (data.success) {
        setNotices(data.notices);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, targetAudience }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Notice published to portal successfully!');
        setTitle('');
        setContent('');
        loadData();
      } else {
        alert(data.error || 'Failed to publish notice');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to notice board publisher.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this bulletin notice?')) return;

    try {
      const res = await fetch(`/api/notices?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert('Notice deleted.');
        loadData();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to notice board deletion endpoint.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Notice Board Publisher</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Publish circulars, holiday notices, schedules, or emergency notifications across roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Publisher Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider">
            Create Portal Notice
          </h3>

          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Notice Title
              </label>
              <input
                type="text"
                required
                disabled={submitting}
                placeholder="e.g. Science Fair Registration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Audience
              </label>
              <select
                disabled={submitting}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none"
              >
                <option value="All">All Roles (Public & Portal)</option>
                <option value="Teachers">Teachers Only</option>
                <option value="Students">Students Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Detailed Message
              </label>
              <textarea
                required
                disabled={submitting}
                rows={4}
                placeholder="Write notice details here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-4.5 w-4.5" /> Publish Notice
            </button>
          </form>
        </div>

        {/* Notice lists (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Portal Notices</h3>

          {loading ? (
            <div className="text-center py-10 text-slate-450">Loading notice board...</div>
          ) : notices.length === 0 ? (
            <div className="text-center py-10 text-slate-450">No published notices are currently active.</div>
          ) : (
            <div className="space-y-4">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-3 relative group"
                >
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="absolute right-4 top-4 text-slate-450 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                    <div className="flex gap-2 text-[9px] font-bold">
                      <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-750 dark:text-indigo-400 border border-indigo-150 px-1.5 py-0.5 rounded">
                        Target: {n.target}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
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
    </div>
  );
}
