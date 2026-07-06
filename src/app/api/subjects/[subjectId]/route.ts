import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Subject } from '@/models/Subject';

export async function PATCH(request: Request, { params }: { params: Promise<{ subjectId: string }> }) {
  try {
    const { subjectId } = await params;
    await connectToDatabase();
    const body = await request.json();
    const { teacherId } = body;

    const subject = await Subject.findByIdAndUpdate(
      subjectId,
      { subjectTeacher: teacherId || null },
      { new: true }
    ).populate('subjectTeacher', 'name email');

    if (!subject) {
      return NextResponse.json({ success: false, error: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, subject });
  } catch (error: any) {
    console.error('Subject update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
