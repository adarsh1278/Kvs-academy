import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Section } from '@/models/Section';
import { Timetable } from '@/models/Timetable';
import { Class } from '@/models/Class';
import { Subject } from '@/models/Subject';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Sections where teacher is Class Teacher
    const classTeacherSections = await Section.find({ classTeacher: session.id }).populate('class');

    // 2. Class + Section + Subject combinations taught by this teacher from Timetable
    const timetableRecords = await Timetable.find({
      'periods.teacher': session.id
    }).populate('class').populate('section').populate('periods.subject');

    const teachingAssignments: any[] = [];
    const seenAssignments = new Set();

    timetableRecords.forEach(record => {
      record.periods.forEach((p: any) => {
        if (p.teacher?.toString() === session.id && p.subject) {
          const classId = record.class?._id?.toString() || '';
          const sectionId = record.section?._id?.toString() || '';
          const subjectId = p.subject?._id?.toString() || '';
          const key = `${classId}-${sectionId}-${subjectId}`;

          if (!seenAssignments.has(key) && classId && sectionId && subjectId) {
            seenAssignments.add(key);
            teachingAssignments.push({
              classId,
              className: record.class?.name || 'Class',
              sectionId,
              sectionName: record.section?.name || 'Section',
              subjectId,
              subjectName: p.subject?.name || 'Subject',
              subjectCode: p.subject?.code || '',
            });
          }
        }
      });
    });

    // Get all subjects (in case class teacher wants to upload term exam marks for any subject in their class)
    const allSubjects = await Subject.find({}).populate('class');

    return NextResponse.json({
      success: true,
      classTeacherSections: classTeacherSections.map(s => ({
        classId: s.class?._id?.toString() || '',
        className: s.class?.name || 'Class',
        sectionId: s._id.toString(),
        sectionName: s.name,
      })),
      teachingAssignments,
      allSubjects: allSubjects.map(sub => ({
        id: sub._id.toString(),
        name: sub.name,
        code: sub.code,
        classId: sub.class?._id?.toString() || '',
      })),
    });
  } catch (error: any) {
    console.error('Fetch teacher exams config error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
