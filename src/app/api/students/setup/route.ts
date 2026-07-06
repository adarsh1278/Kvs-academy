import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { User } from '@/models/User';
import { Student } from '@/models/Student';

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

async function getCurrentStudent() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded || decoded.role !== 'student') return null;

  const user = await User.findById(decoded.id);
  if (!user) return null;

  const student = await Student.findOne({ user: decoded.id });
  if (!student) return null;

  return { decoded, user, student };
}

export async function GET() {
  try {
    await connectToDatabase();
    const ctx = await getCurrentStudent();

    if (!ctx) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const missingPhone = !ctx.user.phone;
    const missingPhoto = !ctx.student.profileImage;

    return NextResponse.json({
      success: true,
      profile: {
        name: ctx.user.name,
        email: ctx.user.email,
        phone: ctx.user.phone || '',
        profileImage: ctx.student.profileImage || '',
        parentName: ctx.student.parentName || '',
        parentPhone: ctx.student.parentPhone || '',
        parentEmail: ctx.student.parentEmail || '',
        emergencyContact: ctx.student.emergencyContact || '',
      },
      isComplete: !missingPhone && !missingPhoto,
      missing: {
        phone: missingPhone,
        photo: missingPhoto,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load student setup data';
    console.error('Student setup GET error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const ctx = await getCurrentStudent();

    if (!ctx) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const nextPhone = asString(body.phone);
    if (nextPhone) {
      const duplicatePhone = await User.findOne({ _id: { $ne: ctx.user._id }, phone: nextPhone });
      if (duplicatePhone) {
        return NextResponse.json({ success: false, error: 'Phone number is already in use' }, { status: 400 });
      }
      ctx.user.phone = nextPhone;
    }

    const photographBase64 = asString(body.photographBase64);
    if (photographBase64) {
      const upload = await uploadImage(photographBase64, 'school-admissions/photos');
      ctx.student.profileImage = upload.secure_url;
      ctx.user.profileImage = upload.secure_url;
    }

    if (body.parentName !== undefined) ctx.student.parentName = asString(body.parentName);
    if (body.parentPhone !== undefined) ctx.student.parentPhone = asString(body.parentPhone);
    if (body.parentEmail !== undefined) ctx.student.parentEmail = asString(body.parentEmail);
    if (body.emergencyContact !== undefined) ctx.student.emergencyContact = asString(body.emergencyContact);

    await ctx.user.save();
    await ctx.student.save();

    return NextResponse.json({ success: true, message: 'Profile setup updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update student setup data';
    console.error('Student setup PATCH error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
