'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

export default function FeesPage() {
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedClass, setSelectedClass] = useState('');
  const [category, setCategory] = useState('Tuition Fee');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit inline states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  const handleUpdate = async (id: string) => {
    if (!editAmount || !editDueDate) return;
    try {
      const res = await fetch('/api/fees/structure', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          amount: parseFloat(editAmount),
          dueDate: editDueDate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Fee structure updated successfully!');
        setEditingId(null);
        loadData();
      } else {
        alert(data.error || 'Failed to update fee structure');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating fee structure');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee configuration?')) return;
    try {
      const res = await fetch(`/api/fees/structure?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        alert('Fee structure deleted successfully!');
        loadData();
      } else {
        alert(data.error || 'Failed to delete fee structure');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting fee structure');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch fee structures
      const res = await fetch('/api/fees/structure');
      const data = await res.json();
      if (data.success) {
        setFeeStructures(data.feeStructures);
      }

      // 2. Fetch active classes grade levels
      const classRes = await fetch('/api/classes');
      const classData = await classRes.json();
      if (classData.success) {
        setClasses(classData.classes);
        if (classData.classes.length > 0 && !selectedClass) {
          setSelectedClass(classData.classes[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load fee configurations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !dueDate || !selectedClass || submitting) return;

    const finalCategory = category === 'custom' ? customCategory.trim() : category;
    if (!finalCategory) {
      alert('Please select or specify a fee category');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/fees/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: selectedClass,
          category: finalCategory,
          amount,
          dueDate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Fee Structure defined successfully!');
        setAmount('');
        setDueDate('');
        setCustomCategory('');
        loadData();
      } else {
        alert(data.error || 'Failed to create fee structure');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to fee structure config API.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Fees Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Define installment structures, tuition frequencies, class brackets, and payment due dates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Setup Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider">
            Define Class Fee Structure
          </h3>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Grade Class
              </label>
              <select
                disabled={submitting}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
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
                Fee Category / Particular
              </label>
              <select
                disabled={submitting}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none"
              >
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Admission Fee">Admission Fee</option>
                <option value="Exam Fee">Exam Fee</option>
                <option value="Transport Fee">Transport Fee</option>
                <option value="custom">Custom Particular (Type below)...</option>
              </select>
            </div>

            {category === 'custom' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Specify Custom Particular
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Laboratory Fee"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Amount (INR)
              </label>
              <input
                type="number"
                required
                disabled={submitting}
                placeholder="e.g. 9000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Payment Due Date
              </label>
              <input
                type="date"
                required
                disabled={submitting}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-1.5 text-xs focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-4.5 w-4.5" /> Define Structure
            </button>
          </form>
        </div>

        {/* Structures list (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Fee Configurations</h3>

          {loading ? (
            <div className="text-center py-10 text-slate-455">Loading configurations...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="py-2.5">Class</th>
                    <th className="py-2.5">Category Particular</th>
                    <th className="py-2.5">Amount</th>
                    <th className="py-2.5">Due Date</th>
                    <th className="py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-750 dark:text-slate-350">
                  {feeStructures.map((fee) => {
                    const isEditing = editingId === fee.id;
                    return (
                      <tr key={fee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                        <td className="py-3 font-bold text-indigo-650 dark:text-indigo-400">{fee.className}</td>
                        <td className="py-3 font-medium text-slate-850 dark:text-white">{fee.category}</td>
                        <td className="py-3 font-extrabold">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-xs w-24 focus:outline-none"
                            />
                          ) : (
                            `₹${fee.amount.toLocaleString()}`
                          )}
                        </td>
                        <td className="py-3 font-semibold">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editDueDate}
                              onChange={(e) => setEditDueDate(e.target.value)}
                              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-xs focus:outline-none"
                            />
                          ) : (
                            fee.dueDate
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleUpdate(fee.id)}
                                  className="text-[10px] font-bold text-emerald-650 hover:text-emerald-700 transition cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="text-[10px] font-bold text-slate-400 hover:text-slate-500 transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingId(fee.id);
                                    setEditAmount(fee.amount.toString());
                                    setEditDueDate(fee.dueDate);
                                  }}
                                  className="text-[10px] font-bold text-indigo-650 hover:text-indigo-700 transition cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(fee.id)}
                                  className="text-[10px] font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
