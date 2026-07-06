import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Student } from '@/models/Student';

export async function GET() {
  try {
    await connectToDatabase();
    const students = await Student.find({})
      .populate('user')
      .populate('class')
      .populate('section')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      students: students.map(s => ({
        id: s._id.toString(),
        admissionNo: s.admissionNo,
        rollNo: s.rollNo,
        name: s.user?.name || 'Student',
        email: s.user?.email || 'N/A',
        className: `${s.class?.name || 'Class'} - ${s.section?.name || 'Section'}`,
        parentName: s.parentName,
        phone: s.parentPhone,
        status: s.user?.status === 'active' ? 'Active' : 'Inactive',
        dob: s.dob ? s.dob.toISOString().split('T')[0] : 'N/A',
        gender: s.gender || 'N/A',
        parentEmail: s.parentEmail || 'N/A',
        emergencyContact: s.emergencyContact || 'N/A',
        address: s.address || 'N/A',
        aadhaarNo: s.aadhaarNo || 'N/A',
        profileImage: s.profileImage || '',
        transportDetails: s.transportDetails || 'N/A',
        hostelDetails: s.hostelDetails || 'N/A',
      })),
    });
  } catch (error: any) {
    console.error('Students fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
