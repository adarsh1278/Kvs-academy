import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Section } from '@/models/Section';

export async function PATCH(request: Request, { params }: { params: Promise<{ sectionId: string }> }) {
  try {
    const { sectionId } = await params;
    await connectToDatabase();
    const body = await request.json();
    const { teacherId } = body;

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { classTeacher: teacherId || null },
      { new: true }
    ).populate('classTeacher', 'name email');

    if (!section) {
      return NextResponse.json({ success: false, error: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, section });
  } catch (error: any) {
    console.error('Section update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
