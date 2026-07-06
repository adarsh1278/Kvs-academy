import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Student } from '@/models/Student';
import { User } from '@/models/User';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId') || '';

    if (!sectionId) {
      return NextResponse.json({ success: false, error: 'sectionId query parameter is required' }, { status: 400 });
    }

    const students = await Student.find({ section: sectionId })
      .populate('user', '-password')
      .sort({ rollNo: 1 });

    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    console.error('Section students fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
