import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md text-center">
        <h1 className="text-9xl font-black text-red-500">403</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white">
          Access Denied
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          You do not have permission to access this resource. Please make sure you are logged in with the correct credentials.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            Login Page
          </Link>
        </div>
      </div>
    </div>
  );
}
