'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Users, Trash } from 'lucide-react';

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [newClassName, setNewClassName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes);
        setSections(data.sections);
      }
    } catch (err) {
      console.error('Failed to load class configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createClass', name: newClassName }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Grade Class created successfully!');
        setNewClassName('');
        loadData();
      } else {
        alert(data.error || 'Failed to create class');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to class creation endpoint.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim() || !selectedClassId || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createSection', name: newSectionName, classId: selectedClassId }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Section Division created successfully!');
        setNewSectionName('');
        setSelectedClassId('');
        loadData();
      } else {
        alert(data.error || 'Failed to create section');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to section creation endpoint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Classes & Sections</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure academic grades, room allocations, divisions, and assign class teacher responsibilities.
        </p>
      </div>

      {/* Forms Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form: Add Class */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider">
            Create Grade Level
          </h3>
          <form onSubmit={handleAddClass} className="flex gap-3">
            <input
              type="text"
              required
              disabled={submitting}
              placeholder="e.g. Class 11"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 text-xs font-bold text-white transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add Class
            </button>
          </form>
        </div>

        {/* Form: Add Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider">
            Create Section Division
          </h3>
          <form onSubmit={handleAddSection} className="grid grid-cols-3 gap-3">
            <select
              required
              disabled={submitting}
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none"
            >
              <option value="">Choose Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              disabled={submitting}
              placeholder="e.g. C"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add Division
            </button>
          </form>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Classes list */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configured Classes</h3>
          {loading ? (
            <div className="text-center py-6 text-slate-400">Loading...</div>
          ) : (
            <div className="space-y-3">
              {classes.map((c) => {
                const classSections = sections.filter((s) => s.classId === c.id).map((s) => s.name);
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between border border-slate-100 dark:border-slate-850 rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <Layers className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900 dark:text-white">{c.name}</span>
                        <span className="block text-[10px] text-slate-450 dark:text-slate-400">
                          Sections: {classSections.join(', ') || 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sections list */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Divisions & Class Teachers</h3>
          {loading ? (
            <div className="text-center py-6 text-slate-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="py-2.5">Class</th>
                    <th className="py-2.5">Section Name</th>
                    <th className="py-2.5">Class Teacher Assigned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-750 dark:text-slate-350">
                  {sections.map((sec) => (
                    <tr key={sec.id}>
                      <td className="py-3 font-bold text-indigo-600 dark:text-indigo-400">{sec.className}</td>
                      <td className="py-3 font-extrabold">{sec.name}</td>
                      <td className="py-3 flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{sec.teacher}</span>
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
