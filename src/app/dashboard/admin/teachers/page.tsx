'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TeachersListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { setSelectedTeacher } = useStore();

  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [salary, setSalary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      if (data.success) {
        setTeachers(data.teachers);
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

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleRegisterTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !qualification || !experience || !salary || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, qualification, experience, salary }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Teacher successfully registered and credentialed!');
        setName('');
        setEmail('');
        setPhone('');
        setQualification('');
        setExperience('');
        setSalary('');
        setShowAddForm(false);
        loadData();
      } else {
        alert(data.error || 'Failed to register teacher');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to teacher registration endpoint.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeachers = teachers.filter((t) =>
    (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.teacherId || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Teacher Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor all classroom teachers, qualifications dossier records, contact details, and monthly payroll info. Click on any row to open their full profile.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white transition flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Register Teacher
        </button>
      </div>

      {/* Add Teacher Form Modal/Box */}
      {showAddForm && (
        <form onSubmit={handleRegisterTeacher} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider">
            Teacher Particulars
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Instructor Name
              </label>
              <input
                type="text"
                required
                disabled={submitting}
                placeholder="e.g. Dr. Alok Tripathi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Portal Email Login
              </label>
              <input
                type="email"
                required
                disabled={submitting}
                placeholder="e.g. alok.tripathi@kvsacademy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Mobile Number (Optional)
              </label>
              <input
                type="text"
                disabled={submitting}
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Qualification Dossier
              </label>
              <input
                type="text"
                required
                disabled={submitting}
                placeholder="e.g. Ph.D. in Organic Chemistry"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Prior Experience
              </label>
              <input
                type="text"
                required
                disabled={submitting}
                placeholder="e.g. 15 Years"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Basic Monthly Salary (INR)
              </label>
              <input
                type="number"
                required
                disabled={submitting}
                placeholder="e.g. 65000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950 px-3.5 py-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Registering...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-slate-200 hover:bg-slate-50 px-5 py-2 text-xs font-bold text-slate-500 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
          <input
            type="text"
            placeholder="Search by instructor name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-255 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="text-center py-10 text-slate-400">Loading teacher directory...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-10 text-slate-400">No teachers found matching those search terms.</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold uppercase text-slate-500">Teacher ID</TableHead>
                    <TableHead className="font-bold uppercase text-slate-500">Instructor Name</TableHead>
                    <TableHead className="font-bold uppercase text-slate-500">Qualifications & Experience</TableHead>
                    <TableHead className="font-bold uppercase text-slate-500">Payroll Salary</TableHead>
                    <TableHead className="font-bold uppercase text-slate-500 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTeachers.map((t) => (
                    <TableRow
                      key={t.id}
                      onClick={() => {
                        setSelectedTeacher(t);
                        router.push(`${pathname}/${t.id}`);
                      }}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-mono font-bold text-indigo-650 dark:text-indigo-400">{t.teacherId}</TableCell>
                      <TableCell>
                        <span className="block font-bold text-slate-900 dark:text-white">{t.name}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{t.email}</span>
                      </TableCell>
                      <TableCell>
                        <span className="block font-medium text-slate-800 dark:text-slate-300">{t.qualification}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Exp: {t.experience}</span>
                      </TableCell>
                      <TableCell className="font-extrabold text-slate-900 dark:text-white">₹{t.salary?.toLocaleString() || '0'}</TableCell>
                      <TableCell className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900">
                          {t.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-xs font-semibold text-slate-500">
                <div>
                  Showing {Math.min(filteredTeachers.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
                  {Math.min(filteredTeachers.length, currentPage * itemsPerPage)} of {filteredTeachers.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition disabled:opacity-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                        currentPage === i + 1
                          ? 'bg-indigo-600 text-white border-indigo-650'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 dark:text-slate-450'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition disabled:opacity-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
