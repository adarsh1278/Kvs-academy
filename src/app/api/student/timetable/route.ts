import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Timetable } from '@/models/Timetable';
import { Student } from '@/models/Student';
import { Subject } from '@/models/Subject';
import { User } from '@/models/User';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();

    const session = await getSession();
    if (!session || session.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const student = await Student.findOne({ user: session.id });
    if (!student || !student.class || !student.section) {
      return NextResponse.json({ success: false, error: 'Student details or class assignment not found' }, { status: 404 });
    }

    const timetableRecords = await Timetable.find({
      class: student.class,
      section: student.section,
    }).populate({
      path: 'periods.subject',
      model: 'Subject'
    }).populate({
      path: 'periods.teacher',
      model: 'User',
      select: 'name email'
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formatted: Record<string, any[]> = {};
    days.forEach(d => {
      formatted[d] = [];
    });

    timetableRecords.forEach(record => {
      if (days.includes(record.day)) {
        formatted[record.day] = record.periods.map((p: any) => ({
          id: p._id?.toString(),
          isBreak: p.isBreak || false,
          breakTitle: p.breakTitle || '',
          subjectName: p.subject?.name || '',
          teacherName: p.teacher?.name || '',
          startTime: p.startTime,
          endTime: p.endTime,
          roomNumber: p.roomNumber || '',
        }));
      }
    });

    return NextResponse.json({ success: true, timetable: formatted });
  } catch (error: any) {
    console.error('Fetch student timetable error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
