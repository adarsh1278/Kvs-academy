'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileCheck,
  AlertCircle,
  HelpCircle,
  ListFilter,
  Save,
} from 'lucide-react';

interface ClassOpt {
  id: string;
  name: string;
}

interface SectionOpt {
  id: string;
  name: string;
  classId: string;
}

export default function AttendanceMarkingSheet({
  classes,
  sections,
}: {
  classes: ClassOpt[];
  sections: SectionOpt[];
}) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const [filteredSections, setFilteredSections] = useState<SectionOpt[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  // Register sheet states: key is studentId, value is status
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: string; remarks: string }>>({});
  
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Filter sections when class changes
  useEffect(() => {
    if (selectedClass) {
      const filtered = sections.filter((s) => s.classId === selectedClass);
      setFilteredSections(filtered);
      setSelectedSection('');
      setStudents([]);
    } else {
      setFilteredSections([]);
      setSelectedSection('');
      setStudents([]);
    }
  }, [selectedClass, sections]);

  const loadStudentList = async () => {
    if (!selectedSection) return;

    setLoadingStudents(true);
    setSaveStatus(null);

    try {
      const res = await fetch(`/api/sections/students?sectionId=${selectedSection}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        
        // Initialize records: default to Present
        const initialRecords: Record<string, { status: string; remarks: string }> = {};
        data.students.forEach((student: any) => {
          initialRecords[student._id] = { status: 'Present', remarks: '' };
        });
        setAttendanceRecords(initialRecords);

        if (data.students.length === 0) {
          alert('No students found registered in this section.');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load class register.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status: string) => {
    const updated = { ...attendanceRecords };
    students.forEach((s) => {
      if (updated[s._id]) {
        updated[s._id].status = status;
      }
    });
    setAttendanceRecords(updated);
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) return;

    setSaving(true);
    setSaveStatus(null);

    const recordsArray = Object.keys(attendanceRecords).map((studentId) => ({
      student: studentId,
      status: attendanceRecords[studentId].status,
      remarks: attendanceRecords[studentId].remarks,
    }));

    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          sectionId: selectedSection,
          date: selectedDate,
          records: recordsArray,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveStatus('Attendance saved successfully!');
        alert('Daily class attendance recorded!');
      } else {
        throw new Error(data.error || 'Failed to save attendance register');
      }
    } catch (err: any) {
      setSaveStatus(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Stats calculation
  const totalStudents = students.length;
  const countStatus = (status: string) => {
    return Object.values(attendanceRecords).filter((r) => r.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* 1. Selection controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Select Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none"
          >
            <option value="">Select Grade</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Select Section
          </label>
          <select
            value={selectedSection}
            disabled={!selectedClass}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none disabled:opacity-50"
          >
            <option value="">Select Division</option>
            {filteredSections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs focus:outline-none"
          />
        </div>

        <button
          onClick={loadStudentList}
          disabled={!selectedSection || loadingStudents}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 py-2.5 text-xs font-semibold text-white transition shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {loadingStudents ? 'Loading Students...' : 'Load Roll Call'}
        </button>
      </div>

      {/* 2. Marking sheet table */}
      {students.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          {/* Quick Mark controls & stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="font-bold text-slate-500">Quick Mark All:</span>
              <button
                onClick={() => handleMarkAll('Present')}
                className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 text-[10px] font-bold border border-emerald-250 cursor-pointer"
              >
                Present
              </button>
              <button
                onClick={() => handleMarkAll('Absent')}
                className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-[10px] font-bold border border-rose-250 cursor-pointer"
              >
                Absent
              </button>
            </div>

            <div className="flex gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Present: <span className="text-emerald-600 font-bold">{countStatus('Present')}</span></span>
              <span>Absent: <span className="text-rose-500 font-bold">{countStatus('Absent')}</span></span>
              <span>Leave: <span className="text-indigo-500 font-bold">{countStatus('Leave')}</span></span>
            </div>
          </div>

          {/* Student list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="py-2.5">Roll No</th>
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Attendance Status</th>
                  <th className="py-2.5">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {students.map((student) => {
                  const record = attendanceRecords[student._id] || { status: 'Present', remarks: '' };
                  return (
                    <tr key={student._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                      <td className="py-3.5 font-bold font-mono text-slate-500">{student.rollNo}</td>
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">{student.user.name}</td>
                      <td className="py-3.5">
                        <div className="flex gap-2">
                          {['Present', 'Absent', 'Late', 'Half Day', 'Leave'].map((status) => {
                            const isSelected = record.status === status;
                            const statusColorOptions: any = {
                              Present: 'bg-emerald-50 text-emerald-700 border-emerald-250 checked:bg-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900',
                              Absent: 'bg-rose-50 text-rose-700 border-rose-250 checked:bg-rose-600 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900',
                              Late: 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900',
                              'Half Day': 'bg-cyan-50 text-cyan-700 border-cyan-250 dark:bg-cyan-950/20 dark:text-cyan-450 dark:border-cyan-900',
                              Leave: 'bg-indigo-50 text-indigo-700 border-indigo-250 dark:bg-indigo-950/20 dark:text-indigo-450 dark:border-indigo-900',
                            };
                            const isSelectedClass = isSelected
                              ? `${statusColorOptions[status]} ring-2 ring-indigo-500/20 shadow-sm font-black`
                              : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800';

                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusChange(student._id, status)}
                                className={`px-2.5 py-1 border text-[10px] font-bold rounded-lg transition cursor-pointer ${isSelectedClass}`}
                              >
                                {status}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <input
                          type="text"
                          value={record.remarks}
                          onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                          placeholder="Note..."
                          className="w-full max-w-[150px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            {saveStatus && (
              <span className={`text-xs font-bold ${saveStatus.includes('Error') ? 'text-rose-500' : 'text-emerald-600'}`}>
                {saveStatus}
              </span>
            )}
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Submit Attendance Roll'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
