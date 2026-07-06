import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Student } from '@/models/Student';
import { StudentFee } from '@/models/Fee';
import { Attendance } from '@/models/Attendance';
import { Class } from '@/models/Class';
import { Section } from '@/models/Section';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    
    // 1. Fetch Student Core Data
    const student = await Student.findById(id)
      .populate('user')
      .populate('class')
      .populate('section');
      
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    // 2. Fetch Fee Ledger
    const feeRecord = await StudentFee.findOne({ student: student._id });

    // 3. Fetch Attendance Overview
    // Find all attendance records where this student is present in the records array
    const attendanceRecords = await Attendance.find({
      'records.student': student._id
    }).sort({ date: -1 }).limit(30); // Last 30 days

    let presentDays = 0;
    let absentDays = 0;
    
    const attendanceHistory = attendanceRecords.map(doc => {
      const record = doc.records.find((r: any) => r.student.toString() === student._id.toString());
      if (record?.status === 'Present') presentDays++;
      if (record?.status === 'Absent') absentDays++;
      
      return {
        date: doc.date,
        status: record?.status || 'Unknown'
      };
    });

    const totalDays = presentDays + absentDays;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return NextResponse.json({
      success: true,
      student: {
        id: student._id.toString(),
        admissionNo: student.admissionNo,
        rollNo: student.rollNo,
        name: student.user?.name || 'Student',
        email: student.user?.email || 'N/A',
        className: `${student.class?.name || 'Class'} - ${student.section?.name || 'Section'}`,
        classId: student.class?._id?.toString(),
        sectionId: student.section?._id?.toString(),
        parentName: student.parentName,
        parentEmail: student.parentEmail || 'N/A',
        parentPhone: student.parentPhone,
        emergencyContact: student.emergencyContact || 'N/A',
        address: student.address || 'N/A',
        gender: student.gender || 'N/A',
        dob: student.dob ? student.dob.toISOString().split('T')[0] : 'N/A',
        aadhaarNo: student.aadhaarNo || 'N/A',
        transportDetails: student.transportDetails || 'N/A',
        hostelDetails: student.hostelDetails || 'N/A',
        profileImage: student.profileImage || '',
        status: student.user?.status === 'active' ? 'Active' : 'Inactive',
      },
      fees: feeRecord || null,
      attendance: {
        presentDays,
        absentDays,
        totalDays,
        attendancePercentage,
        history: attendanceHistory
      }
    });
  } catch (error: any) {
    console.error('Student detail fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
