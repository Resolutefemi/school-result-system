'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

const SESSION_COOKIE = 'school_session';
const SESSION_TYPE_COOKIE = 'school_session_type';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  type: 'admin' | 'teacher';
  schoolId: string;
}

/**
 * Create a session for a user
 */
export async function createSession(user: SessionUser) {
  const cookieStore = await cookies();
  const sessionData = JSON.stringify(user);
  const sessionToken = Buffer.from(sessionData).toString('base64');

  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  cookieStore.set(SESSION_TYPE_COOKIE, user.type, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
}

/**
 * Get current session user
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) return null;

  try {
    const sessionData = Buffer.from(sessionToken, 'base64').toString('utf-8');
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

/**
 * Clear session (logout)
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(SESSION_TYPE_COOKIE);
}

/**
 * Authenticate admin login
 */
export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return { success: false, error: 'Invalid email or password' };

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) return { success: false, error: 'Invalid email or password' };

    await createSession({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      type: 'admin',
      schoolId: admin.schoolId,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

/**
 * Authenticate teacher login
 * Checks if teacher is approved before allowing login
 */
export async function loginTeacher(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const teacher = await prisma.teacher.findUnique({ where: { email } });
    if (!teacher) return { success: false, error: 'Invalid email or password' };

    const isValid = await bcrypt.compare(password, teacher.password);
    if (!isValid) return { success: false, error: 'Invalid email or password' };

    // Check if teacher is approved
    if (!teacher.approved) {
      return { success: false, error: 'Your account is pending admin approval. Please try again later.' };
    }

    await createSession({
      id: teacher.id,
      email: teacher.email,
      name: teacher.name,
      type: 'teacher',
      schoolId: teacher.schoolId,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

/**
 * Require auth - redirects to login if not authenticated
 */
export async function requireAuth(allowedTypes: ('admin' | 'teacher')[] = ['admin', 'teacher']): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (!allowedTypes.includes(session.type)) {
    redirect('/');
  }

  return session;
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
