'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function EnquiriesListPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/enquiries');
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.enquiries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/enquiries/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId: id, status }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Status updated to ${status}!`);
        fetchEnquiries();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  const handleConvertToStudent = async (id: string) => {
    const confirmConvert = window.confirm('Are you sure you want to convert this enquiry into a confirmed Student? This will automatically create their User account, assign roll/admission numbers, and instantiate their fee structure.');
    if (!confirmConvert) return;

    try {
      const res = await fetch('/api/enquiry/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId: id }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully converted! Student Created:\nAdmission No: ${data.student.admissionNo}\nRoll No: ${data.student.rollNo}\nUsername: ${data.student.email}`);
        fetchEnquiries();
      } else {
        alert(data.error || 'Failed to convert student');
      }
    } catch (err) {
      console.error(err);
      alert('Error during student conversion');
    }
  };

  // Status API update route handler in Next.js is optional since we can embed it, but wait! We need to make sure `/api/enquiries/status` endpoint works or write it!
  // To keep it simple, we can also use our convert endpoint or write a small enquiries status endpoint. We'll write the status route handler next.

  const filteredEnquiries = enquiries.filter((item) => {
    const matchesSearch =
      item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      item.parentName.toLowerCase().includes(search.toLowerCase()) ||
      item.parentPhone.includes(search);

    if (filter === 'all') return matchesSearch;
    return item.status === filter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Admission Enquiries</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review prospective registrations submitted via the website. Manage follow-ups and convert to students.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
          <input
            type="text"
            placeholder="Search by student, parent or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2 text-xs focus:outline-none"
          />
        </div>

        {/* Tab filters */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'follow_up', 'approved', 'rejected', 'converted'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer border ${
                filter === tab
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading admissions register...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No applications match selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="py-2.5">Student Info</th>
                  <th className="py-2.5">Guardian & Phone</th>
                  <th className="py-2.5">Class Applying</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredEnquiries.map((enq) => {
                  const statusColors: any = {
                    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900',
                    follow_up: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-450 dark:border-cyan-900',
                    approved: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900',
                    rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900',
                    converted: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900',
                  };

                  return (
                    <tr key={enq._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                      <td className="py-3.5 flex items-center gap-3">
                        {enq.photograph ? (
                          <img src={enq.photograph} alt={enq.studentName} className="h-10 w-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-750 flex items-center justify-center font-bold uppercase shrink-0">
                            {enq.studentName.substring(0, 2)}
                          </div>
                        )}
                        <div>
                          <span className="block font-bold text-slate-900 dark:text-white">{enq.studentName}</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">DOB: {new Date(enq.dob).toLocaleDateString()} | {enq.gender}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="block font-bold text-slate-900 dark:text-white">{enq.parentName}</span>
                        <span className="block text-[10px] text-slate-550 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 shrink-0" /> {enq.parentPhone}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{enq.classApplyingFor?.name || 'Class'}</span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${statusColors[enq.status]}`}>
                          {enq.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        {enq.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(enq._id, 'approved')}
                              className="rounded-lg bg-indigo-50 text-indigo-650 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 px-2 py-1 text-[10px] font-bold border border-indigo-200 transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(enq._id, 'follow_up')}
                              className="rounded-lg bg-cyan-50 text-cyan-650 hover:bg-cyan-100 dark:bg-cyan-950 dark:text-cyan-400 px-2 py-1 text-[10px] font-bold border border-cyan-200 transition cursor-pointer"
                            >
                              Follow-up
                            </button>
                          </>
                        )}
                        
                        {['approved', 'follow_up'].includes(enq.status) && (
                          <button
                            onClick={() => handleConvertToStudent(enq._id)}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 text-[10px] font-bold shadow transition cursor-pointer flex items-center gap-1 inline-flex"
                          >
                            <UserPlus className="h-3.5 w-3.5" /> Convert to Student
                          </button>
                        )}

                        {enq.status !== 'converted' && enq.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(enq._id, 'rejected')}
                            className="rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-500 px-2 py-1 text-[10px] font-bold transition cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
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
  );
}
