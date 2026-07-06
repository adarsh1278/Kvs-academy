import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Class } from '@/models/Class';
import { Section } from '@/models/Section';
import { Subject } from '@/models/Subject';
import { User } from '@/models/User';
import { Student } from '@/models/Student';

export async function GET(request: Request, { params }: { params: Promise<{ classId: string }> }) {
  try {
    const { classId } = await params;
    await connectToDatabase();
    
    // Ensure User model is loaded for population
    if (!User) throw new Error('User model missing');
    
    const cls = await Class.findById(classId);
    if (!cls) {
      return NextResponse.json({ success: false, error: 'Class not found' }, { status: 404 });
    }

    const [sections, subjects, students] = await Promise.all([
      Section.find({ class: classId }).populate('classTeacher', 'name email').sort({ name: 1 }),
      Subject.find({ class: classId }).populate('subjectTeacher', 'name email').sort({ name: 1 }),
      Student.find({ class: classId }).populate('user', 'name email phone').populate('section', 'name').sort({ rollNo: 1 }),
    ]);

    return NextResponse.json({
      success: true,
      class: {
        id: cls._id.toString(),
        name: cls.name,
      },
      sections: sections.map(s => ({
        id: s._id.toString(),
        name: s.name,
        classTeacher: s.classTeacher ? {
          id: s.classTeacher._id.toString(),
          name: s.classTeacher.name,
        } : null,
      })),
      subjects: subjects.map(sub => ({
        id: sub._id.toString(),
        name: sub.name,
        code: sub.code,
        type: sub.type,
        subjectTeacher: sub.subjectTeacher ? {
          id: sub.subjectTeacher._id.toString(),
          name: sub.subjectTeacher.name,
        } : null,
      })),
      students: students.map(st => ({
        id: st._id.toString(),
        rollNo: st.rollNo,
        admissionNo: st.admissionNo,
        name: st.user?.name || 'Student',
        email: st.user?.email || 'N/A',
        sectionName: st.section?.name || 'Unassigned',
        profileImage: st.profileImage || '',
      })),
    });
  } catch (error: any) {
    console.error('Class detail fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
