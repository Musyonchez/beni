'use server';

import { revalidatePath } from 'next/cache';
import { db, save, nextId, type SessionStatus } from '@/lib/db';
import { verifySession } from '@/lib/dal';
import { BookSessionSchema, FeedbackSchema } from '@/lib/validation';
import { redirectWithError, redirectWithSuccess } from '@/lib/action-helpers';

export async function bookSessionAction(formData: FormData): Promise<void> {
  const session = await verifySession();
  const parsed = BookSessionSchema.safeParse({
    tutorId: formData.get('tutorId'),
    courseId: formData.get('courseId'),
    scheduledTime: formData.get('scheduledTime'),
    helpRequestId: formData.get('helpRequestId') || undefined,
  });
  if (!parsed.success) {
    redirectWithError('/dashboard', parsed.error.issues[0]?.message ?? 'Invalid input.');
  }
  const { tutorId, courseId, scheduledTime, helpRequestId } = parsed.data;

  if (tutorId === session.userId) {
    redirectWithError('/dashboard', "You can't book a session with yourself.");
  }
  const course = db.courses.find((c) => c.id === courseId);
  if (!course) {
    redirectWithError('/dashboard', 'Unknown course.');
  }
  const tutorProfile = db.tutorProfiles.find((p) => p.userId === tutorId && p.courseId === courseId);
  if (!tutorProfile) {
    redirectWithError('/dashboard', 'That tutor does not teach this course.');
  }

  const newSession = {
    id: nextId('sessions'),
    tutorId,
    tuteeId: session.userId,
    courseId,
    helpRequestId: helpRequestId ?? null,
    scheduledTime: new Date(scheduledTime).toISOString(),
    status: 'pending' as SessionStatus,
    createdAt: new Date().toISOString(),
  };
  db.sessions.push(newSession);

  if (newSession.helpRequestId) {
    const request = db.helpRequests.find(
      (r) => r.id === newSession.helpRequestId && r.tuteeId === session.userId
    );
    if (request) request.status = 'matched';
  }
  save();
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/sessions');
  redirectWithSuccess('/dashboard/sessions', 'Session booked.');
}

const ALLOWED_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export async function updateSessionStatusAction(formData: FormData): Promise<void> {
  const session = await verifySession();
  const sessionId = Number(formData.get('sessionId'));
  const nextStatus = formData.get('status') as SessionStatus;

  const target = db.sessions.find((s) => s.id === sessionId);
  if (!target) {
    redirectWithError('/dashboard/sessions', 'Session not found.');
  }
  if (target.tutorId !== session.userId && target.tuteeId !== session.userId) {
    redirectWithError('/dashboard/sessions', 'You are not part of this session.');
  }
  const allowedNext = ALLOWED_TRANSITIONS[target.status] ?? [];
  if (!allowedNext.includes(nextStatus)) {
    redirectWithError('/dashboard/sessions', `Cannot move a ${target.status} session to ${nextStatus}.`);
  }
  target.status = nextStatus;
  save();
  revalidatePath('/dashboard/sessions');
  redirectWithSuccess('/dashboard/sessions', `Session ${nextStatus}.`);
}

export async function submitFeedbackAction(formData: FormData): Promise<void> {
  const session = await verifySession();
  const sessionId = Number(formData.get('sessionId'));
  const parsed = FeedbackSchema.safeParse({
    rating: formData.get('rating'),
    comment: formData.get('comment'),
  });
  if (!parsed.success) {
    redirectWithError('/dashboard/sessions', parsed.error.issues[0]?.message ?? 'Invalid input.');
  }

  const target = db.sessions.find((s) => s.id === sessionId);
  if (!target) {
    redirectWithError('/dashboard/sessions', 'Session not found.');
  }
  if (target.tuteeId !== session.userId) {
    redirectWithError('/dashboard/sessions', 'Only the tutee can leave feedback.');
  }
  if (target.status !== 'completed') {
    redirectWithError('/dashboard/sessions', 'Session is not completed yet.');
  }
  if (db.feedback.find((f) => f.sessionId === target.id)) {
    redirectWithError('/dashboard/sessions', 'Feedback already submitted for this session.');
  }

  db.feedback.push({
    id: nextId('feedback'),
    sessionId: target.id,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    createdAt: new Date().toISOString(),
  });
  save();
  revalidatePath('/dashboard/sessions');
  redirectWithSuccess('/dashboard/sessions', 'Feedback submitted.');
}
