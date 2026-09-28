import { verifySession } from '@/lib/dal';
import { listCourses, listTutorsForCourse } from '@/lib/queries';
import { bookSessionAction } from '@/app/actions/sessions';
import { Banner } from '@/components/banner';

export default async function FindTutorPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string; error?: string; success?: string }>;
}) {
  const session = await verifySession();
  const params = await searchParams;
  const courses = listCourses();
  const selectedCourseId = Number(params.courseId) || courses[0]?.id;
  const tutors = selectedCourseId
    ? listTutorsForCourse(selectedCourseId).filter((t) => t.userId !== session.userId)
    : [];

  return (
    <div className="space-y-6">
      <Banner error={params.error} success={params.success} />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Find a Tutor</h2>
        <form method="get" className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium text-slate-600">
            Course
            <select name="courseId" defaultValue={selectedCourseId} className="field-input">
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
      </section>

      <div className="space-y-4">
        {tutors.length === 0 && (
          <p className="text-sm italic text-slate-500">No tutors registered for this course yet.</p>
        )}
        {tutors.map((tutor) => (
          <div key={tutor.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{tutor.tutorName}</h3>
                <p className="text-sm text-slate-500">
                  {tutor.courseCode} — {tutor.courseName}
                </p>
              </div>
              <span className={tutor.verified ? 'badge badge-verified' : 'badge badge-unverified'}>
                {tutor.verified ? 'Verified' : 'Pending verification'}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{tutor.bio || '(no bio provided)'}</p>
            <p className="mt-1 text-sm text-slate-500">Availability: {tutor.availability}</p>
            <p className="mt-1 text-sm text-slate-500">
              {tutor.avgRating
                ? `★ ${tutor.avgRating} (${tutor.ratingCount} review${tutor.ratingCount === 1 ? '' : 's'})`
                : 'No ratings yet'}
            </p>
            <form action={bookSessionAction} className="mt-3 flex flex-wrap items-end gap-3">
              <input type="hidden" name="tutorId" value={tutor.userId} />
              <input type="hidden" name="courseId" value={tutor.courseId} />
              <label className="text-sm font-medium text-slate-600">
                Session time
                <input type="datetime-local" name="scheduledTime" required className="field-input" />
              </label>
              <button type="submit" className="btn-primary">
                Book Session
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
