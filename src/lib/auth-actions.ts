'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction() {
  const cookieStore = await cookies();
  cookieStore.set('auth-session', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  
  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-session');
  redirect('/login');
}
