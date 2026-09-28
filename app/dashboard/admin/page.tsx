import { requireAdmin } from '@/lib/dal';
import { getAdminStats, listAllTutorsForAdmin } from '@/lib/queries';
import { verifyTutorAction } from '@/app/actions/admin';
import { Banner } from '@/components/banner';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const stats = getAdminStats();
  const tutors = listAllTutorsForAdmin();

  return (
    <div className="space-y-6">
      <Banner error={params.error} success={params.success} />
      <h2 className="text-lg font-semibold text-slate-900">Admin</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm">
            <div className="text-xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500">{key}</div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Tutor Profiles</h3>
        {tutors.length === 0 && <p className="text-sm italic text-slate-500">No tutor profiles yet.</p>}
        {tutors.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h4 className="font-medium text-slate-900">
                {t.tutorName} — {t.courseCode}
              </h4>
              <p className="text-sm text-slate-500">{t.tutorEmail}</p>
              <span className={t.verified ? 'badge badge-verified' : 'badge badge-unverified'}>
                {t.verified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <form action={verifyTutorAction}>
              <input type="hidden" name="profileId" value={t.id} />
              <input type="hidden" name="verified" value={t.verified ? 'false' : 'true'} />
              <button type="submit" className="btn-primary">
                {t.verified ? 'Unverify' : 'Verify'}
              </button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}
