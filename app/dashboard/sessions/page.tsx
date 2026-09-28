import { verifySession } from '@/lib/dal';
import { listMySessions } from '@/lib/queries';
import { submitFeedbackAction, updateSessionStatusAction } from '@/app/actions/sessions';
import { Banner } from '@/components/banner';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await verifySession();
  const params = await searchParams;
  const sessions = listMySessions(session.userId);

  return (
    <div className="space-y-6">
      <Banner error={params.error} success={params.success} />
      <h2 className="text-lg font-semibold text-slate-900">My Sessions</h2>

      {sessions.length === 0 && (
        <p className="text-sm italic text-slate-500">No sessions yet — book one from &quot;Find a Tutor&quot;.</p>
      )}

      <div className="space-y-4">
        {sessions.map((s) => {
          const isTutor = s.tutorId === session.userId;
          return (
            <div key={s.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {s.courseCode} — {s.courseName}
                  </h3>
                  <p className="text-sm text-slate-500">
                    With {isTutor ? s.tuteeName : s.tutorName} ({isTutor ? 'you are tutoring' : 'you are learning'})
                  </p>
                  <p className="text-sm text-slate-500">Scheduled: {formatDate(s.scheduledTime)}</p>
                </div>
                <span className="badge badge-status capitalize">{s.status}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {s.status === 'pending' && (
                  <>
                    <form action={updateSessionStatusAction}>
                      <input type="hidden" name="sessionId" value={s.id} />
                      <input type="hidden" name="status" value="confirmed" />
                      <button type="submit" className="btn-primary">
                        Confirm
                      </button>
                    </form>
                    <form action={updateSessionStatusAction}>
                      <input type="hidden" name="sessionId" value={s.id} />
                      <input type="hidden" name="status" value="cancelled" />
                      <button type="submit" className="btn-danger">
                        Cancel
                      </button>
                    </form>
                  </>
                )}
                {s.status === 'confirmed' && (
                  <>
                    <form action={updateSessionStatusAction}>
                      <input type="hidden" name="sessionId" value={s.id} />
                      <input type="hidden" name="status" value="completed" />
                      <button type="submit" className="btn-primary">
                        Mark Completed
                      </button>
                    </form>
                    <form action={updateSessionStatusAction}>
                      <input type="hidden" name="sessionId" value={s.id} />
                      <input type="hidden" name="status" value="cancelled" />
                      <button type="submit" className="btn-danger">
                        Cancel
                      </button>
                    </form>
                  </>
                )}
              </div>

              {s.status === 'completed' && !isTutor && !s.feedback && (
                <form
                  action={submitFeedbackAction}
                  className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4"
                >
                  <input type="hidden" name="sessionId" value={s.id} />
                  <label className="text-sm font-medium text-slate-600">
                    Rating
                    <select name="rating" defaultValue="5" className="field-input">
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} star{n === 1 ? '' : 's'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="min-w-[200px] flex-1 text-sm font-medium text-slate-600">
                    Comment
                    <input type="text" name="comment" placeholder="Optional" className="field-input" />
                  </label>
                  <button type="submit" className="btn-primary">
                    Leave Feedback
                  </button>
                </form>
              )}

              {s.feedback && (
                <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
                  Feedback: ★ {s.feedback.rating} — {s.feedback.comment || '(no comment)'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
