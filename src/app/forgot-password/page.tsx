import Link from 'next/link';
import { School, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-md">
        <School className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          For security reasons, password resets at Excellence Academy are managed centrally.
        </p>
        <div className="mt-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-4 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
          Please contact your class teacher, department head, or the reception desk to have your credentials reset.
        </div>
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
