import React from 'react';
import { connectToDatabase } from '@/lib/db';
import { Class } from '@/models/Class';
import { Section } from '@/models/Section';
import AttendanceMarkingSheet from '@/components/dashboard/AttendanceMarkingSheet';

export default async function AttendancePage() {
  let classes: any[] = [];
  let sections: any[] = [];

  try {
    await connectToDatabase();
    classes = await Class.find({}).sort({ name: 1 });
    sections = await Section.find({}).sort({ name: 1 });
  } catch (error) {
    console.warn('MongoDB query failed on teacher attendance page, using mockup dropdown options.', error);
    classes = [{ _id: '6686bfb0a0db67bb23d11b09', name: 'Class 10' }];
    sections = [{ _id: '6686bfb0a0db67bb23d11b0b', name: 'A', class: '6686bfb0a0db67bb23d11b09' }];
  }

  const serializedClasses = classes.map((c) => ({
    id: c._id.toString(),
    name: c.name,
  }));

  const serializedSections = sections.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    classId: s.class.toString(),
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Daily Attendance marking</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select class, section, date, and mark student status codes. Overwrites are allowed for editing.
        </p>
      </div>

      {/* Render the Client Marking Sheet */}
      <AttendanceMarkingSheet classes={serializedClasses} sections={serializedSections} />
    </div>
  );
}
