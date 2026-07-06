import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Mark } from '@/models/Mark';
import { Student } from '@/models/Student';
import { Exam } from '@/models/Exam';
import { Subject } from '@/models/Subject';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();

    const session = await getSession();
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const student = await Student.findOne({ user: session.id });
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student profile not found' }, { status: 404 });
    }

    const marks = await Mark.find({ student: student._id })
      .populate({
        path: 'exam',
        model: 'Exam',
        populate: [
          { path: 'class', model: 'Class', select: 'name' },
          { path: 'section', model: 'Section', select: 'name' }
        ]
      })
      .populate('subject', 'name code type');

    const formatted = marks.map((m: any) => ({
      id: m._id.toString(),
      examId: m.exam?._id?.toString() || '',
      examTitle: m.exam?.title || 'Unknown Exam',
      examType: m.exam?.type || 'Custom Test',
      examDate: m.exam?.date ? m.exam.date.toISOString().split('T')[0] : 'N/A',
      subjectName: m.subject?.name || 'Unknown Subject',
      subjectCode: m.subject?.code || '',
      marksObtained: m.marksObtained,
      totalMarks: m.totalMarks,
      remarks: m.remarks || '',
    }));

    return NextResponse.json({ success: true, marks: formatted });
  } catch (error: any) {
    console.error('Fetch student marks error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
