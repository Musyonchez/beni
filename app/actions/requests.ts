'use server';

import { revalidatePath } from 'next/cache';
import { db, save, nextId } from '@/lib/db';
import { verifySession } from '@/lib/dal';
import { HelpRequestSchema } from '@/lib/validation';
import { redirectWithError, redirectWithSuccess } from '@/lib/action-helpers';

export async function createHelpRequestAction(formData: FormData): Promise<void> {
  const session = await verifySession();
  const parsed = HelpRequestSchema.safeParse({
    courseId: formData.get('courseId'),
    topic: formData.get('topic'),
    preferredTimes: formData.get('preferredTimes'),
  });
  if (!parsed.success) {
    redirectWithError('/dashboard/requests', parsed.error.issues[0]?.message ?? 'Invalid input.');
  }
  const { courseId, topic, preferredTimes } = parsed.data;

  const course = db.courses.find((c) => c.id === courseId);
  if (!course) {
    redirectWithError('/dashboard/requests', 'Unknown course.');
  }

  db.helpRequests.push({
    id: nextId('helpRequests'),
    tuteeId: session.userId,
    courseId,
    topic,
    preferredTimes,
    status: 'open',
    createdAt: new Date().toISOString(),
  });
  save();
  revalidatePath('/dashboard/requests');
  redirectWithSuccess('/dashboard/requests', 'Help request submitted.');
}
