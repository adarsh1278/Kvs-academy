'use client';

import React, { useState, useEffect } from 'react';
import { Award, BookOpen, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentMark {
  id: string;
  examId: string;
  examTitle: string;
  examType: string;
  examDate: string;
  subjectName: string;
  subjectCode: string;
  marksObtained: number;
  totalMarks: number;
  remarks: string;
}

export default function StudentExamsPage() {
  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await fetch('/api/student/marks');
        const data = await res.json();
        if (data.success) {
          setMarks(data.marks);
        } else {
          setError(data.error || 'Failed to fetch your exam results.');
        }
      } catch (err) {
        console.error('Error fetching marks:', err);
        setError('Error connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  // Categorize exams
  const termExams = marks.filter(m => ['Quarterly', 'Half-Yearly', 'Annual'].includes(m.examType));
  const customTests = marks.filter(m => m.examType === 'Custom Test');

  // Group term exams by exam title
  const termExamsGrouped: Record<string, StudentMark[]> = {};
  termExams.forEach(m => {
    if (!termExamsGrouped[m.examTitle]) {
      termExamsGrouped[m.examTitle] = [];
    }
    termExamsGrouped[m.examTitle].push(m);
  });

  // Calculate overall metrics
  const totalMarksObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
  const totalMaxMarks = marks.reduce((sum, m) => sum + m.totalMarks, 0);
  const aggregatePercentage = totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Academic Performance</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review your examination scores, term results, subject test metrics, and teacher comments.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading performance report...</div>
      ) : marks.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <Award className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-850 dark:text-white">No Exam Records Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Your exam grades and test reports will be displayed here as soon as they are uploaded by your teachers.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Aggregate Score</span>
                <span className="block text-2xl font-black text-slate-800 dark:text-white">{aggregatePercentage}%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Total Exams</span>
                <span className="block text-2xl font-black text-slate-800 dark:text-white">
                  {Object.keys(termExamsGrouped).length} Term / {customTests.length} Quiz
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Subjects Graded</span>
                <span className="block text-2xl font-black text-slate-800 dark:text-white">
                  {new Set(marks.map(m => m.subjectName)).size}
                </span>
              </div>
            </div>
          </div>

          {/* Term Exams section */}
          {Object.keys(termExamsGrouped).length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-indigo-500" /> Term Examination Reports
              </h3>

              <div className="space-y-6">
                {Object.entries(termExamsGrouped).map(([title, subjectMarks]) => {
                  const examTotalObtained = subjectMarks.reduce((sum, m) => sum + m.marksObtained, 0);
                  const examTotalMax = subjectMarks.reduce((sum, m) => sum + m.totalMarks, 0);
                  const examPercentage = examTotalMax > 0 ? ((examTotalObtained / examTotalMax) * 100).toFixed(1) : '0';

                  return (
                    <div 
                      key={title} 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-850 pb-4 gap-2">
                        <div>
                          <h4 className="text-base font-black text-slate-850 dark:text-white">{title}</h4>
                          <span className="text-[10px] text-slate-400">Session Term Exam Report</span>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                          Term Score: {examTotalObtained}/{examTotalMax} ({examPercentage}%)
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-[10px] font-bold uppercase">Subject</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase">Marks Obtained</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase">Max Marks</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase">Percentage</TableHead>
                              <TableHead className="text-[10px] font-bold uppercase">Remarks</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subjectMarks.map((m) => {
                              const pct = m.totalMarks > 0 ? ((m.marksObtained / m.totalMarks) * 100).toFixed(0) : '0';
                              return (
                                <TableRow key={m.id}>
                                  <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {m.subjectName} <span className="text-[10px] text-slate-400 font-normal">({m.subjectCode})</span>
                                  </TableCell>
                                  <TableCell className="text-xs font-bold">{m.marksObtained}</TableCell>
                                  <TableCell className="text-xs">{m.totalMarks}</TableCell>
                                  <TableCell className="text-xs font-bold text-slate-650 dark:text-slate-350">{pct}%</TableCell>
                                  <TableCell className="text-xs italic text-slate-500 dark:text-slate-400">
                                    {m.remarks || 'No remarks provided.'}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Subject Tests */}
          {customTests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-emerald-500" /> Custom Class Tests & Quizzes
              </h3>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] font-bold uppercase">Test Title</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Subject</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Marks Obtained</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Max Marks</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Percentage</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Date</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Teacher Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customTests.map((m) => {
                      const pct = m.totalMarks > 0 ? ((m.marksObtained / m.totalMarks) * 100).toFixed(0) : '0';
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {m.examTitle}
                          </TableCell>
                          <TableCell className="text-xs">{m.subjectName}</TableCell>
                          <TableCell className="text-xs font-bold">{m.marksObtained}</TableCell>
                          <TableCell className="text-xs">{m.totalMarks}</TableCell>
                          <TableCell className="text-xs font-bold text-slate-650 dark:text-slate-350">{pct}%</TableCell>
                          <TableCell className="text-xs">{m.examDate}</TableCell>
                          <TableCell className="text-xs italic text-slate-500 dark:text-slate-400">
                            {m.remarks || 'N/A'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
