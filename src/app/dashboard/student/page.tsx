import React from 'react';
import { connectToDatabase } from '@/lib/db';
import { Student } from '@/models/Student';
import { StudentFee } from '@/models/Fee';
import { Notice } from '@/models/Notice';
import { User as UserModel } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import StudentProfileSetupWizard from '@/components/dashboard/StudentProfileSetupWizard';

const defaultStudentStats = {
  profile: {
    name: 'Aarav Mehta',
    admissionNo: 'ADM-2026-049',
    rollNo: '2610A05',
    phone: '',
    profileImage: '',
    className: 'Class 10 A',
    parentName: 'Mr. Vikram Mehta',
    parentPhone: '9876543210',
    address: '45, Palm Avenue, Sector 5, New Delhi - 110001',
    transport: 'Route No. 4 (Bus DL-01-A-1234)',
  },
  attendancePercentage: 88,
  installments: [
    { name: 'Admission Installment (Term 1)', amount: 15000, paidAmount: 15000, status: 'Paid', dueDate: new Date('2026-04-10') },
    { name: 'Quarter 1 Tuition Fee', amount: 9000, paidAmount: 4000, status: 'Partial', dueDate: new Date('2026-07-15') },
    { name: 'Quarter 2 Tuition & Exam Fee', amount: 10500, paidAmount: 0, status: 'Unpaid', dueDate: new Date('2026-10-15') },
  ],
  homeworkList: [
    { subjectName: 'Mathematics', title: 'Quadratic Equations Exercise 4.2', dueDate: new Date('2026-07-10'), desc: 'Solve questions 1 to 10 in your class notebook.' },
    { subjectName: 'Science', title: 'Chemical Reactions Practicum Writeup', dueDate: new Date('2026-07-12'), desc: 'Complete the lab manual analysis for the oxidation experiment.' },
  ],
  notices: [
    { title: 'Admissions Open for Academic Session 2026-27', date: new Date() },
    { title: 'Summer Vacation Circular 2026', date: new Date(Date.now() - 86400000 * 2) },
  ],
};

export default async function StudentDashboard() {
  let data = defaultStudentStats;

  try {
    await connectToDatabase();
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        const userRecord = await UserModel.findById(decoded.id).select('name phone');
        const student = await Student.findOne({ user: decoded.id })
          .populate('class')
          .populate('section');

        if (student) {
          const ledger = await StudentFee.findOne({ student: student._id });
          const activeNotices = await Notice.find({ expiryDate: { $gte: new Date() } })
            .sort({ createdAt: -1 })
            .limit(3);

          data = {
            profile: {
              name: userRecord?.name || decoded.email,
              admissionNo: student.admissionNo,
              rollNo: student.rollNo,
              phone: userRecord?.phone || '',
              profileImage: student.profileImage || '',
              className: `${student.class.name} - ${student.section.name}`,
              parentName: student.parentName,
              parentPhone: student.parentPhone,
              address: student.address,
              transport: student.transportDetails || 'Self transport',
            },
            attendancePercentage: 92, // Static mock for attendance ratio
            installments: ledger
              ? ledger.installments.map((inst: { name: string; amount: number; paidAmount: number; status: string; dueDate: Date }) => ({
                  name: inst.name,
                  amount: inst.amount,
                  paidAmount: inst.paidAmount,
                  status: inst.status,
                  dueDate: inst.dueDate,
                }))
              : defaultStudentStats.installments,
            homeworkList: defaultStudentStats.homeworkList,
            notices: activeNotices.map((n: { title: string; createdAt: Date }) => ({
              title: n.title,
              date: n.createdAt,
            })),
          };
        }
      }
    }
  } catch (error) {
    console.warn('MongoDB query failed on student dashboard, using mock state.', error);
  }

  const { profile, attendancePercentage, installments, homeworkList } = data;
  const setupIncomplete = !profile.phone || !profile.profileImage;

  return (
    <div className="space-y-8">
      <StudentProfileSetupWizard initiallyOpen={setupIncomplete} />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Student Dashboard</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Welcome back, <span className="font-bold text-indigo-600 dark:text-indigo-400">{profile.name}</span>. Check your profile, attendance, fee dues, and homework.
        </p>
      </div>

      {/* Grid: Profile & Attendance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Card (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-105 dark:border-slate-800">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.name}
                className="h-14 w-14 rounded-full object-cover shadow-md border-2 border-indigo-100 dark:border-indigo-900 shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-750 dark:bg-indigo-950 dark:text-indigo-300 font-black text-lg flex items-center justify-center uppercase shrink-0">
                {profile.name.substring(0, 2)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">{profile.name}</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 mt-1">
                {profile.className}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs text-slate-600 dark:text-slate-400">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Roll Number</span>
              <span className="font-bold text-slate-900 dark:text-white">{profile.rollNo}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Admission Number</span>
              <span className="font-bold text-slate-900 dark:text-white">{profile.admissionNo}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Parent/Guardian Name</span>
              <span className="font-semibold text-slate-850 dark:text-slate-200">{profile.parentName}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Parent Phone</span>
              <span className="font-semibold text-slate-855 dark:text-slate-250">{profile.parentPhone}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-[10px] text-slate-400 uppercase">Permanent Address</span>
              <span className="font-semibold text-slate-855 dark:text-slate-250">{profile.address}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-[10px] text-slate-400 uppercase">Transport Facility Details</span>
              <span className="font-semibold text-slate-855 dark:text-slate-250">{profile.transport}</span>
            </div>
          </div>
        </div>

        {/* Attendance Card (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center items-center text-center space-y-4 h-68">
          <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
            Attendance Rate
          </span>
          <div className="relative flex items-center justify-center">
            {/* Simple Circular progress mock */}
            <div className="h-28 w-28 rounded-full border-8 border-indigo-100 dark:border-indigo-950 flex items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {attendancePercentage}%
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal max-w-[150px]">
            You have satisfied the minimum attendance quota of 75% required for CBSE exams.
          </p>
        </div>
      </div>

      {/* Grid: Fee Ledger & Homework checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Fee Dues (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fee ledger Dues</h3>
          <div className="space-y-3">
            {installments.map((inst, i) => {
              const due = inst.amount - inst.paidAmount;
              const statusColors: Record<string, string> = {
                Paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
                Partial: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900',
                Unpaid: 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 border-rose-100 dark:border-rose-900',
              };

              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center"
                >
                  <div className="space-y-1 max-w-[180px]">
                    <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">{inst.name}</span>
                    <span className="block text-[10px] text-slate-400">
                      Due: {new Date(inst.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="text-xs">
                      <span className="block text-slate-400 text-[10px]">Due Balance</span>
                      <span className="font-bold text-slate-900 dark:text-white">₹{due}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[inst.status]}`}>
                      {inst.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Homework list (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Assignments</h3>
          <div className="space-y-3">
            {homeworkList.map((homework, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[9px] font-bold px-1.5 py-0.5">
                      {homework.subjectName}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {homework.title}
                    </h4>
                  </div>
                  <span className="text-[9px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 rounded">
                    Due: {homework.dueDate.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                  {homework.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
