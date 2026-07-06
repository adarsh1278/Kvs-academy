import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Attendance } from '@/models/Attendance';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Session not found' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !['super_admin', 'admin', 'teacher'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const { classId, sectionId, date, records } = body;

    if (!classId || !sectionId || !date || !records || !Array.isArray(records)) {
      return NextResponse.json({ success: false, error: 'Missing required attendance fields' }, { status: 400 });
    }

    // Normalize date to UTC midnight to avoid timezone offsets causing duplicates
    const rawDate = new Date(date);
    const normalizedDate = new Date(Date.UTC(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate()));

    const attendanceRecords = records.map((rec: any) => ({
      student: rec.student,
      status: rec.status,
      remarks: rec.remarks || '',
    }));

    // Find and update if exists (allows correction), otherwise create
    const attendance = await Attendance.findOneAndUpdate(
      { date: normalizedDate, class: classId, section: sectionId },
      {
        date: normalizedDate,
        class: classId,
        section: sectionId,
        records: attendanceRecords,
        markedBy: decoded.id,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Attendance saved successfully',
      attendance,
    });
  } catch (error: any) {
    console.error('Attendance Save Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
