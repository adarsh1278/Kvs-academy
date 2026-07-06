import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Class } from '@/models/Class';
import { Section } from '@/models/Section';
import { AcademicSession } from '@/models/AcademicSession';

export async function GET() {
  try {
    await connectToDatabase();
    
    const classes = await Class.find({}).sort({ name: 1 });
    const sections = await Section.find({}).populate('class').sort({ name: 1 });

    return NextResponse.json({
      success: true,
      classes: classes.map(c => ({
        id: c._id.toString(),
        name: c.name,
      })),
      sections: sections.map(s => ({
        id: s._id.toString(),
        name: s.name,
        classId: s.class?._id?.toString() || '',
        className: s.class?.name || 'Unassigned',
        teacher: 'Unassigned',
      })),
    });
  } catch (error: any) {
    console.error('Classes fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { action, name, classId } = body;

    if (!action || !name) {
      return NextResponse.json({ success: false, error: 'Action and Name are required' }, { status: 400 });
    }

    // Resolve academic session ID
    let session = await AcademicSession.findOne({ isCurrent: true });
    if (!session) {
      session = await AcademicSession.findOne({});
    }
    if (!session) {
      session = await AcademicSession.create({
        name: '2026-27',
        isCurrent: true,
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
      });
    }

    if (action === 'createClass') {
      const existingClass = await Class.findOne({ name: name.trim(), academicSession: session._id });
      if (existingClass) {
        return NextResponse.json({ success: false, error: 'Class already exists' }, { status: 400 });
      }

      const newClass = await Class.create({
        name: name.trim(),
        academicSession: session._id,
      });

      return NextResponse.json({ success: true, class: newClass });
    }

    if (action === 'createSection') {
      if (!classId) {
        return NextResponse.json({ success: false, error: 'Class ID is required to create a section' }, { status: 400 });
      }

      const existingSection = await Section.findOne({ name: name.trim(), class: classId });
      if (existingSection) {
        return NextResponse.json({ success: false, error: 'Section already exists in this Class' }, { status: 400 });
      }

      const newSection = await Section.create({
        name: name.trim(),
        class: classId,
      });

      return NextResponse.json({ success: true, section: newSection });
    }

    return NextResponse.json({ success: false, error: 'Invalid action parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Class creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
