'use client';

import React, { useState, useEffect } from 'react';
import { FilePlus, BookOpen, Send, Clock, BadgeCheck } from 'lucide-react';

export default function TeacherHomeworkPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedClass, setSelectedClass] = useState('Class 10 A');
  const [subject, setSubject] = useState('Mathematics');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setAssignments([
        { id: '1', className: 'Class 10 A', subject: 'Mathematics', title: 'Quadratic Equations Exercise 4.2', dueDate: '2026-07-10', status: 'Active', submissions: 28 },
        { id: '2', className: 'Class 10 A', subject: 'Science', title: 'Chemical Reactions Lab report', dueDate: '2026-07-12', status: 'Active', submissions: 15 },
      ]);
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !description) return;

    const newAssignment = {
      id: Date.now().toString(),
      className: selectedClass,
      subject,
      title,
      dueDate,
      status: 'Active',
      submissions: 0,
    };

    setAssignments([newAssignment, ...assignments]);
    setTitle('');
    setDueDate('');
    setDescription('');
    alert('Assignment successfully dispatched to students!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Homework & Assignments</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Publish coursework assignments and review student files submissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Publisher Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">
            Dispatch Assignment
          </h3>

          <form onSubmit={handlePublish} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Class Target
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Class 10 A">Class 10 A</option>
                  <option value="Class 9 A">Class 9 A</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Course Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Assignment Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Exercise 5.1 Problems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Submission Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-1.5 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Instructions / Description
              </label>
              <textarea
                required
                rows={3}
                placeholder="Add work files link, page numbers or guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
            >
              <Send className="h-4 w-4" /> Dispatch Assignment
            </button>
          </form>
        </div>

        {/* Assignments list (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dispatched Assignments</h3>

          {loading ? (
            <div className="text-center py-10 text-slate-450">Loading homeworks...</div>
          ) : (
            <div className="space-y-4">
              {assignments.map((a) => (
                <div
                  key={a.id}
                  className="border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-150">
                        {a.subject}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {a.className}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {a.title}
                    </h4>
                    <span className="block text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Due Date: {a.dueDate}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-[10px] text-slate-400 font-bold">Submissions</span>
                    <span className="text-xl font-black text-indigo-650 dark:text-indigo-455">
                      {a.submissions}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
