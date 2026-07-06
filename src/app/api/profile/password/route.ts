import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/db';
import { verifyToken, comparePassword, hashPassword } from '@/lib/auth';
import { User } from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const oldPassword = String(body.oldPassword || '');
    const newPassword = String(body.newPassword || '');

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Please provide a valid old/new password' }, { status: 400 });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update password';
    console.error('Profile password change error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
