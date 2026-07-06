import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Mark } from '@/models/Mark';
import { Exam } from '@/models/Exam';
import { Student } from '@/models/Student';
import { getSession } from '@/lib/auth';
import { User } from '@/models/User';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const subjectId = searchParams.get('subjectId');

    if (!examId || !subjectId) {
      return NextResponse.json({ success: false, error: 'Exam ID and Subject ID are required' }, { status: 400 });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return NextResponse.json({ success: false, error: 'Exam not found' }, { status: 404 });
    }

    // Get all students in the exam's class and section
    const students = await Student.find({
      class: exam.class,
      section: exam.section,
    }).populate({
      path: 'user',
      model: 'User',
      select: 'name email'
    }).sort({ 'user.name': 1 });

    // Fetch existing marks for this exam and subject
    const existingMarks = await Mark.find({
      exam: examId,
      subject: subjectId,
    });

    const marksMap = new Map();
    existingMarks.forEach(m => {
      marksMap.set(m.student.toString(), {
        marksObtained: m.marksObtained,
        totalMarks: m.totalMarks,
        remarks: m.remarks || '',
      });
    });

    const results = students.map(s => {
      const studentIdStr = s._id.toString();
      const markEntry = marksMap.get(studentIdStr) || {
        marksObtained: '',
        totalMarks: '',
        remarks: '',
      };
      return {
        studentId: studentIdStr,
        rollNumber: s.rollNumber || 'N/A',
        name: s.user?.name || 'Student',
        email: s.user?.email || 'N/A',
        marksObtained: markEntry.marksObtained,
        totalMarks: markEntry.totalMarks,
        remarks: markEntry.remarks,
      };
    });

    return NextResponse.json({ success: true, marks: results });
  } catch (error: any) {
    console.error('Fetch marks error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session || (session.role !== 'teacher' && session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { examId, subjectId, marksList } = body; // marksList: [ { studentId, marksObtained, totalMarks, remarks }, ... ]

    if (!examId || !subjectId || !marksList || !Array.isArray(marksList)) {
      return NextResponse.json({ success: false, error: 'Missing required fields or invalid structure' }, { status: 400 });
    }

    for (const item of marksList) {
      const { studentId, marksObtained, totalMarks, remarks } = item;

      // If either marksObtained or totalMarks is empty or null, we skip or remove the record
      if (marksObtained === '' || totalMarks === '' || marksObtained === null || totalMarks === null) {
        await Mark.deleteOne({
          exam: examId,
          student: studentId,
          subject: subjectId,
        });
        continue;
      }

      await Mark.findOneAndUpdate(
        {
          exam: examId,
          student: studentId,
          subject: subjectId,
        },
        {
          exam: examId,
          student: studentId,
          subject: subjectId,
          marksObtained: Number(marksObtained),
          totalMarks: Number(totalMarks),
          remarks: remarks || '',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    return NextResponse.json({ success: true, message: 'Marks saved successfully' });
  } catch (error: any) {
    console.error('Save marks error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
