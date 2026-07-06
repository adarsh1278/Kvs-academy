import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Student } from '@/models/Student';
import { Teacher } from '@/models/Teacher';
import DashboardLayoutClient from '@/components/layout/DashboardLayoutClient';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    redirect('/login');
  }

  let dbUser = null;
  let profileImage = '';
  try {
    await connectToDatabase();
    dbUser = await User.findById(decoded.id).select('-password');
    if (dbUser) {
      if (dbUser.role === 'student') {
        const student = await Student.findOne({ user: dbUser._id });
        if (student) profileImage = student.profileImage || '';
      } else if (dbUser.role === 'teacher') {
        const teacher = await Teacher.findOne({ user: dbUser._id });
        if (teacher) profileImage = teacher.profileImage || '';
      }
    }
  } catch (error) {
    console.error('Failed to query user profile for layout', error);
  }

  const user = {
    id: decoded.id,
    name: dbUser?.name || decoded.name || 'User Profile',
    email: dbUser?.email || decoded.email || '',
    role: dbUser?.role || decoded.role || 'student',
    permissions: dbUser?.permissions || [],
    profileImage: profileImage,
    isStale: !dbUser,
  };

  return (
    <DashboardLayoutClient user={user}>
      {children}
    </DashboardLayoutClient>
  );
}
