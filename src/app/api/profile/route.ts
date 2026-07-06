import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { User } from '@/models/User';
import { Student } from '@/models/Student';
import { Teacher } from '@/models/Teacher';

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded) return null;

  const user = await User.findById(decoded.id);
  if (!user) return null;

  return user;
}

export async function GET() {
  try {
    await connectToDatabase();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [studentProfile, teacherProfile] = await Promise.all([
      Student.findOne({ user: user._id }).populate('class').populate('section'),
      Teacher.findOne({ user: user._id }).populate('subjects').populate('assignedClasses'),
    ]);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        designation: user.designation || '',
        department: user.department || '',
      },
      studentProfile,
      teacherProfile,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile';
    console.error('Profile GET error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const nextName = asString(body.name);
    const nextPhone = asString(body.phone);

    if (nextName) user.name = nextName;

    if (nextPhone) {
      const duplicate = await User.findOne({ _id: { $ne: user._id }, phone: nextPhone });
      if (duplicate) {
        return NextResponse.json({ success: false, error: 'Phone number already in use' }, { status: 400 });
      }
      user.phone = nextPhone;
    }

    if (body.designation !== undefined) user.designation = asString(body.designation) || undefined;
    if (body.department !== undefined) user.department = asString(body.department) || undefined;

    await user.save();

    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        if (body.parentName !== undefined) student.parentName = asString(body.parentName);
        if (body.parentPhone !== undefined) student.parentPhone = asString(body.parentPhone);
        if (body.parentEmail !== undefined) student.parentEmail = asString(body.parentEmail);
        if (body.emergencyContact !== undefined) student.emergencyContact = asString(body.emergencyContact);

        const photographBase64 = asString(body.photographBase64);
        if (photographBase64) {
          const upload = await uploadImage(photographBase64, 'school-admissions/photos');
          student.profileImage = upload.secure_url;
        }

        await student.save();
      }
    }

    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: user._id });
      if (teacher) {
        if (body.qualification !== undefined) teacher.qualification = asString(body.qualification);
        if (body.experience !== undefined) teacher.experience = asString(body.experience);

        const photographBase64 = asString(body.photographBase64);
        if (photographBase64) {
          const upload = await uploadImage(photographBase64, 'school-admissions/photos');
          teacher.profileImage = upload.secure_url;
        }

        await teacher.save();
      }
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
