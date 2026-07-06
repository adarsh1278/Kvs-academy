import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Teacher } from '@/models/Teacher';
import { Section } from '@/models/Section';
import { Subject } from '@/models/Subject';
import { Class } from '@/models/Class';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    // 1. Fetch Teacher Profile
    const teacher = await Teacher.findById(id).populate('user');
      
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }

    const userId = teacher.user?._id;

    // 2. Fetch Class Teacher Assignments (Sections where this user is the classTeacher)
    const classAssignments = await Section.find({ classTeacher: userId })
      .populate('class')
      .sort({ name: 1 });

    // 3. Fetch Subject Teacher Assignments (Subjects where this user is the subjectTeacher)
    const subjectAssignments = await Subject.find({ subjectTeacher: userId })
      .populate('class')
      .sort({ name: 1 });

    return NextResponse.json({
      success: true,
      teacher: {
        id: teacher._id.toString(),
        teacherId: teacher.teacherId,
        name: teacher.user?.name || 'Instructor',
        email: teacher.user?.email || 'N/A',
        phone: teacher.user?.phone || 'N/A',
        qualification: teacher.qualification,
        experience: teacher.experience,
        salary: teacher.salary,
        status: teacher.employmentStatus,
        joiningDate: teacher.joiningDate ? teacher.joiningDate.toISOString().split('T')[0] : 'N/A',
        profileImage: teacher.profileImage || '',
      },
      classAssignments: classAssignments.map(s => ({
        sectionId: s._id.toString(),
        sectionName: s.name,
        classId: s.class?._id?.toString(),
        className: s.class?.name || 'Class',
      })),
      subjectAssignments: subjectAssignments.map(sub => ({
        subjectId: sub._id.toString(),
        subjectName: sub.name,
        subjectCode: sub.code,
        subjectType: sub.type,
        classId: sub.class?._id?.toString(),
        className: sub.class?.name || 'Class',
      }))
    });
  } catch (error: any) {
    console.error('Teacher detail fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
