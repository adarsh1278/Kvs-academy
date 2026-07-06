import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    redirect('/login');
  }

  // Redirect based on role
  if (decoded.role === 'super_admin') redirect('/dashboard/super-admin');
  if (decoded.role === 'admin') redirect('/dashboard/admin');
  if (decoded.role === 'receptionist') redirect('/dashboard/receptionist');
  if (decoded.role === 'teacher') redirect('/dashboard/teacher');
  if (decoded.role === 'student') redirect('/dashboard/student');

  redirect('/login');
}
