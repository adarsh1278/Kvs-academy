import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
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
  try {
    await connectToDatabase();
    dbUser = await User.findById(decoded.id).select('-password');
  } catch (error) {
    console.error('Failed to query user profile for layout', error);
  }

  const user = {
    id: decoded.id,
    name: dbUser?.name || decoded.name || 'User Profile',
    email: dbUser?.email || decoded.email || '',
    role: dbUser?.role || decoded.role || 'student',
    permissions: dbUser?.permissions || [],
    profileImage: dbUser?.profileImage || '',
    isStale: !dbUser,
  };

  return (
    <DashboardLayoutClient user={user}>
      {children}
    </DashboardLayoutClient>
  );
}
