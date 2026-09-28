'use server';

import { revalidatePath } from 'next/cache';
import { db, save } from '@/lib/db';
import { requireAdmin } from '@/lib/dal';
import { redirectWithError, redirectWithSuccess } from '@/lib/action-helpers';

export async function verifyTutorAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const profileId = Number(formData.get('profileId'));
  const verified = formData.get('verified') === 'true';

  const profile = db.tutorProfiles.find((p) => p.id === profileId);
  if (!profile) {
    redirectWithError('/dashboard/admin', 'Tutor profile not found.');
  }
  profile.verified = verified;
  save();
  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard');
  redirectWithSuccess('/dashboard/admin', verified ? 'Tutor verified.' : 'Tutor unverified.');
}
