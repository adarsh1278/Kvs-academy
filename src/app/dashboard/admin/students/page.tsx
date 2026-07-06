'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function StudentsListPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Pagination & Modal states
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const itemsPerPage = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Failed to fetch students roster:', err);
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

  const filteredStudents = students.filter((s) =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.admissionNo || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNo || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Student Directory</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Search the complete student enrollment roster, profile details, roll references, and class divisions. Click on any row to open their full profile.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
          <input
            type="text"
            placeholder="Search by student name, roll or adm no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-5-0 dark:bg-slate-950 pl-10 pr-4 py-2 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="text-center py-10 text-slate-455">Loading student records...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-10 text-slate-455">No students found.</div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="py-2.5">Admission No</th>
                    <th className="py-2.5">Student Name</th>
                    <th className="py-2.5">Class / Section</th>
                    <th className="py-2.5">Parent / Contact</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-755 dark:text-slate-355">
                  {paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition cursor-pointer"
                    >
                      <td className="py-3.5 font-mono font-bold text-indigo-650 dark:text-indigo-400">{student.admissionNo}</td>
                      <td className="py-3.5">
                        <span className="block font-bold text-slate-900 dark:text-white">{student.name}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Roll: {student.rollNo}</span>
                      </td>
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">{student.className}</td>
                      <td className="py-3.5">
                        <span className="block font-medium text-slate-855 dark:text-slate-200">{student.parentName}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{student.phone}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900">
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-xs font-semibold text-slate-500">
                <div>
                  Showing {Math.min(filteredStudents.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
                  {Math.min(filteredStudents.length, currentPage * itemsPerPage)} of {filteredStudents.length} entries
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

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              {selectedStudent.profileImage ? (
                <img
                  src={selectedStudent.profileImage}
                  alt={selectedStudent.name}
                  className="h-16 w-16 rounded-full object-cover shadow border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-350 font-bold text-xl uppercase flex items-center justify-center border border-slate-200 dark:border-slate-800 shrink-0">
                  {selectedStudent.name.substring(0, 2)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{selectedStudent.name}</h3>
                <p className="text-xs text-indigo-650 dark:text-indigo-400 font-mono font-bold mt-1">Admission: {selectedStudent.admissionNo}</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mt-0.5">{selectedStudent.className}</p>
              </div>
            </div>

            {/* Details Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Roll Number</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.rollNo}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Status</span>
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900 font-bold text-[10px]">
                  {selectedStudent.status}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Date of Birth</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.dob}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Gender</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.gender}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Parent / Guardian</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.parentName}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Contact Number</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.phone}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Parent Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.parentEmail || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Emergency Phone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.emergencyContact || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Aadhaar Number</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.aadhaarNo || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Transport Details</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.transportDetails || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Hostel Details</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.hostelDetails || 'N/A'}</span>
              </div>
              <div className="md:col-span-2">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Residential Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{selectedStudent.address}</span>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition cursor-pointer text-xs shadow-md"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
