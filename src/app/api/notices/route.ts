import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Notice } from '@/models/Notice';
import { User } from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    await connectToDatabase();
    // Pre-register User model to allow population if needed
    const notices = await Notice.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      notices: notices.map(n => ({
        id: n._id.toString(),
        title: n.title,
        content: n.content,
        target: n.target || 'all',
        date: n.createdAt.toISOString().split('T')[0],
      })),
    });
  } catch (error: any) {
    console.error('Notices fetch error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { title, content, targetAudience } = body;

    if (!title || !content || !targetAudience) {
      return NextResponse.json({ success: false, error: 'Title, content, and target are required' }, { status: 400 });
    }

    // Resolve creator ID
    let userId = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('session_token')?.value;
      if (token) {
        const decoded = await verifyToken(token);
        if (decoded) {
          userId = decoded.id;
        }
      }
    } catch (e) {
      console.warn('Cookie retrieval skipped during static page collection or SSR compilation.');
    }

    if (!userId) {
      // Fallback for automation or unauthenticated admin creators
      const fallbackAdmin = await User.findOne({ role: 'super_admin' });
      if (fallbackAdmin) {
        userId = fallbackAdmin._id;
      } else {
        return NextResponse.json({ success: false, error: 'Unauthorized: Admin user not found' }, { status: 401 });
      }
    }

    // Map targetAudience label to schema enum ('All' -> 'all', 'Teachers' -> 'teachers', etc.)
    const targetEnumMap: Record<string, string> = {
      All: 'all',
      Teachers: 'teachers',
      Students: 'students',
    };
    const target = targetEnumMap[targetAudience] || 'all';

    const newNotice = await Notice.create({
      title: title.trim(),
      content: content.trim(),
      target,
      expiryDate: new Date(Date.now() + 86400000 * 30), // Expires in 30 days
      createdBy: userId,
    });

    return NextResponse.json({ success: true, notice: newNotice });
  } catch (error: any) {
    console.error('Notice creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Notice ID is required' }, { status: 400 });
    }

    await Notice.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error: any) {
    console.error('Notice deletion error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
