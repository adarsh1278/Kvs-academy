import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword, comparePassword, verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

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
      return NextResponse.json({ success: false, error: 'Unauthorized or token expired' }, { status: 401 });
    }

    const { userId, oldPassword, newPassword, isAdminReset } = await request.json();

    if (isAdminReset) {
      // Admin override: check if the requester is indeed admin/super_admin
      if (!['super_admin', 'admin'].includes(decoded.role)) {
        return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });
      }

      if (!userId || !newPassword) {
        return NextResponse.json({ success: false, error: 'Missing userId or newPassword' }, { status: 400 });
      }

      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 444 });
      }

      // Check hierarchy: Admin cannot reset Super Admin
      if (decoded.role === 'admin' && targetUser.role === 'super_admin') {
        return NextResponse.json({ success: false, error: 'Permission denied: Admin cannot reset Super Admin' }, { status: 403 });
      }

      const hashed = await hashPassword(newPassword);
      targetUser.password = hashed;
      await targetUser.save();

      return NextResponse.json({ success: true, message: `Password for ${targetUser.name} reset successfully` });
    } else {
      // Self-reset
      if (!oldPassword || !newPassword) {
        return NextResponse.json({ success: false, error: 'Please enter old and new passwords' }, { status: 400 });
      }

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const isMatch = await comparePassword(oldPassword, currentUser.password);
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Incorrect current password' }, { status: 400 });
      }

      const hashed = await hashPassword(newPassword);
      currentUser.password = hashed;
      await currentUser.save();

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }
  } catch (error: any) {
    console.error('Password Reset Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
