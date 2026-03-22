'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { prisma } from './db';

export async function loginAction(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user || user.password !== password) {
    throw new Error("Credenciales inválidas");
  }

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

export async function updatePasswordAction(newPassword: string) {
  // In a real app, hash the password here
  const user = await prisma.user.findFirst(); // Using the first user for now
  if (!user) throw new Error("Usuario no encontrado");

  await prisma.user.update({
    where: { id: user.id },
    data: { password: newPassword }
  });

  return { success: true };
}
