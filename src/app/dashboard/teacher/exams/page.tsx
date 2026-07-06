'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Save, Edit, ClipboardList, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Exam {
  _id: string;
  title: string;
  type: string;
  class: { _id: string; name: string };
  section: { _id: string; name: string };
  subject?: { _id: string; name: string; code: string };
  date: string;
}

export default function TeacherExamsPage() {
  // Config from API
  const [classTeacherSections, setClassTeacherSections] = useState<any[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);

  // Exams List
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

  // Forms
  const [activeTab, setActiveTab] = useState<'exams' | 'marks'>('exams');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Custom Test');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submittingExam, setSubmittingExam] = useState(false);

  // Marks Entry
  const [selectedExamId, setSelectedExamId] = useState('');
  const [marksSubjectId, setMarksSubjectId] = useState('');
  const [studentsMarks, setStudentsMarks] = useState<any[]>([]);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch initial config & exams
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/teacher/exams-config');
        const data = await res.json();
        if (data.success) {
          setClassTeacherSections(data.classTeacherSections);
          setTeachingAssignments(data.teachingAssignments);
          setAllSubjects(data.allSubjects);
        }
      } catch (err) {
        console.error('Fetch config error:', err);
      }
    };

    fetchConfig();
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const res = await fetch('/api/exams');
      const data = await res.json();
      if (data.success) {
        setExams(data.exams);
      }
    } catch (err) {
      console.error('Fetch exams error:', err);
    } finally {
      setLoadingExams(false);
    }
  };

  // Fetch student lists and marks when exam and subject are chosen
  useEffect(() => {
    if (!selectedExamId || !marksSubjectId) return;

    const fetchMarks = async () => {
      setLoadingMarks(true);
      setError('');
      try {
        const res = await fetch(`/api/marks?examId=${selectedExamId}&subjectId=${marksSubjectId}`);
        const data = await res.json();
        if (data.success) {
          setStudentsMarks(data.marks);
        } else {
          setError(data.error || 'Failed to load student marks.');
        }
      } catch (err) {
        console.error('Fetch marks error:', err);
        setError('Error connecting to the server.');
      } finally {
        setLoadingMarks(false);
      }
    };

    fetchMarks();
  }, [selectedExamId, marksSubjectId]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !type || !selectedClassId || !selectedSectionId || !date) {
      setError('Please enter all required fields.');
      return;
    }

    if (type === 'Custom Test' && !selectedSubjectId) {
      setError('Subject is required for custom tests.');
      return;
    }

    setSubmittingExam(true);
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          type,
          classId: selectedClassId,
          sectionId: selectedSectionId,
          subjectId: type === 'Custom Test' ? selectedSubjectId : undefined,
          date,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Exam created successfully!');
        setTitle('');
        setSelectedClassId('');
        setSelectedSectionId('');
        setSelectedSubjectId('');
        fetchExams();
      } else {
        setError(data.error || 'Failed to create exam.');
      }
    } catch (err) {
      console.error('Create exam error:', err);
      setError('Error communicating with server.');
    } finally {
      setSubmittingExam(false);
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedExamId || !marksSubjectId) return;
    setSavingMarks(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExamId,
          subjectId: marksSubjectId,
          marksList: studentsMarks,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Student marks saved successfully!');
      } else {
        setError(data.error || 'Failed to save marks.');
      }
    } catch (err) {
      console.error('Save marks error:', err);
      setError('Error communicating with server.');
    } finally {
      setSavingMarks(false);
    }
  };

  const updateStudentMark = (index: number, field: string, value: any) => {
    setStudentsMarks(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  // Sections selection for Exam Creation based on Exam Type
  const availableSections = type === 'Custom Test'
    ? teachingAssignments.filter((val, index, self) =>
        self.findIndex(t => t.classId === val.classId && t.sectionId === val.sectionId) === index
      )
    : classTeacherSections;

  // Subjects selection for Exam Creation
  const availableSubjects = type === 'Custom Test'
    ? teachingAssignments.filter(t => t.classId === selectedClassId && t.sectionId === selectedSectionId)
    : [];

  // Selected Exam object for Marks Entry tab
  const selectedExam = exams.find(e => e._id === selectedExamId);

  // Subject options for Marks Entry
  const marksSubjectOptions = selectedExam
    ? selectedExam.type === 'Custom Test'
      ? selectedExam.subject ? [selectedExam.subject] : []
      : allSubjects.filter(sub => sub.classId === selectedExam.class?._id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Examinations & Marks</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage exam sessions, create term or custom subject tests, and upload student grades.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => { setActiveTab('exams'); setError(''); setSuccess(''); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'exams'
              ? 'border-b-2 border-indigo-650 text-indigo-700 dark:text-indigo-400 font-black'
              : 'text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          } cursor-pointer`}
        >
          Manage Exams
        </button>
        <button
          onClick={() => { setActiveTab('marks'); setError(''); setSuccess(''); }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'marks'
              ? 'border-b-2 border-indigo-650 text-indigo-700 dark:text-indigo-400 font-black'
              : 'text-slate-550 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white'
          } cursor-pointer`}
        >
          Enter Marks
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'exams' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Exam Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Exam Session</h3>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">Exam Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 1st Quarterly Exam"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">Exam Type</label>
                <Select value={type} onValueChange={(val) => { setType(val || 'Custom Test'); setSelectedClassId(''); setSelectedSectionId(''); setSelectedSubjectId(''); }}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Half-Yearly">Half-Yearly</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                    <SelectItem value="Custom Test">Custom Test (Class Subject Quiz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">Class & Section</label>
                <Select
                  key={`section-select-${availableSections.length}-${selectedClassId}`}
                  value={selectedClassId ? `${selectedClassId}-${selectedSectionId}` : ''}
                  onValueChange={(val) => {
                    if (val) {
                      const [c, s] = val.split('-');
                      setSelectedClassId(c);
                      setSelectedSectionId(s);
                    }
                  }}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Choose Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSections.map((sec, idx) => (
                      <SelectItem key={idx} value={`${sec.classId}-${sec.sectionId}`}>
                        {sec.className} - {sec.sectionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {type === 'Custom Test' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Subject</label>
                  <Select 
                    key={`subject-select-${availableSubjects.length}-${selectedSubjectId}`}
                    value={selectedSubjectId} 
                    onValueChange={(val) => setSelectedSubjectId(val || '')} 
                    disabled={!selectedSectionId}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Choose Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map(sub => (
                        <SelectItem key={sub.subjectId} value={sub.subjectId}>
                          {sub.subjectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingExam}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-400 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
              >
                {submittingExam ? 'Creating...' : 'Create Exam'}
                <Plus className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Exams List */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam List</h3>

            {loadingExams ? (
              <div className="py-12 text-center text-xs text-slate-500">Loading exams...</div>
            ) : exams.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-12 text-center">No exams configured yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] font-bold uppercase">Title</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Type</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Class</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Subject</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Date</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam._id}>
                        <TableCell className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {exam.title}
                        </TableCell>
                        <TableCell className="text-xs">{exam.type}</TableCell>
                        <TableCell className="text-xs">
                          {exam.class?.name || 'Class'} - {exam.section?.name || 'Section'}
                        </TableCell>
                        <TableCell className="text-xs text-slate-550 dark:text-slate-400">
                          {exam.subject ? `${exam.subject.name} (${exam.subject.code})` : 'All Subjects (Term)'}
                        </TableCell>
                        <TableCell className="text-xs">{exam.date.split('T')[0]}</TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => {
                              setSelectedExamId(exam._id);
                              setMarksSubjectId(exam.subject?._id || '');
                              setActiveTab('marks');
                              setError('');
                              setSuccess('');
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-650 hover:underline dark:text-indigo-400 cursor-pointer"
                          >
                            <ClipboardList className="h-3.5 w-3.5" /> Enter Marks
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Enter Marks Screen */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400">Select Exam Session</label>
              <Select 
                key={`exam-select-${exams.length}-${selectedExamId}`}
                value={selectedExamId} 
                onValueChange={(val) => { setSelectedExamId(val || ''); setMarksSubjectId(''); setStudentsMarks([]); }}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(e => (
                    <SelectItem key={e._id} value={e._id}>
                      {e.title} ({e.class?.name}-{e.section?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400">Select Subject</label>
              <Select 
                key={`subject-select-${marksSubjectOptions.length}-${marksSubjectId}`}
                value={marksSubjectId} 
                onValueChange={(val) => setMarksSubjectId(val || '')} 
                disabled={!selectedExamId}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder={selectedExamId ? "Choose Subject" : "First select an Exam"} />
                </SelectTrigger>
                <SelectContent>
                  {marksSubjectOptions.map((sub: any) => (
                    <SelectItem key={sub._id || sub.id} value={sub._id || sub.id}>
                      {sub.name} {sub.code ? `(${sub.code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedExamId && marksSubjectId && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Student Marking Sheet</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Class: {selectedExam?.class?.name}-{selectedExam?.section?.name} | Subject: {marksSubjectOptions.find((o: any) => (o._id || o.id) === marksSubjectId)?.name}
                  </p>
                </div>
                <button
                  onClick={handleSaveMarks}
                  disabled={savingMarks || studentsMarks.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 disabled:bg-indigo-400 px-4 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                >
                  {savingMarks ? 'Saving...' : 'Save Marks'}
                  <Save className="h-4 w-4" />
                </button>
              </div>

              {loadingMarks ? (
                <div className="py-12 text-center text-xs text-slate-500">Loading student list...</div>
              ) : studentsMarks.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-12">No students registered in this class.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] font-bold uppercase w-20">Roll No</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase">Name</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase w-32">Marks Obtained</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase w-32">Total Marks</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase">Teacher Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsMarks.map((s, idx) => (
                        <TableRow key={s.studentId}>
                          <TableCell className="text-xs font-bold text-slate-450">{s.rollNumber}</TableCell>
                          <TableCell className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {s.name}
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              value={s.marksObtained}
                              onChange={(e) => updateStudentMark(idx, 'marksObtained', e.target.value)}
                              placeholder="Score"
                              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500"
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              value={s.totalMarks}
                              onChange={(e) => updateStudentMark(idx, 'totalMarks', e.target.value)}
                              placeholder="Out of"
                              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500"
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="text"
                              value={s.remarks}
                              onChange={(e) => updateStudentMark(idx, 'remarks', e.target.value)}
                              placeholder="e.g. Excellent work, Need improvement"
                              className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
