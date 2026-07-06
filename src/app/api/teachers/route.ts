import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Teacher } from '@/models/Teacher';
import { User } from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { sendCredentialsEmail } from '@/lib/mailer';

export async function GET() {
  try {
    await connectToDatabase();
    const teachers = await Teacher.find({}).populate('user').sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      teachers: teachers.map(t => ({
        id: t._id.toString(),
        teacherId: t.teacherId,
        name: t.user?.name || 'Instructor',
        email: t.user?.email || 'N/A',
        qualification: t.qualification,
        experience: t.experience,
        salary: t.salary,
        status: t.employmentStatus,
        phone: t.user?.phone || 'N/A',
        profileImage: t.profileImage || '',
        joiningDate: t.joiningDate ? t.joiningDate.toISOString().split('T')[0] : 'N/A',
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch teachers';
    console.error('Teachers fetch error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, phone, qualification, experience, salary } = body;

    if (!name || !email || !qualification || !experience || !salary) {
      return NextResponse.json({ success: false, error: 'Please enter all required fields' }, { status: 400 });
    }

    const trimmedPhone = phone ? String(phone).trim() : '';

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, ...(trimmedPhone ? [{ phone: trimmedPhone }] : [])],
    });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'User with this email or phone already exists' }, { status: 400 });
    }

    const generatedPassword = 'Admin@123';
    const defaultPass = await hashPassword(generatedPassword);

    // Create User record
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: trimmedPhone || undefined,
      password: defaultPass,
      role: 'teacher',
      status: 'active',
    });

    const teacherId = `TCH-2026-${Math.floor(100 + Math.random() * 900)}`;

    // Create Teacher profile
    const teacher = await Teacher.create({
      user: user._id,
      teacherId,
      qualification,
      experience,
      salary: parseFloat(salary),
      employmentStatus: 'Active',
    });

    try {
      await sendCredentialsEmail(user.email, user.name, generatedPassword, user.role);
    } catch (mailError) {
      console.error('Teacher credentials email dispatch failed:', mailError);
    }

    return NextResponse.json({ success: true, teacher });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create teacher';
    console.error('Teacher profile creation error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
