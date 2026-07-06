import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { User } from '@/models/User';
import { Student } from '@/models/Student';
import { Teacher } from '@/models/Teacher';

async function getAuthorizedSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded || decoded.role !== 'super_admin') return null;
  return decoded;
}

function sanitizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const requester = await getAuthorizedSuperAdmin();
    if (!requester) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const [studentProfile, teacherProfile] = await Promise.all([
        Student.findOne({ user: user._id }).populate('class').populate('section'),
        Teacher.findOne({ user: user._id }).populate('subjects').populate('assignedClasses'),
      ]);

      return NextResponse.json({
        success: true,
        user,
        studentProfile,
        teacherProfile,
      });
    }

    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(5, Number(searchParams.get('limit') || '10')));
    const q = sanitizeString(searchParams.get('q') || '');
    const role = sanitizeString(searchParams.get('role') || '');

    const query: Record<string, unknown> = {};
    if (role) {
      query.role = role;
    }
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    console.error('Users GET error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const requester = await getAuthorizedSuperAdmin();
    if (!requester) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const name = sanitizeString(body.name);
    const email = sanitizeString(body.email).toLowerCase();
    const phone = sanitizeString(body.phone);
    const role = sanitizeString(body.role);
    const status = sanitizeString(body.status) || 'active';
    const rawPassword = sanitizeString(body.password) || 'Admin@123';

    if (!name || !email || !role) {
      return NextResponse.json({ success: false, error: 'name, email, role are required' }, { status: 400 });
    }

    const duplicate = await User.findOne({
      $or: [{ email }, ...(phone ? [{ phone }] : [])],
    });
    if (duplicate) {
      return NextResponse.json({ success: false, error: 'Email or phone already in use' }, { status: 400 });
    }

    const password = await hashPassword(rawPassword);
    const user = await User.create({
      name,
      email,
      phone: phone || undefined,
      password,
      role,
      status,
      permissions: Array.isArray(body.permissions) ? body.permissions : [],
      designation: sanitizeString(body.designation) || undefined,
      department: sanitizeString(body.department) || undefined,
    });

    return NextResponse.json({ success: true, user: { ...user.toObject(), password: undefined } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    console.error('Users POST error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();

    const requester = await getAuthorizedSuperAdmin();
    if (!requester) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const userId = sanitizeString(body.userId);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const nextEmail = sanitizeString(body.email).toLowerCase() || targetUser.email;
    const nextPhone = sanitizeString(body.phone);

    const duplicate = await User.findOne({
      _id: { $ne: targetUser._id },
      $or: [{ email: nextEmail }, ...(nextPhone ? [{ phone: nextPhone }] : [])],
    });
    if (duplicate) {
      return NextResponse.json({ success: false, error: 'Email or phone already in use' }, { status: 400 });
    }

    targetUser.name = sanitizeString(body.name) || targetUser.name;
    targetUser.email = nextEmail;
    targetUser.phone = nextPhone || undefined;

    if (body.role) targetUser.role = sanitizeString(body.role);
    if (body.status) targetUser.status = sanitizeString(body.status);
    if (body.designation !== undefined) targetUser.designation = sanitizeString(body.designation) || undefined;
    if (body.department !== undefined) targetUser.department = sanitizeString(body.department) || undefined;
    if (Array.isArray(body.permissions)) targetUser.permissions = body.permissions;

    if (body.newPassword) {
      targetUser.password = await hashPassword(sanitizeString(body.newPassword));
    }

    const photographBase64 = sanitizeString(body.photographBase64);
    if (photographBase64) {
      const upload = await uploadImage(photographBase64, 'school-admissions/photos');
      targetUser.profileImage = upload.secure_url;
    }

    await targetUser.save();

    if (targetUser.role === 'student') {
      const student = await Student.findOne({ user: targetUser._id });
      if (student) {
        if (body.parentName !== undefined) student.parentName = sanitizeString(body.parentName);
        if (body.parentPhone !== undefined) student.parentPhone = sanitizeString(body.parentPhone);
        if (body.parentEmail !== undefined) student.parentEmail = sanitizeString(body.parentEmail);
        if (body.emergencyContact !== undefined) {
          student.emergencyContact = sanitizeString(body.emergencyContact);
        }
        if (body.address !== undefined) student.address = sanitizeString(body.address);
        if (photographBase64) {
          student.profileImage = targetUser.profileImage;
        }
        await student.save();
      }
    }

    if (targetUser.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: targetUser._id });
      if (teacher) {
        if (body.qualification !== undefined) teacher.qualification = sanitizeString(body.qualification);
        if (body.experience !== undefined) teacher.experience = sanitizeString(body.experience);
        if (body.salary !== undefined && Number.isFinite(Number(body.salary))) {
          teacher.salary = Number(body.salary);
        }
        if (photographBase64) {
          teacher.profileImage = targetUser.profileImage;
        }
        await teacher.save();
      }
    }

    return NextResponse.json({ success: true, message: 'User profile updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    console.error('Users PATCH error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
