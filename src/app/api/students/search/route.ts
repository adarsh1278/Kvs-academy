import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Student } from '@/models/Student';
import { User } from '@/models/User';
import { StudentFee } from '@/models/Fee';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json({ success: true, students: [] });
    }

    // Find users with role 'student' matching the name or email query
    const matchingUsers = await User.find({
      role: 'student',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    }).select('_id');

    const userIds = matchingUsers.map((u) => u._id);

    // Find student profiles matching userIds, roll number, or admission number
    const studentProfiles = await Student.find({
      $or: [
        { user: { $in: userIds } },
        { admissionNo: { $regex: query, $options: 'i' } },
        { rollNo: { $regex: query, $options: 'i' } },
      ],
    })
      .populate('user', '-password')
      .populate('class')
      .populate('section');

    // Attach student fee ledger
    const studentsWithFees = [];
    for (const profile of studentProfiles) {
      const feeLedger = await StudentFee.findOne({ student: profile._id }).populate({
        path: 'feeStructure',
      });
      studentsWithFees.push({
        profile,
        feeLedger,
      });
    }

    return NextResponse.json({ success: true, students: studentsWithFees });
  } catch (error: any) {
    console.error('Student search error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
