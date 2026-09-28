import { verifySession } from '@/lib/dal';
import { listCourses, listMyTutorProfiles } from '@/lib/queries';
import { upsertTutorProfileAction } from '@/app/actions/tutors';
import { Banner } from '@/components/banner';

export default async function TutorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await verifySession();
  const params = await searchParams;
  const courses = listCourses();
  const myProfiles = listMyTutorProfiles(session.userId);

  return (
    <div className="space-y-6">
      <Banner error={params.error} success={params.success} />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Register as a Tutor</h2>
        <form action={upsertTutorProfileAction} className="mt-3 space-y-3">
          <label className="block text-sm font-medium text-slate-600">
            Course
            <select name="courseId" className="field-input">
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Bio
            <textarea
              name="bio"
              rows={3}
              placeholder="e.g. Scored an A, happy to help with recursion and sorting"
              className="field-input"
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Availability
            <input type="text" name="availability" required placeholder="e.g. Mon/Wed 5-7pm" className="field-input" />
          </label>
          <button type="submit" className="btn-primary">
            Save Tutor Profile
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">My Tutor Profiles</h3>
        {myProfiles.length === 0 && (
          <p className="text-sm italic text-slate-500">You haven&apos;t registered as a tutor for any course yet.</p>
        )}
        {myProfiles.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h4 className="font-medium text-slate-900">
                {p.courseCode} — {p.courseName}
              </h4>
              <p className="mt-1 text-sm text-slate-600">{p.bio || '(no bio)'}</p>
              <p className="mt-1 text-sm text-slate-500">Availability: {p.availability}</p>
            </div>
            <span className={p.verified ? 'badge badge-verified' : 'badge badge-unverified'}>
              {p.verified ? 'Verified' : 'Pending verification'}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
