import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Timetable } from '@/models/Timetable';
import { Subject } from '@/models/Subject'; // Make sure schema registered
import { User } from '@/models/User';       // Make sure schema registered
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Auth Check
    const session = await getSession();
    if (!session || (session.role !== 'super_admin' && session.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const sectionId = searchParams.get('sectionId');

    if (!classId || !sectionId) {
      return NextResponse.json({ success: false, error: 'Class ID and Section ID are required' }, { status: 400 });
    }

    const timetableRecords = await Timetable.find({
      class: classId,
      section: sectionId,
    }).populate({
      path: 'periods.subject',
      model: 'Subject'
    }).populate({
      path: 'periods.teacher',
      model: 'User',
      select: 'name email'
    });

    // Format week
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
          subjectId: p.subject?._id?.toString() || null,
          subjectName: p.subject?.name || '',
          teacherId: p.teacher?._id?.toString() || null,
          teacherName: p.teacher?.name || '',
          startTime: p.startTime,
          endTime: p.endTime,
          roomNumber: p.roomNumber || '',
        }));
      }
    });

    return NextResponse.json({ success: true, timetable: formatted });
  } catch (error: any) {
    console.error('Fetch timetable error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    // Auth Check
    const session = await getSession();
    if (!session || (session.role !== 'super_admin' && session.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { classId, sectionId, timetable } = body; // timetable object: { Monday: [periods], Tuesday: [periods], ... }

    if (!classId || !sectionId || !timetable) {
      return NextResponse.json({ success: false, error: 'Missing classId, sectionId, or timetable data' }, { status: 400 });
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const day of days) {
      const periodsInput = timetable[day] || [];
      const periodsFormatted = periodsInput.map((p: any) => ({
        isBreak: p.isBreak || false,
        breakTitle: p.isBreak ? (p.breakTitle || 'Break') : undefined,
        subject: p.isBreak ? undefined : (p.subjectId || undefined),
        teacher: p.isBreak ? undefined : (p.teacherId || undefined),
        startTime: p.startTime,
        endTime: p.endTime,
        roomNumber: p.roomNumber || '',
      }));

      // Find and update or create
      await Timetable.findOneAndUpdate(
        { class: classId, section: sectionId, day },
        { class: classId, section: sectionId, day, periods: periodsFormatted },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    return NextResponse.json({ success: true, message: 'Timetable updated successfully' });
  } catch (error: any) {
    console.error('Save timetable error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
