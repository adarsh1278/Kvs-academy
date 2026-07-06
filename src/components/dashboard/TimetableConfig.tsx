'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash, Clock, Save, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PeriodInput {
  isBreak: boolean;
  breakTitle?: string;
  subjectId?: string;
  teacherId?: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
}

export default function TimetableConfig() {
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  
  const [timetable, setTimetable] = useState<Record<string, PeriodInput[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Load classes, sections, subjects, teachers
  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        const [classRes, subjectRes, teacherRes] = await Promise.all([
          fetch('/api/classes'),
          fetch('/api/subjects'),
          fetch('/api/teachers'),
        ]);

        const classData = await classRes.json();
        const subjectData = await subjectRes.json();
        const teacherData = await teacherRes.json();

        if (classData.success) {
          setClasses(classData.classes);
          setSections(classData.sections);
        }
        if (subjectData.success) {
          setSubjects(subjectData.subjects);
        }
        if (teacherData.success) {
          setTeachers(teacherData.teachers);
        }
      } catch (err) {
        console.error('Failed to load configuration data:', err);
        setError('Failed to load initial configuration data.');
      }
    };

    loadConfiguration();
  }, []);

  // Fetch timetable when class and section are selected
  useEffect(() => {
    if (!selectedClassId || !selectedSectionId) return;

    const fetchTimetable = async () => {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const res = await fetch(`/api/admin/timetable?classId=${selectedClassId}&sectionId=${selectedSectionId}`);
        const data = await res.json();
        if (data.success) {
          setTimetable(data.timetable);
        } else {
          setError(data.error || 'Failed to load timetable.');
        }
      } catch (err) {
        console.error('Fetch timetable error:', err);
        setError('Error connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [selectedClassId, selectedSectionId]);

  const filteredSections = sections.filter(s => s.classId === selectedClassId);

  const addSlot = (day: string, isBreak: boolean) => {
    const newSlot: PeriodInput = isBreak
      ? { isBreak: true, breakTitle: 'Lunch Break', startTime: '12:00', endTime: '12:45' }
      : { isBreak: false, subjectId: '', teacherId: '', startTime: '08:30', endTime: '09:15', roomNumber: '' };

    setTimetable(prev => ({
      ...prev,
      [day]: [...prev[day], newSlot],
    }));
  };

  const removeSlot = (day: string, index: number) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].filter((_, idx) => idx !== index),
    }));
  };

  const updateSlot = (day: string, index: number, field: keyof PeriodInput, value: any) => {
    setTimetable(prev => {
      const updatedList = [...prev[day]];
      updatedList[index] = {
        ...updatedList[index],
        [field]: value,
      };
      return {
        ...prev,
        [day]: updatedList,
      };
    });
  };

  const handleSave = async () => {
    if (!selectedClassId || !selectedSectionId) return;
    setSaving(true);
    setError('');
    setSuccess('');

    // Validation
    for (const day of days) {
      for (let i = 0; i < timetable[day].length; i++) {
        const slot = timetable[day][i];
        if (!slot.startTime || !slot.endTime) {
          setError(`Time fields are required for slots on ${day}.`);
          setSaving(false);
          return;
        }
        if (!slot.isBreak && (!slot.subjectId || !slot.teacherId)) {
          setError(`Subject and Teacher are required for normal periods on ${day}.`);
          setSaving(false);
          return;
        }
      }
    }

    try {
      const res = await fetch('/api/admin/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          sectionId: selectedSectionId,
          timetable,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Timetable saved successfully!');
      } else {
        setError(data.error || 'Failed to save timetable.');
      }
    } catch (err) {
      console.error('Save timetable error:', err);
      setError('Error saving timetable to the server.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Timetable Builder</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure weekly schedules, subject lectures, break periods, and room assignments.
          </p>
        </div>
        {selectedClassId && selectedSectionId && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 px-5 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Timetable'}
            <Save className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Select Class</label>
          <Select value={selectedClassId} onValueChange={(val) => { setSelectedClassId(val || ''); setSelectedSectionId(''); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Select Section</label>
          <Select 
            value={selectedSectionId} 
            onValueChange={(val) => setSelectedSectionId(val || '')} 
            disabled={!selectedClassId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedClassId ? "Choose Section" : "First select a Class"} />
            </SelectTrigger>
            <SelectContent>
              {filteredSections.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Grid Schedule */}
      {selectedClassId && selectedSectionId ? (
        loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading schedule...</div>
        ) : (
          <div className="space-y-6">
            {days.map(day => (
              <div 
                key={day} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{day}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addSlot(day, false)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/55 px-3 py-1.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-400 transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Period
                    </button>
                    <button
                      onClick={() => addSlot(day, true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Break
                    </button>
                  </div>
                </div>

                {timetable[day].length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">No slots configured for this day.</p>
                ) : (
                  <div className="space-y-4">
                    {timetable[day].map((slot, idx) => (
                      <div 
                        key={idx}
                        className={`flex flex-col md:flex-row items-start md:items-center gap-3 p-4 rounded-2xl border transition ${
                          slot.isBreak 
                            ? 'bg-amber-50/30 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/40' 
                            : 'bg-indigo-50/10 border-indigo-50/50 dark:bg-indigo-950/5 dark:border-indigo-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <input 
                            type="time" 
                            value={slot.startTime} 
                            onChange={(e) => updateSlot(day, idx, 'startTime', e.target.value)}
                            className="bg-transparent border-0 font-bold focus:ring-0 w-16 p-0 text-slate-800 dark:text-white"
                          />
                          <span>-</span>
                          <input 
                            type="time" 
                            value={slot.endTime} 
                            onChange={(e) => updateSlot(day, idx, 'endTime', e.target.value)}
                            className="bg-transparent border-0 font-bold focus:ring-0 w-16 p-0 text-slate-800 dark:text-white"
                          />
                        </div>

                        {slot.isBreak ? (
                          <div className="flex-1 w-full">
                            <input
                              type="text"
                              value={slot.breakTitle}
                              onChange={(e) => updateSlot(day, idx, 'breakTitle', e.target.value)}
                              placeholder="Break Name (e.g. Lunch)"
                              className="w-full text-xs font-bold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Select 
                              value={slot.subjectId || ''} 
                              onValueChange={(val) => updateSlot(day, idx, 'subjectId', val || '')}
                            >
                              <SelectTrigger className="w-full h-9 text-xs">
                                <SelectValue placeholder="Select Subject" />
                              </SelectTrigger>
                              <SelectContent>
                                {subjects.map(sub => (
                                  <SelectItem key={sub.id} value={sub.id}>{sub.name} ({sub.code})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select 
                              value={slot.teacherId || ''} 
                              onValueChange={(val) => updateSlot(day, idx, 'teacherId', val || '')}
                            >
                              <SelectTrigger className="w-full h-9 text-xs">
                                <SelectValue placeholder="Select Teacher" />
                              </SelectTrigger>
                              <SelectContent>
                                {teachers.map(t => (
                                  <SelectItem key={t.userId} value={t.userId}>{t.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <input
                              type="text"
                              value={slot.roomNumber || ''}
                              onChange={(e) => updateSlot(day, idx, 'roomNumber', e.target.value)}
                              placeholder="Room (e.g. 10-A)"
                              className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 outline-none h-9"
                            />
                          </div>
                        )}

                        <button
                          onClick={() => removeSlot(day, idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl shrink-0 cursor-pointer"
                          aria-label="Remove slot"
                        >
                          <Trash className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <Calendar className="h-12 w-12 text-slate-350 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Configure a Schedule</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Please select a Class and Section above to fetch and build the weekly school timetable.
          </p>
        </div>
      )}
    </div>
  );
}
