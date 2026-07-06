'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus } from 'lucide-react';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubType, setNewSubType] = useState('Theory');
  const [newSubClass, setNewSubClass] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch subjects
      const res = await fetch('/api/subjects');
      const data = await res.json();
      if (data.success) {
        setSubjects(data.subjects);
      }

      // 2. Fetch dynamic class grades
      const classRes = await fetch('/api/classes');
      const classData = await classRes.json();
      if (classData.success) {
        setClasses(classData.classes);
        if (classData.classes.length > 0 && !newSubClass) {
          setNewSubClass(classData.classes[0].name);
        }
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

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim() || !newSubClass || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubName,
          code: newSubCode,
          type: newSubType,
          className: newSubClass,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Course Subject registered successfully!');
        setNewSubName('');
        setNewSubCode('');
        loadData();
      } else {
        alert(data.error || 'Failed to register subject');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to subject registration endpoint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Subjects Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Add academic subjects, define course code keys, and allocate them across class grades.
        </p>
      </div>

      {/* Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form panel (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider">
            Register New Subject
          </h3>

          <form onSubmit={handleAddSubject} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Subject Name
              </label>
              <input
                type="text"
                required
                disabled={submitting}
                placeholder="e.g. Physics"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Subject Code
              </label>
              <input
                type="text"
                required
                disabled={submitting}
                placeholder="e.g. PHYS101"
                value={newSubCode}
                onChange={(e) => setNewSubCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Class Grade
              </label>
              <select
                disabled={submitting}
                value={newSubClass}
                onChange={(e) => setNewSubClass(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none"
              >
                {classes.length === 0 ? (
                  <option value="">No classes configured</option>
                ) : (
                  classes.map((cls) => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Subject Type
              </label>
              <select
                disabled={submitting}
                value={newSubType}
                onChange={(e) => setNewSubType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none"
              >
                <option value="Theory">Theory Only</option>
                <option value="Practical">Practical Only</option>
                <option value="Both">Both (Theory & Lab)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-semibold text-white shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-4.5 w-4.5" /> Register Subject
            </button>
          </form>
        </div>

        {/* List panel (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Subject Roster</h3>

          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading curriculum...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="py-2.5">Code</th>
                    <th className="py-2.5">Subject</th>
                    <th className="py-2.5">Allocated Class</th>
                    <th className="py-2.5">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {subjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                      <td className="py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{sub.code}</td>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">{sub.name}</td>
                      <td className="py-3 font-medium">{sub.className}</td>
                      <td className="py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          sub.type === 'Theory'
                            ? 'bg-blue-50 text-blue-750 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30'
                            : sub.type === 'Practical'
                            ? 'bg-amber-50 text-amber-750 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
                            : 'bg-emerald-50 text-emerald-750 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                        }`}>
                          {sub.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
