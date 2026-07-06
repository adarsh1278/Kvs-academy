import React from 'react';
import { Mail, GraduationCap, Award, Shield } from 'lucide-react';
import { connectToDatabase } from '@/lib/db';
import { Teacher } from '@/models/Teacher';
import { User } from '@/models/User';
import { Subject } from '@/models/Subject';

// Fallback faculty list
const defaultFaculty = [
  {
    name: 'Mr. Sanjay Gupta',
    qualification: 'M.Sc. in Mathematics, B.Ed.',
    experience: '8 Years',
    subjects: 'Mathematics & Algebra',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    designation: 'Senior Mathematics Head',
  },
  {
    name: 'Mrs. Shalini Sen',
    qualification: 'M.A. in English Lit, M.Ed.',
    experience: '12 Years',
    subjects: 'English & Composition',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    designation: 'Department of Languages, Head',
  },
  {
    name: 'Dr. Alok Tripathi',
    qualification: 'Ph.D. in Organic Chemistry',
    experience: '15 Years',
    subjects: 'Chemistry & Bio-Sciences',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    designation: 'Senior Science Mentor',
  },
  {
    name: 'Ms. Reema Roy',
    qualification: 'M.C.A., B.Tech in IT',
    experience: '6 Years',
    subjects: 'Computer Applications & Coding',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
    designation: 'Computer Dept. Lead',
  },
  {
    name: 'Mr. Peter Fernandes',
    qualification: 'B.P.Ed. in Physical Ed.',
    experience: '9 Years',
    subjects: 'Sports Coaching & Fitness',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    designation: 'Athletics & Sports Instructor',
  },
  {
    name: 'Mrs. Neha Anand',
    qualification: 'M.A. in Fine Arts, B.Ed.',
    experience: '5 Years',
    subjects: 'Visual Arts & Craftwork',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300',
    designation: 'Arts & Craft Coordinator',
  },
];

export default async function FacultyPage() {
  let facultyList = defaultFaculty;

  try {
    await connectToDatabase();
    // Query active teachers and populate their user details
    const dbTeachers = await Teacher.find({ employmentStatus: 'Active' })
      .populate('user')
      .populate('subjects');

    if (dbTeachers.length > 0) {
      facultyList = dbTeachers.map((t: any) => ({
        name: t.user?.name || 'Instructor',
        qualification: t.qualification,
        experience: t.experience,
        subjects: t.subjects.map((sub: any) => sub.name).join(', ') || 'General Subjects',
        image: t.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
        designation: t.user?.designation || 'Faculty Member',
      }));
    }
  } catch (error) {
    console.warn('MongoDB query failed on faculty page, using default static directory.', error);
  }

  return (
    <div className="py-12 md:py-16 space-y-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Meet Our Faculty
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
          Our educators are highly qualified, passionate mentors committed to unlocking the potential of every child.
        </p>
      </div>

      {/* Faculty Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {facultyList.map((faculty, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all p-6 flex flex-col items-center text-center space-y-4"
            >
              <img
                src={faculty.image}
                alt={faculty.name}
                className="w-28 h-28 object-cover rounded-full shadow-inner ring-4 ring-indigo-50 dark:ring-indigo-950"
              />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{faculty.name}</h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                  {faculty.designation}
                </p>
              </div>

              <div className="w-full border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{faculty.qualification}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Award className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Taught subjects: <span className="font-semibold text-slate-600 dark:text-slate-200">{faculty.subjects}</span></span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Experience: <span className="font-semibold text-slate-600 dark:text-slate-200">{faculty.experience}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
