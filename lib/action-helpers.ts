import { redirect } from 'next/navigation';

// Small helper so Server Actions can surface a validation/authorization
// error to the page they submitted from, via a `?error=` search param that
// the page reads and renders (see components/banner.tsx). Keeps most forms
// as plain <form action={...}> without needing a 'use client' + useActionState
// wrapper for every single mutation.

export function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export function redirectWithSuccess(path: string, message: string): never {
  redirect(`${path}?success=${encodeURIComponent(message)}`);
}
