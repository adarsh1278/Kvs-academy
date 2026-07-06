import React from 'react';
import { connectToDatabase } from '@/lib/db';
import { Class } from '@/models/Class';
import { Section } from '@/models/Section';
import ReceptionistAdmissionsForm from '@/components/dashboard/ReceptionistAdmissionsForm';

export default async function ReceptionistAdmissionsPage() {
  let classes: any[] = [];
  let sections: any[] = [];

  try {
    await connectToDatabase();
    classes = await Class.find({}).sort({ name: 1 });
    sections = await Section.find({}).sort({ name: 1 });
  } catch (error) {
    console.warn('Failed to load class/section parameters for receptionist registration.', error);
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
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Register Student Admission</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Enter student personal details, roll assignments, and parental metadata to register an account.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm max-w-3xl mx-auto">
        <ReceptionistAdmissionsForm classes={serializedClasses} sections={serializedSections} />
      </div>
    </div>
  );
}
