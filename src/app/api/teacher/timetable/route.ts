import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Timetable } from '@/models/Timetable';
import { Class } from '@/models/Class';
import { Section } from '@/models/Section';
import { Subject } from '@/models/Subject';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();

    const session = await getSession();
    if (!session || session.role !== 'teacher') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Find timetable records containing periods assigned to this teacher User ID
    const timetableRecords = await Timetable.find({
      'periods.teacher': session.id
    })
    .populate('class')
    .populate('section')
    .populate({
      path: 'periods.subject',
      model: 'Subject'
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formatted: Record<string, any[]> = {};
    days.forEach(d => {
      formatted[d] = [];
    });

    timetableRecords.forEach(record => {
      if (days.includes(record.day)) {
        // Filter only the periods taught by this teacher
        const teacherPeriods = record.periods
          .filter((p: any) => p.teacher?.toString() === session.id)
          .map((p: any) => ({
            id: p._id?.toString(),
            isBreak: false,
            subjectName: p.subject?.name || '',
            className: `${record.class?.name || 'Class'}-${record.section?.name || 'Section'}`,
            startTime: p.startTime,
            endTime: p.endTime,
            roomNumber: p.roomNumber || '',
          }));

        formatted[record.day] = [...formatted[record.day], ...teacherPeriods];
      }
    });

    // Sort periods of each day by start time
    days.forEach(d => {
      formatted[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return NextResponse.json({ success: true, timetable: formatted });
  } catch (error: any) {
    console.error('Fetch teacher timetable error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
