import Link from 'next/link';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Log in</h1>
        <p className="mt-1 text-sm text-slate-500">Peer Tutoring &amp; Study Group Matcher</p>
        <LoginForm />
        <p className="mt-4 text-sm text-slate-600">
          No account?{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
