'use server';

import { revalidatePath } from 'next/cache';
import { db, save, nextId } from '@/lib/db';
import { verifySession } from '@/lib/dal';
import { TutorProfileSchema } from '@/lib/validation';
import { redirectWithError, redirectWithSuccess } from '@/lib/action-helpers';

export async function upsertTutorProfileAction(formData: FormData): Promise<void> {
  const session = await verifySession();
  const parsed = TutorProfileSchema.safeParse({
    courseId: formData.get('courseId'),
    bio: formData.get('bio'),
    availability: formData.get('availability'),
  });
  if (!parsed.success) {
    redirectWithError('/dashboard/tutor', parsed.error.issues[0]?.message ?? 'Invalid input.');
  }
  const { courseId, bio, availability } = parsed.data;

  const course = db.courses.find((c) => c.id === courseId);
  if (!course) {
    redirectWithError('/dashboard/tutor', 'Unknown course.');
  }

  const existing = db.tutorProfiles.find(
    (p) => p.userId === session.userId && p.courseId === courseId
  );
  if (existing) {
    existing.bio = bio;
    existing.availability = availability;
  } else {
    db.tutorProfiles.push({
      id: nextId('tutorProfiles'),
      userId: session.userId,
      courseId,
      bio,
      availability,
      verified: false,
      createdAt: new Date().toISOString(),
    });
  }
  save();
  revalidatePath('/dashboard/tutor');
  revalidatePath('/dashboard');
  redirectWithSuccess('/dashboard/tutor', 'Tutor profile saved.');
}
