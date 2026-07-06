import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Subject } from '@/models/Subject';
import { Class } from '@/models/Class';

export async function GET() {
  try {
    await connectToDatabase();
    // We register models to avoid missing schema errors
    const subjects = await Subject.find({}).populate('class').sort({ name: 1 });

    return NextResponse.json({
      success: true,
      subjects: subjects.map(s => ({
        id: s._id.toString(),
        name: s.name,
        code: s.code,
        type: s.type,
        className: s.class?.name || 'Unassigned',
      })),
    });
  } catch (error: any) {
    console.error('Subjects fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, code, type, className } = body; // className here can correspond to class ID or name string

    if (!name || !code || !type) {
      return NextResponse.json({ success: false, error: 'Name, code, and type are required' }, { status: 400 });
    }

    // Find class matching name
    const classObj = await Class.findOne({ name: className });
    if (!classObj) {
      return NextResponse.json({ success: false, error: 'Target Class does not exist' }, { status: 400 });
    }

    const existingSubject = await Subject.findOne({ code: code.trim().toUpperCase() });
    if (existingSubject) {
      return NextResponse.json({ success: false, error: 'Subject with this code already exists' }, { status: 400 });
    }

    const newSubject = await Subject.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      class: classObj._id,
    });

    return NextResponse.json({ success: true, subject: newSubject });
  } catch (error: any) {
    console.error('Subject creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
