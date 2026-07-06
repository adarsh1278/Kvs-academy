import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email, identifier, password } = await request.json();
    const loginId = (identifier || email || '').toString().trim();

    if (!loginId || !password) {
      return NextResponse.json({ success: false, error: 'Please enter all fields' }, { status: 400 });
    }

    const normalizedEmail = loginId.toLowerCase();

    const user = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: loginId }],
    });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Your account is inactive' }, { status: 403 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // Sign Token
    const token = await signToken({
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        permissions: user.permissions || [],
      },
    });

    // Set HTTP-Only Cookie
    response.cookies.set({
      name: 'session_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
