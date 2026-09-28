import Link from 'next/link';
import { RegisterForm } from './register-form';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Register</h1>
        <p className="mt-1 text-sm text-slate-500">Peer Tutoring &amp; Study Group Matcher</p>
        <RegisterForm />
        <p className="mt-3 text-xs text-slate-500">The first account created becomes the admin.</p>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
