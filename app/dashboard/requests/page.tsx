import { verifySession } from '@/lib/dal';
import { listCourses, listMyHelpRequests } from '@/lib/queries';
import { createHelpRequestAction } from '@/app/actions/requests';
import { Banner } from '@/components/banner';

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await verifySession();
  const params = await searchParams;
  const courses = listCourses();
  const myRequests = listMyHelpRequests(session.userId);

  return (
    <div className="space-y-6">
      <Banner error={params.error} success={params.success} />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Request Help</h2>
        <form action={createHelpRequestAction} className="mt-3 space-y-3">
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
            Topic
            <input type="text" name="topic" required placeholder="e.g. Big-O notation" className="field-input" />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            Preferred times
            <input type="text" name="preferredTimes" placeholder="e.g. Weekday evenings" className="field-input" />
          </label>
          <button type="submit" className="btn-primary">
            Submit Request
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">My Requests</h3>
        {myRequests.length === 0 && (
          <p className="text-sm italic text-slate-500">You haven&apos;t requested help yet.</p>
        )}
        {myRequests.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h4 className="font-medium text-slate-900">
                {r.courseCode} — {r.topic}
              </h4>
              <p className="mt-1 text-sm text-slate-500">Preferred times: {r.preferredTimes || 'any time'}</p>
            </div>
            <span className="badge badge-status capitalize">{r.status}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
