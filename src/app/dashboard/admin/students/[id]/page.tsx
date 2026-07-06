'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { ArrowLeft, User, CreditCard, CalendarCheck } from 'lucide-react';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { selectedStudent } = useStore();
  const [studentData, setStudentData] = useState<any>(selectedStudent);
  const [fees, setFees] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(!selectedStudent);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/students/${id}`);
        const data = await res.json();
        if (data.success) {
          setStudentData(data.student);
          setFees(data.fees);
          setAttendance(data.attendance);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudent();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading student 360° profile...</div>;
  if (!studentData) return <div className="text-center py-10 text-rose-500">Student not found.</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer">
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </button>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
            {studentData.profileImage ? (
              <img src={studentData.profileImage} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-6 w-6 text-slate-500" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{studentData.name}</h1>
            <p className="text-xs text-slate-500 mt-1 font-mono uppercase">ID: {studentData.admissionNo} • {studentData.className}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Core Profile</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-400 font-semibold w-24 inline-block">Parent:</span> {studentData.parentName}</p>
            <p><span className="text-slate-400 font-semibold w-24 inline-block">Phone:</span> {studentData.parentPhone}</p>
            <p><span className="text-slate-400 font-semibold w-24 inline-block">Gender:</span> {studentData.gender}</p>
            <p><span className="text-slate-400 font-semibold w-24 inline-block">Aadhaar:</span> <span className="font-mono">{studentData.aadhaarNo}</span></p>
          </div>
        </div>

        {/* Fees Ledger */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
            <CreditCard className="h-5 w-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Fee Ledger</h3>
          </div>
          {fees ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500">Total Fees</span>
                <span className="text-sm font-black text-slate-800 dark:text-white">₹{fees.totalAmount}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-emerald-500">Paid</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{fees.paidAmount}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-rose-500">Pending</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400">₹{fees.pendingAmount}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No fee records found for this academic session.</p>
          )}
        </div>

        {/* Attendance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
            <CalendarCheck className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Attendance (30 Days)</h3>
          </div>
          {attendance ? (
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">{attendance.attendancePercentage}%</span>
                <span className="text-xs font-bold text-slate-400 mb-1">overall</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                  <span className="block text-[10px] font-bold text-emerald-600 uppercase">Present</span>
                  <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">{attendance.presentDays} days</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
                  <span className="block text-[10px] font-bold text-rose-600 uppercase">Absent</span>
                  <span className="text-lg font-black text-rose-700 dark:text-rose-400">{attendance.absentDays} days</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No attendance records generated yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
