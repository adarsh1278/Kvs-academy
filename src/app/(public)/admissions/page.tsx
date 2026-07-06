import React from 'react';
import { Landmark, FileText, CheckCircle2, ShieldQuestion, HelpCircle } from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import { Class } from '@/models/Class';
import EnquiryForm from '@/components/public/EnquiryForm';

export default async function AdmissionsPage() {
  let classes = [];

  try {
    await connectToDatabase();
    classes = await Class.find({}).sort({ name: 1 });
  } catch (error) {
    console.warn('MongoDB query failed on admissions page, using mock class values.', error);
    classes = [
      { _id: '6686bfb0a0db67bb23d11b10', name: 'Class 9' },
      { _id: '6686bfb0a0db67bb23d11b09', name: 'Class 10' },
    ];
  }

  // Serializing Mongo docs to plain JS objects for client components
  const serializedClasses = classes.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
  }));

  const steps = [
    { title: 'Submit Enquiry', desc: 'Fill out the online application form with correct details and upload the applicant photo.' },
    { title: 'Document Audit', desc: 'Our admissions desk checks age eligibility criteria and transfer records.' },
    { title: 'Student Interaction', desc: 'A short face-to-face interaction is scheduled for parents and the student with the head.' },
    { title: 'Confirm Admission', desc: 'Secure the seat by making the offline admission fee installment at the receptionist desk.' },
  ];

  return (
    <div className="py-12 md:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          School Admissions
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
          Apply online for student registration. Review our admissions pipeline, requirements, and submit your enquiry.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Criteria & Info (4 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Admission Guidelines
            </h3>
            
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                Before filling out the online enquiry form, please read the following guidelines:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Age Limit: The student must satisfy CBSE guidelines for class-specific age limits on April 1st of the session year.</li>
                <li>Required Files: Keep a softcopy of the student's Passport Photo and Birth Certificate or Transfer Certificate ready for upload.</li>
                <li>Offline Payment: Since online fees are not integrated, all subsequent registration fees must be settled in cash or via UPI at the desk.</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <a
                href="#"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 py-3 text-sm font-semibold text-white transition"
              >
                <span>Download School Prospectus</span>
              </a>
            </div>
          </div>

          {/* Admission Steps */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Admissions Flow</h3>
            <div className="relative border-l border-indigo-100 dark:border-indigo-950 ml-3.5 space-y-6">
              {steps.map((step, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className="absolute -left-3.5 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold ring-4 ring-slate-50 dark:ring-slate-950">
                    {idx + 1}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{step.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Admission Enquiry Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <EnquiryForm classes={serializedClasses} />
        </div>
      </div>
    </div>
  );
}
