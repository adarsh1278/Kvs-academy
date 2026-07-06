import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Exam } from '@/models/Exam';
import { getSession } from '@/lib/auth';
import { Teacher } from '@/models/Teacher';
import { Student } from '@/models/Student';
import { Class } from '@/models/Class';
import { Section } from '@/models/Section';
import { Subject } from '@/models/Subject';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');
    const classId = searchParams.get('classId');

    let query: any = {};

    if (session.role === 'student') {
      const student = await Student.findOne({ user: session.id });
      if (!student) {
        return NextResponse.json({ success: false, error: 'Student profile not found' }, { status: 404 });
      }
      query.class = student.class;
      query.section = student.section;
    } else if (session.role === 'teacher') {
      // Teachers can filter by classId and sectionId
      if (classId) query.class = classId;
      if (sectionId) query.section = sectionId;
    } else if (session.role === 'super_admin' || session.role === 'admin') {
      if (classId) query.class = classId;
      if (sectionId) query.section = sectionId;
    } else {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const exams = await Exam.find(query)
      .populate('class', 'name')
      .populate('section', 'name')
      .populate('subject', 'name code')
      .sort({ date: -1 });

    return NextResponse.json({ success: true, exams });
  } catch (error: any) {
    console.error('Fetch exams error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only teachers or admins can create exams
    if (session.role !== 'teacher' && session.role !== 'admin' && session.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, type, classId, sectionId, subjectId, date } = body;

    if (!title || !type || !classId || !sectionId || !date) {
      return NextResponse.json({ success: false, error: 'Please enter all required fields' }, { status: 400 });
    }

    if (type === 'Custom Test' && !subjectId) {
      return NextResponse.json({ success: false, error: 'Subject is required for Custom Tests' }, { status: 400 });
    }

    const newExam = await Exam.create({
      title,
      type,
      class: classId,
      section: sectionId,
      subject: type === 'Custom Test' ? subjectId : undefined,
      date: new Date(date),
      createdBy: session.id,
    });

    const populatedExam = await Exam.findById(newExam._id)
      .populate('class', 'name')
      .populate('section', 'name')
      .populate('subject', 'name code');

    return NextResponse.json({ success: true, exam: populatedExam });
  } catch (error: any) {
    console.error('Create exam error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
